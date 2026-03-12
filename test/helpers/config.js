const KcAdmClient = require('@keycloak/keycloak-admin-client').default;

/**
 * Simple delay function
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * PropertiesManager Configuration
 * 
 * Structure:
 *   config/default.json  - Base configuration (committed, safe values)
 *   config/local.json    - Local overrides (git-ignored, auto-generated from Docker)
 *   config/secrets.json  - Sensitive data (git-ignored, credentials)
 * 
 * Priority (highest to lowest):
 *   1. Environment variables (PM_KEYCLOAK_BASE_URL=...)
 *   2. Command line (--keycloak.baseUrl=...)
 *   3. config/secrets.json
 *   4. config/local.json (auto-generated from Docker container)
 *   5. config/default.json
 * 
 * Note: local.json is automatically created from Docker container configuration
 *       when tests start up (see helpers/docker-helpers.js:updateConfigFromDocker)
 */

let TEST_CONFIG = null;
let adminClient = null;
let propertiesLoaded = false;

/**
 * Reset configuration cache (call when local.json is updated)
 */
function resetConfig() {
  TEST_CONFIG = null;
  delete require.cache[require.resolve('propertiesmanager')];
  propertiesLoaded = false;
}

/**
 * Loads configuration from propertiesmanager
 * Called lazily to ensure local.json is created from Docker first
 */
function loadConfig() {
  if (TEST_CONFIG) {
    return TEST_CONFIG;
  }

  // Load propertiesmanager only when needed (after local.json is created)
  // Using delete + require to force fresh load
  if (propertiesLoaded) {
    // Force reload by clearing cache
    delete require.cache[require.resolve('propertiesmanager')];
  }
  
  const { conf } = require('propertiesmanager');
  propertiesLoaded = true;

  TEST_CONFIG = {
    baseUrl: conf.keycloak?.baseUrl || 'http://localhost:8080',
    realmName: conf.keycloak?.realm || 'master',
    username: conf.keycloak?.adminUsername || 'admin',
    password: conf.keycloak?.adminPassword || 'admin',
    clientId: conf.keycloak?.clientId || 'admin-cli',
    clientSecret: conf.keycloak?.clientSecret,
    grantType: conf.keycloak?.grantType || 'password',
  };

  console.log('\n📍 Keycloak Configuration (from propertiesmanager):');
  console.log(`   Environment: ${process.env.NODE_ENV || 'test'}`);
  console.log(`   Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`   Realm: ${TEST_CONFIG.realmName}`);
  console.log(`   ` + `Client ID: ${TEST_CONFIG.clientId}`);
  console.log(`   Grant Type: ${TEST_CONFIG.grantType}\n`);

  return TEST_CONFIG;
}

/**
 * Initializes the Keycloak admin client.
 * Waits until Keycloak is ready before connecting.
 */
async function initializeAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  // Load configuration (after local.json has been created from Docker)
  const config = loadConfig();

  // Retry loop is intentionally generous to tolerate container cold-start time.
  let retries = 30;
  let lastError;

  while (retries > 0) {
    try {
      adminClient = new KcAdmClient({
        baseUrl: config.baseUrl,
        realmName: config.realmName,
      });

      await adminClient.auth({
        username: config.username,
        password: config.password,
        clientId: config.clientId,
        grantType: config.grantType,
      });

      console.log('✓ Keycloak admin client initialized');
      return adminClient;
    } catch (err) {
      lastError = err;
      retries--;
      if (retries > 0) {
        // Keycloak may still be booting; wait and retry.
        console.log(`Waiting for Keycloak... (${retries} retries left)`);
        await delay(2000);
      } else {
        // Last attempt: print as much OAuth2 context as possible for diagnostics.
        console.error('OAuth2 Error Details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: config.baseUrl
        });
      }
    }
  }

  throw new Error(`Failed to connect to Keycloak after retries: ${lastError.message}`);
}

/**
 * Creates the test realm.
 */
async function setupTestRealm() {
  const client = await initializeAdminClient();
  const config = loadConfig();

  // Switch to the master realm to create the test realm
  client.realmName = 'master';

  try {
    // Check if the realm already exists
    const realms = await client.realms.find();
    const realmExists = realms.some((r) => r.realm === config.realmName);

    if (!realmExists) {
      // Keep realm defaults explicit so tests behave consistently across environments.
      await client.realms.create({
        realm: config.realmName,
        displayName: 'Test Realm',
        enabled: true,
        accessTokenLifespan: 3600,
        refreshTokenMaxReuse: 0,
        actionTokenGeneratedByAdminLifespan: 900,
        actionTokenGeneratedByUserLifespan: 900,
      });
      console.log(`✓ Test realm '${config.realmName}' created`);
    } else {
      console.log(`✓ Test realm '${config.realmName}' already exists`);
    }
  } catch (err) {
    // 409 means the realm already exists, which is acceptable for idempotent setup.
    if (err.response?.status === 409) {
      console.log(`✓ Test realm '${config.realmName}' already exists`);
    } else {
      throw err;
    }
  }

  // Switch back to the test realm
  client.realmName = config.realmName;
}

/**
 * Cleans up the test realm.
 */
async function cleanupTestRealm() {
  if (!adminClient) return;

  const config = loadConfig();

  try {
    adminClient.realmName = 'master';
    await adminClient.realms.del({ realm: config.realmName });
    console.log(`✓ Test realm '${config.realmName}' deleted`);
  } catch (err) {
    // Ignore not-found during cleanup to keep teardown idempotent.
    if (err.response?.status !== 404) {
      console.warn(`Warning: Failed to delete test realm: ${err.message}`);
    }
  }
}

/**
 * Returns the configured and authenticated admin client.
 */
function getAdminClient() {
  if (!adminClient) {
    throw new Error('Admin client not initialized. Call initializeAdminClient() first');
  }
  return adminClient;
}

/**
 * Resets the admin client (mainly for tests).
 */
function resetAdminClient() {
  adminClient = null;
  TEST_CONFIG = null; // Reset config too for fresh reload
}

module.exports = {
  loadConfig,
  initializeAdminClient,
  setupTestRealm,
  cleanupTestRealm,
  getAdminClient,
  resetAdminClient,
  resetConfig,
};
