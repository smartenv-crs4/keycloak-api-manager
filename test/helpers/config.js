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
 * Inizializza il client Keycloak admin
 * Aspetta che Keycloak sia pronto prima di connettersi
 */
async function initializeAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  // Load configuration (after local.json has been created from Docker)
  const config = loadConfig();

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
        console.log(`Waiting for Keycloak... (${retries} retries left)`);
        await delay(2000);
      }
    }
  }

  throw new Error(`Failed to connect to Keycloak after retries: ${lastError.message}`);
}

/**
 * Crea il realm di test
 */
async function setupTestRealm() {
  const client = await initializeAdminClient();
  const config = loadConfig();

  // Switcha a master realm per creare il test realm
  client.realmName = 'master';

  try {
    // Controlla se il realm esiste già
    const realms = await client.realms.find();
    const realmExists = realms.some((r) => r.realm === config.realmName);

    if (!realmExists) {
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
    if (err.response?.status === 409) {
      console.log(`✓ Test realm '${config.realmName}' already exists`);
    } else {
      throw err;
    }
  }

  // Switcha back al test realm
  client.realmName = config.realmName;
}

/**
 * Pulisce il realm di test
 */
async function cleanupTestRealm() {
  if (!adminClient) return;

  const config = loadConfig();

  try {
    adminClient.realmName = 'master';
    await adminClient.realms.del({ realm: config.realmName });
    console.log(`✓ Test realm '${config.realmName}' deleted`);
  } catch (err) {
    if (err.response?.status !== 404) {
      console.warn(`Warning: Failed to delete test realm: ${err.message}`);
    }
  }
}

/**
 * Ritorna il client admin configurato e autenticato
 */
function getAdminClient() {
  if (!adminClient) {
    throw new Error('Admin client not initialized. Call initializeAdminClient() first');
  }
  return adminClient;
}

/**
 * Reset del client (principalmente per i test)
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
};
