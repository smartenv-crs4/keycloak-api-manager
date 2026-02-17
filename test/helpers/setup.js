/**
 * Mocha Root Setup Hook
 * Orchestrates Docker container lifecycle and Keycloak initialization
 */

const { startDocker, stopDocker, waitForHealthy, updateConfigFromDocker } = require('./docker-helpers');
const { initializeAdminClient, setupTestRealm, cleanupTestRealm } = require('./config');

// Root hook plugin for Mocha
exports.mochaHooks = {
  async beforeAll() {
    this.timeout(120000); // 2 minutes max for setup

    console.log('\n========== TEST SETUP ==========');
    console.log('Starting Docker containers...');

    try {
      // Start Docker Compose
      await startDocker();

      // Wait for services to be healthy
      await waitForHealthy();

      // Update configuration from Docker container
      await updateConfigFromDocker();

      // Initialize Keycloak admin client
      await initializeAdminClient();

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

    try {
      // Cleanup Keycloak test realm
      await cleanupTestRealm();

      // Stop Docker Compose
      await stopDocker();

      console.log('✓ Test environment cleaned up\n');
    } catch (err) {
      console.error('✗ Test teardown failed:', err.message);
      // Don't throw during cleanup to allow partial cleanup
    }
  },
};
