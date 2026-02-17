const docker = require('dockerode');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Simple delay function
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute command locally or remotely via SSH (using ssh-agent for auth)
 */
function executeCommandOutput(command) {
  return new Promise((resolve, reject) => {
    const sshHost = process.env.DOCKER_SSH_HOST;
    
    if (!sshHost) {
      // Local execution
      exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    } else {
      // Remote SSH execution - uses SSH key directly
      const sshUser = process.env.DOCKER_SSH_USER || 'smart';
      const homeDir = require('os').homedir();
      const keyPath = `${homeDir}/.ssh/id_ed25519`;
      const sshCommand = `ssh -i ${keyPath} -o StrictHostKeyChecking=no -o PasswordAuthentication=no ${sshUser}@${sshHost} "${command}"`;
      
      exec(sshCommand, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    }
  });
}

/**
 * Updates local.json with Docker container configuration
 */
async function updateConfigFromDocker() {
  try {
    const sshHost = process.env.DOCKER_SSH_HOST;
    
    if (sshHost) {
      // Remote Docker - get config via SSH commands
      console.log('📡 Reading Keycloak config from remote Docker...');
      
      // Get container info via docker inspect using fixed name
      const containerInfo = await executeCommandOutput(
        'docker inspect keycloak-test 2>/dev/null || echo "[]"'
      );
      
      if (containerInfo === '[]' || !containerInfo) {
        console.log('⚠ keycloak-test container not found on remote host');
        return;
      }

      const containers = JSON.parse(containerInfo);
      if (containers.length === 0) {
        console.log('⚠ No Keycloak container found');
        return;
      }

      const container = containers[0];
      
      // Extract environment variables
      const env = {};
      (container.Config?.Env || []).forEach((envVar) => {
        const [key, value] = envVar.split('=');
        env[key] = value;
      });

      // Get mapped port - use remote host
      const portBindings = container.NetworkSettings?.Ports?.['8080/tcp'];
      const hostPort = portBindings?.[0]?.HostPort || '8080';
      const baseUrl = `http://${sshHost}:${hostPort}`;

      // Build config object
      const config = {
        test: {
          keycloak: {
            baseUrl,
            realm: 'master',
            clientId: 'admin-cli',
            grantType: 'password',
            adminUsername: env.KC_BOOTSTRAP_ADMIN_USERNAME || env.KEYCLOAK_ADMIN || 'admin',
            adminPassword: env.KC_BOOTSTRAP_ADMIN_PASSWORD || env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
          },
        },
      };

      // Write to local.json
      const configPath = path.join(__dirname, '../config/local.json');
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      console.log('✓ Updated local.json with remote Docker config:');
      console.log(`  Base URL: ${baseUrl}`);
      console.log(`  Admin User: ${config.test.keycloak.adminUsername}`);
      
    } else {
      // Local Docker - original logic
      const dockerode = new docker();
      const containers = await dockerode.listContainers();
      const keycloakContainer = containers.find((c) => c.Names.includes('/keycloak-test'));

      if (!keycloakContainer) {
        console.log('⚠ Keycloak container not found, using default config');
        return;
      }

      const container = dockerode.getContainer(keycloakContainer.Id);
      const inspect = await container.inspect();

      // Extract configuration from container
      const env = inspect.Config.Env.reduce((acc, envVar) => {
        const [key, value] = envVar.split('=');
        acc[key] = value;
        return acc;
      }, {});

      // Get mapped port
      const portBindings = inspect.NetworkSettings.Ports['8080/tcp'];
      const hostPort = portBindings?.[0]?.HostPort || '8080';
      const hostIp = portBindings?.[0]?.HostIp || '0.0.0.0';
      const baseUrl = `http://localhost:${hostPort}`;

      // Build config object
      const config = {
        test: {
          keycloak: {
            baseUrl,
            realm: 'master',
            clientId: 'admin-cli',
            grantType: 'password',
            adminUsername: env.KC_BOOTSTRAP_ADMIN_USERNAME || env.KEYCLOAK_ADMIN || 'admin',
            adminPassword: env.KC_BOOTSTRAP_ADMIN_PASSWORD || env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
          },
        },
      };

      // Write to local.json
      const configPath = path.join(__dirname, '../config/local.json');
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      console.log('✓ Updated local.json with Docker container config:');
      console.log(`  Base URL: ${baseUrl}`);
      console.log(`  Admin User: ${config.test.keycloak.adminUsername}`);
    }
  } catch (err) {
    console.log(`⚠ Failed to update config from Docker: ${err.message}`);
    console.log('  Using default configuration');
  }
}

/**
 * Starts Docker Compose services (or runs Keycloak container if no compose)
 */
async function startDocker() {
  const sshHost = process.env.DOCKER_SSH_HOST;
  
  console.log(sshHost ? '📡 Starting Keycloak on remote host...' : 'Starting Docker Compose services...');

  if (sshHost) {
    // Remote Docker - use docker run instead of compose
    const sshUser = process.env.DOCKER_SSH_USER || 'smart';
    return new Promise((resolve, reject) => {
      const commands = [
        // Check if container already exists and stop it
        `docker stop keycloak-test 2>/dev/null || true`,
        `docker rm keycloak-test 2>/dev/null || true`,
        // Pull latest Keycloak image
        `docker pull quay.io/keycloak/keycloak:latest`,
        // Run container with health check
        `docker run -d --name keycloak-test -p 0.0.0.0:8080:8080 \\
          -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \\
          -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \\
          -e KC_HEALTH_ENABLED=true \\
          -e KC_HOSTNAME=smart-dell-sml.crs4.it \\
          -e KC_SCHEME=http \\
          -e KC_HTTP_PORT=8080 \\
          -e KC_HOSTNAME_STRICT_HTTPS=false \\
          quay.io/keycloak/keycloak:latest \\
          start-dev`,
      ].join(' && ');
      
      const homeDir = require('os').homedir();
      const keyPath = `${homeDir}/.ssh/id_ed25519`;
      const sshCommand = `ssh -i ${keyPath} -o StrictHostKeyChecking=no -o PasswordAuthentication=no ${sshUser}@${sshHost} "${commands.replace(/"/g, '\\"')}"`;
      
      console.log(`  🔗 Connecting to ${sshUser}@${sshHost}...`);
      console.log('  ⬇️  Downloading Keycloak image & starting container...');
      
      const ssh = spawn('sh', ['-c', sshCommand], {
        stdio: 'inherit',
      });

      ssh.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Remote docker run failed with code ${code}`));
        } else {
          console.log('✓ Keycloak container started on remote host');
          resolve();
        }
      });

      ssh.on('error', reject);
    });
  } else {
    // Local Docker - original logic
    return new Promise((resolve, reject) => {
      const command = 'docker';
      const args = ['compose', 'up', '-d'];

      const compose = spawn(command, args, {
        cwd: process.cwd(),
        stdio: 'inherit',
      });

      compose.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`docker compose up failed with code ${code}`));
        } else {
          console.log('✓ Docker Compose services started');
          resolve();
        }
      });

      compose.on('error', reject);
    });
  }
}

/**
 * Stops Docker Compose services (or removes Keycloak container)
 */
async function stopDocker() {
  const sshHost = process.env.DOCKER_SSH_HOST;
  
  console.log(sshHost ? '📡 Stopping Keycloak on remote host...' : 'Stopping Docker Compose services...');

  if (sshHost) {
    // Remote Docker - stop and remove container
    const sshUser = process.env.DOCKER_SSH_USER || 'smart';
    return new Promise((resolve, reject) => {
      const commands = [
        `docker stop keycloak-test 2>/dev/null || true`,
        `docker rm keycloak-test 2>/dev/null || true`,
      ].join(' && ');
      
      const homeDir = require('os').homedir();
      const keyPath = `${homeDir}/.ssh/id_ed25519`;
      const sshCommand = `ssh -i ${keyPath} -o StrictHostKeyChecking=no -o PasswordAuthentication=no ${sshUser}@${sshHost} "${commands}"`;
      
      console.log(`  🔗 Connecting to ${sshUser}@${sshHost}...`);
      
      const ssh = spawn('sh', ['-c', sshCommand], {
        stdio: 'inherit',
      });

      ssh.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Remote docker stop failed with code ${code}`));
        } else {
          console.log('✓ Keycloak container stopped on remote host');
          resolve();
        }
      });

      ssh.on('error', reject);
    });
  } else {
    // Local Docker - original logic
    return new Promise((resolve, reject) => {
      const command = 'docker';
      const args = ['compose', 'down', '--volumes'];

      const compose = spawn(command, args, {
        cwd: process.cwd(),
        stdio: 'inherit',
      });

      compose.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`docker compose down failed with code ${code}`));
        } else {
          console.log('✓ Docker Compose services stopped');
          resolve();
        }
      });

      compose.on('error', reject);
    });
  }
}

/**
 * Waits for a service to be healthy
 */
async function waitForHealthy(maxRetries = 30, delayMs = 2000) {
  const sshHost = process.env.DOCKER_SSH_HOST;
  let retries = maxRetries;

  while (retries > 0) {
    try {
      if (sshHost) {
        // Remote Docker - check health via curl on root endpoint (returns 302 redirect when ready)
        const sshUser = process.env.DOCKER_SSH_USER || 'smart';
        const healthCheckCmd = `curl -sf -o /dev/null -w "%{http_code}" http://localhost:8080/`;
        const homeDir = require('os').homedir();
        const keyPath = `${homeDir}/.ssh/id_ed25519`;
        const sshCommand = `ssh -i ${keyPath} -o StrictHostKeyChecking=no -o PasswordAuthentication=no ${sshUser}@${sshHost} "${healthCheckCmd}"`;
        
        try {
          const result = await new Promise((resolve, reject) => {
            exec(sshCommand, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
              if (error) {
                reject(error);
              } else {
                resolve(stdout.trim());
              }
            });
          });
          
          // Keycloak returns 302 (redirect) when ready
          if (result === '302' || result === '200') {
            console.log('✓ Keycloak container is healthy');
            return;
          }
        } catch (err) {
          // Health check might fail, that's OK, we retry
        }

        retries--;
        if (retries > 0) {
          console.log(`Waiting for Keycloak to be healthy... (${retries} retries left)`);
          await delay(delayMs);
        }
      } else {
        // Local Docker - original logic
        const dockerode = new docker();
        const containers = await dockerode.listContainers();
        const keycloakContainer = containers.find((c) => c.Names.includes('/keycloak-test'));

        if (!keycloakContainer) {
          throw new Error('Keycloak container not found');
        }

        const container = dockerode.getContainer(keycloakContainer.Id);
        const inspect = await container.inspect();

        if (inspect.State.Health?.Status === 'healthy') {
          console.log('✓ Keycloak container is healthy');
          return;
        }

        retries--;
        if (retries > 0) {
          console.log(
            `Waiting for Keycloak to be healthy (${inspect.State.Health?.Status || 'unknown'})... (${retries} retries left)`
          );
          await delay(delayMs);
        }
      }
    } catch (err) {
      retries--;
      if (retries > 0) {
        console.log(`Waiting for services... (${retries} retries left)`);
        await delay(delayMs);
      } else {
        throw err;
      }
    }
  }

  throw new Error('Service failed to become healthy in time');
}

/**
 * Create SSH tunnel for remote Keycloak access via localhost
 * Allows HTTP access without HTTPS enforcement
 */
let sshTunnelProcess = null;

async function createSSHTunnel() {
  return new Promise((resolve, reject) => {
    const sshHost = process.env.DOCKER_SSH_HOST;
    if (!sshHost) {
      resolve(null);
      return;
    }

    const sshUser = process.env.DOCKER_SSH_USER || 'smart';
    const localPort = 9999;
    const remoteHost = 'localhost';
    const remotePort = 8080;
    const homeDir = require('os').homedir();
    const keyPath = `${homeDir}/.ssh/id_ed25519`;

    const tunnelCommand = [
      'ssh',
      '-i', keyPath,
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'PasswordAuthentication=no',
      '-N',
      '-L', `127.0.0.1:${localPort}:${remoteHost}:${remotePort}`,
      `${sshUser}@${sshHost}`
    ];

    console.log(`🔗 Creating SSH tunnel to ${sshHost}:${remotePort} -> 127.0.0.1:${localPort}...`);
    
    sshTunnelProcess = spawn(tunnelCommand[0], tunnelCommand.slice(1), {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    sshTunnelProcess.on('error', (err) => {
      reject(new Error(`Failed to create SSH tunnel: ${err.message}`));
    });

    sshTunnelProcess.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) console.log(`🔗 SSH tunnel: ${msg}`);
    });

    // Give tunnel time to establish
    setTimeout(() => {
      if (sshTunnelProcess.exitCode !== null) {
        reject(new Error('SSH tunnel process exited unexpectedly'));
      } else {
        console.log(`✓ SSH tunnel established on 127.0.0.1:${localPort}`);
        resolve(`127.0.0.1:${localPort}`);
      }
    }, 2000);
  });
}

/**
 * Close SSH tunnel
 */
function closeSSHTunnel() {
  if (sshTunnelProcess) {
    sshTunnelProcess.kill('SIGTERM');
    sshTunnelProcess = null;
    console.log('✓ SSH tunnel closed');
  }
}

module.exports = {
  startDocker,
  stopDocker,
  waitForHealthy,
  updateConfigFromDocker,
  createSSHTunnel,
  closeSSHTunnel,
};
