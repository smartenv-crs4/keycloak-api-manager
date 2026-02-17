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
 * Execute command locally or remotely via SSH
 */
function executeCommandOutput(command) {
  return new Promise((resolve, reject) => {
    const sshHost = process.env.DOCKER_SSH_HOST;
    
    let fullCommand = command;
    
    if (sshHost) {
      const sshUser = process.env.DOCKER_SSH_USER || process.env.USER;
      fullCommand = `ssh ${sshUser}@${sshHost} "${command}"`;
      console.log(`  🔗 Remote SSH: ${sshUser}@${sshHost}`);
    }

    exec(fullCommand, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
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
      
      // Get container info via docker inspect
      const containerInfo = await executeCommandOutput(
        'docker inspect $(docker ps -qf "name=keycloak") 2>/dev/null || echo "[]"'
      );
      
      if (containerInfo === '[]' || !containerInfo) {
        console.log('⚠ keycloak container not found on remote host');
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
            adminUsername: env.KEYCLOAK_ADMIN || 'admin',
            adminPassword: env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
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
            adminUsername: env.KEYCLOAK_ADMIN || 'admin',
            adminPassword: env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
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
 * Starts Docker Compose services
 */
async function startDocker() {
  const sshHost = process.env.DOCKER_SSH_HOST;
  
  console.log(sshHost ? '📡 Starting Docker Compose on remote host...' : 'Starting Docker Compose services...');

  if (sshHost) {
    // Remote Docker - execute via SSH
    const sshUser = process.env.DOCKER_SSH_USER || process.env.USER;
    return new Promise((resolve, reject) => {
      const command = `ssh ${sshUser}@${sshHost} "cd keycloak-docker && docker compose up -d"`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Remote docker compose up failed: ${error.message}`));
        } else {
          console.log('✓ Docker Compose services started on remote host');
          resolve();
        }
      });
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
 * Stops Docker Compose services
 */
async function stopDocker() {
  const sshHost = process.env.DOCKER_SSH_HOST;
  
  console.log(sshHost ? '📡 Stopping Docker Compose on remote host...' : 'Stopping Docker Compose services...');

  if (sshHost) {
    // Remote Docker - execute via SSH
    const sshUser = process.env.DOCKER_SSH_USER || process.env.USER;
    return new Promise((resolve, reject) => {
      const command = `ssh ${sshUser}@${sshHost} "cd keycloak-docker && docker compose down --volumes"`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Remote docker compose down failed: ${error.message}`));
        } else {
          console.log('✓ Docker Compose services stopped on remote host');
          resolve();
        }
      });
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
        // Remote Docker - check health via SSH
        const sshUser = process.env.DOCKER_SSH_USER || process.env.USER;
        const healthStatus = await executeCommandOutput(
          'docker inspect $(docker ps -qf "name=keycloak") | jq -r \'.[0].State.Health.Status\''
        );

        if (healthStatus === 'healthy') {
          console.log('✓ Keycloak container is healthy');
          return;
        }

        retries--;
        if (retries > 0) {
          console.log(`Waiting for Keycloak to be healthy (${healthStatus || 'unknown'})... (${retries} retries left)`);
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

module.exports = {
  startDocker,
  stopDocker,
  waitForHealthy,
  updateConfigFromDocker,
};
