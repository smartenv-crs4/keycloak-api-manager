/**
 * Global Test Setup - Mocha Hooks
 * 
 * This file is loaded by Mocha before any tests run (configured in .mocharc.json).
 * 
 * Purpose:
 * - Creates shared test realm infrastructure once before all tests
 * - Avoids repeated realm creation/deletion, improving test performance by ~5x
 * - Ensures consistent test environment across all test suites
 * - Automatically creates SSH tunnel if direct connection fails
 * 
 * What gets created:
 * - Test realm (keycloak-api-manager-test-realm)
 * - Test client with proper configuration
 * - Test user with credentials
 * - Test roles (test-role-1, test-role-2, test-admin-role)
 * - Test group
 * - Test client scope
 * 
 * SSH Tunnel Retry Logic:
 * - First attempts direct connection to 127.0.0.1:9998
 * - If connection refused, automatically creates SSH tunnel to smart-dell-sml.crs4.it
 * - If SSH tunnel also fails, provides troubleshooting steps
 * 
 * Note: Individual tests should create unique resources (e.g., user-${timestamp})
 * to avoid conflicts when multiple tests run in parallel or sequence.
 */

const enableServerFeatures = require('./enableServerFeatures');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const keycloakManager = require('../../index');

let sshTunnelProcess = null;

/**
 * Create SSH tunnel for Keycloak access
 */
function createSSHTunnelSimple() {
  return new Promise((resolve, reject) => {
    const sshUser = 'smart';
    const sshHost = 'smart-dell-sml.crs4.it';
    const localPort = 9998;
    const remotePort = 8080;
    const homeDir = os.homedir();
    const keyPath = `${homeDir}/.ssh/id_ed25519`;
    
    // Create tunnel in background
    const cmd = `ssh -fN -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -L 127.0.0.1:${localPort}:127.0.0.1:${remotePort} -i ${keyPath} ${sshUser}@${sshHost}`;
    
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`SSH tunnel failed: ${err.message}`));
      } else {
        // Give tunnel time to establish
        setTimeout(() => resolve(`127.0.0.1:${localPort}`), 500);
      }
    });
  });
}

// Global before hook - runs once before all test suites
before(async function() {
    // Increase timeout - realm creation may take 10-20 seconds
    this.timeout(120000);
    
    console.log('\n=== Running global test setup ===\n');
    
    try {
        await enableServerFeatures();
    } catch (err) {
        // Extract the root cause message (might be nested in error chain)
        let rootMessage = err.message || '';
        let currentErr = err;
        while (currentErr?.cause) {
            currentErr = currentErr.cause;
            rootMessage = currentErr.message || rootMessage;
        }
        
        // Check if connection was refused on 127.0.0.1:9998
        if (rootMessage.includes('ECONNREFUSED') && rootMessage.includes('127.0.0.1:9998')) {
            console.log('\n⚠ Direct connection failed (ECONNREFUSED on 127.0.0.1:9998)');
            console.log('  Attempting to create SSH tunnel to smart-dell-sml.crs4.it...\n');
            
            try {
                // Create SSH tunnel
                const sshTunnelUrl = await createSSHTunnelSimple();
                
                if (sshTunnelUrl) {
                    console.log(`✓ SSH tunnel created: http://${sshTunnelUrl}\n`);
                    
                    // Update config to use tunnel
                    const configPath = path.join(__dirname, '../config/local.json');
                    let config = {};
                    
                    if (fs.existsSync(configPath)) {
                        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    }
                    
                    if (!config.test) config.test = {};
                    if (!config.test.keycloak) config.test.keycloak = {};
                    config.test.keycloak.baseUrl = `http://${sshTunnelUrl}`;
                    
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                    console.log(`✓ Updated test/config/local.json to use SSH tunnel\n`);
                    
                    // Clear propertiesmanager cache and retry
                    delete require.cache[require.resolve('propertiesmanager')];
                    
                    // Retry setup
                    await enableServerFeatures();
                    sshTunnelProcess = sshTunnelUrl; // Mark that we created a tunnel
                } else {
                    throw new Error('SSH tunnel creation returned null');
                }
            } catch (tunnelErr) {
                console.error('\n✗ SSH tunnel connection failed:');
                console.error(`  Error: ${tunnelErr.message}`);
                console.error('\nTroubleshooting steps:');
                console.error('  1. Verify SSH key exists: ls -la ~/.ssh/id_ed25519');
                console.error('  2. Verify SSH access: ssh -i ~/.ssh/id_ed25519 smart@smart-dell-sml.crs4.it echo OK');
                console.error('  3. Verify remote Keycloak is running on the server');
                console.error('  4. Try manual tunnel: ssh -L 127.0.0.1:9998:127.0.0.1:8080 smart@smart-dell-sml.crs4.it');
                console.error('\nTest execution cancelled.\n');
                throw new Error(`Failed to connect to Keycloak. Direct connection (127.0.0.1:9998) failed and SSH tunnel creation also failed: ${tunnelErr.message}`);
            }
        } else {
            // Not a connection refused error - propagate as-is
            throw err;
        }
    }
    
    console.log('\n=== Global setup complete ===\n');
});

// Global after hook - cleanup test realm and SSH tunnel
after(async function() {
    this.timeout(60000);
    
    console.log('\n=== Running global test teardown ===\n');
    
    try {
        // Load test config to get realm name
        const { TEST_REALM } = require('./testConfig');
        
        // Delete test realm to restore server to initial state
        try {
            console.log(`Deleting test realm: ${TEST_REALM}`);
            await keycloakManager.realms.del({ realm: TEST_REALM });
            console.log(`✓ Test realm deleted: ${TEST_REALM}`);
        } catch (err) {
            if (err.message && err.message.includes('404')) {
                console.log(`⚠ Test realm already deleted or not found: ${TEST_REALM}`);
            } else {
                console.error(`⚠ Error deleting test realm: ${err.message}`);
            }
        }
        
        // Stop Keycloak admin client to close connections
        try {
            keycloakManager.stop();
            console.log('✓ Closed Keycloak admin client connection');
        } catch (err) {
            // Connection already closed or other state
            console.log('✓ Keycloak admin client stopped');
        }
        
        // Clean up SSH tunnel config file if it was created
        try {
            const configPath = path.join(__dirname, '../config/local.json');
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                // Only delete local.json if it contains SSH tunnel config
                if (config.test?.keycloak?.baseUrl?.includes('127.0.0.1:9998')) {
                    fs.unlinkSync(configPath);
                    console.log('✓ Cleaned up SSH tunnel config (test/config/local.json)');
                }
            }
        } catch (err) {
            console.log('⚠ Could not cleanup config file:', err.message);
        }
        
    } catch (err) {
        console.error('⚠ Error during test teardown:', err.message);
    }
    
    if (sshTunnelProcess) {
        console.log('✓ SSH tunnel will close automatically');
    }
    
    console.log('\n=== Global test teardown complete ===\n');
});
