const docker = require('dockerode');
const { spawn } = require('child_process');
const { delay } = require('async');
const fs = require('fs');
const path = require('path');

/**
 * Updates local.json with Docker container configuration
 */
async function updateConfigFromDocker() {
  try {
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
  } catch (err) {
    console.log(`⚠ Failed to update config from Docker: ${err.message}`);
    console.log('  Using default configuration');
  }
}

/**
 * Starts Docker Compose services
 */
async function startDocker() {
  console.log('Starting Docker Compose services...');

  return new Promise((resolve, reject) => {
    // Try docker compose (modern) or docker-compose (legacy)
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

/**
 * Stops Docker Compose services
 */
async function stopDocker() {
  console.log('Stopping Docker Compose services...');

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

/**
 * Waits for a service to be healthy
 */
async function waitForHealthy(maxRetries = 30, delayMs = 2000) {
  let retries = maxRetries;

  while (retries > 0) {
    try {
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
