/**
 * Mocha Root Setup Hook
 * Orchestrates Docker container lifecycle and Keycloak initialization
 */

const { startDocker, stopDocker, waitForHealthy, updateConfigFromDocker, createSSHTunnel, closeSSHTunnel } = require('./docker-helpers');
const { initializeAdminClient, setupTestRealm, cleanupTestRealm, resetConfig } = require('./config');

// Store tunnel state for cleanup
let sshTunnelUrl = null;

/**
 * Attempt to connect to Keycloak, with automatic SSH tunnel retry
 */
async function connectWithRetry() {
  try {
    console.log('Attempting Keycloak connection...');
    await initializeAdminClient();
    console.log('✓ Connected successfully to Keycloak\n');
  } catch (err) {
    // Check if connection was refused (tunnel might be needed)
    if (err.message && err.message.includes('ECONNREFUSED') && err.message.includes('127.0.0.1:9998')) {
      console.log('⚠ Direct connection failed (ECONNREFUSED on 127.0.0.1:9998)');
      console.log('  Attempting to create SSH tunnel to smart-dell-sml.crs4.it...\n');
      
      try {
        // Create SSH tunnel
        sshTunnelUrl = await createSSHTunnel();
        
        if (sshTunnelUrl) {
          console.log(`✓ SSH tunnel created: http://${sshTunnelUrl}`);
          
          // Update config to use tunnel
          const fs = require('fs');
          const path = require('path');
          const configPath = path.join(__dirname, '../config/local.json');
          
          // Create or update local.json
          let config = {};
          if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          }
          
          if (!config.test) config.test = {};
          if (!config.test.keycloak) config.test.keycloak = {};
          config.test.keycloak.baseUrl = `http://${sshTunnelUrl}`;
          
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          console.log(`✓ Updated config to use SSH tunnel\n`);
          
          // Reset config cache and retry connection
          resetConfig();
          await initializeAdminClient();
          console.log('✓ Connected successfully via SSH tunnel\n');
        } else {
          throw new Error('SSH tunnel creation failed - returned null');
        }
      } catch (tunnelErr) {
        console.error('✗ SSH tunnel connection failed:');
        console.error(`  Error: ${tunnelErr.message}`);
        console.error('\nTroubleshooting:');
        console.error('  1. Verify SSH key: ~/.ssh/id_ed25519 exists');
        console.error('  2. Verify remote host: smart-dell-sml.crs4.it is reachable');
        console.error('  3. Verify remote Keycloak: running on smart@smart-dell-sml.crs4.it');
        console.error('  4. Manual tunnel alternative: ssh -L 127.0.0.1:9998:127.0.0.1:8080 smart@smart-dell-sml.crs4.it');
        throw new Error(`Failed to connect to Keycloak. Direct connection (127.0.0.1:9998) failed and SSH tunnel creation also failed: ${tunnelErr.message}`);
      }
    } else {
      // Not a connection refused error - propagate as-is
      throw err;
    }
  }
}

// Root hook plugin for Mocha
exports.mochaHooks = {
  async beforeAll() {
    this.timeout(120000); // 2 minutes max for setup

    console.log('\n========== TEST SETUP ==========');

    if (process.env.SKIP_TEST_SETUP === 'true') {
      console.log('Skipping global test setup (SKIP_TEST_SETUP=true)\n');
      return;
    }

    // Check if using remote Keycloak (skip Docker)
    const useRemoteKeycloak = process.env.USE_REMOTE_KEYCLOAK === 'true';
    const useRemoteDocker = !!process.env.DOCKER_SSH_HOST;

    try {
      if (useRemoteKeycloak) {
        console.log('Using remote Keycloak (skip Docker startup)');
        console.log('Configuration from test/config/*.json files\n');
      } else if (useRemoteDocker) {
        console.log(`Starting Docker containers on remote host ${process.env.DOCKER_SSH_HOST}...`);
        
        // Start Docker Compose on remote host
        await startDocker();

        // Wait for services to be healthy on remote host
        await waitForHealthy();

        // Update configuration from remote Docker container
        await updateConfigFromDocker();

        // Create SSH tunnel for local HTTP access (avoids HTTPS enforcement)
        sshTunnelUrl = await createSSHTunnel();
        
        // Update config to use tunnel
        if (sshTunnelUrl) {
          const fs = require('fs');
          const path = require('path');
          const configPath = path.join(__dirname, '../config/local.json');
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          config.test.keycloak.baseUrl = `http://${sshTunnelUrl}`;
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          console.log(`✓ Updated config to use SSH tunnel: http://${sshTunnelUrl}`);
        }
        
        // Reset config cache so it reloads from updated local.json
        resetConfig();
      } else {
        console.log('Starting Docker containers locally...');
        
        // Start Docker Compose locally
        await startDocker();

        // Wait for services to be healthy locally
        await waitForHealthy();

        // Update configuration from local Docker container
        await updateConfigFromDocker();
      }

      // Connect to Keycloak (with automatic SSH tunnel retry if needed)
      await connectWithRetry();

      // Setup test realm
      await setupTestRealm();

      console.log('✓ Test environment ready\n');
    } catch (err) {
      console.error('✗ Test setup failed:', err.message);
      throw err;
    }
  },

  async afterAll() {
    this.timeout(60000); // 1 minute max for teardown

    console.log('\n========== TEST TEARDOWN ==========');

    if (process.env.SKIP_TEST_SETUP === 'true') {
      console.log('Skipping global test teardown (SKIP_TEST_SETUP=true)\n');
      return;
    }

    const useRemoteKeycloak = process.env.USE_REMOTE_KEYCLOAK === 'true';
    const useRemoteDocker = !!process.env.DOCKER_SSH_HOST;

    try {
      // Cleanup Keycloak test realm
      await cleanupTestRealm();

      // Close SSH tunnel if open
      if (sshTunnelUrl) {
        closeSSHTunnel();
        sshTunnelUrl = null;
      }

      // Stop Docker Compose only if using local or remote Docker (not pre-deployed)
      if (!useRemoteKeycloak && !useRemoteDocker) {
        await stopDocker();
      } else if (useRemoteDocker) {
        // Stop Docker on remote host
        await stopDocker();
      }

      console.log('✓ Test environment cleaned up\n');
    } catch (err) {
      console.error('✗ Test teardown failed:', err.message);
      // Don't throw during cleanup to allow partial cleanup
    }
  },
};
