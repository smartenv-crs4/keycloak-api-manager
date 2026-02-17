const KcAdmClient = require('@keycloak/keycloak-admin-client').default;
const { delay } = require('async');
const { conf } = require('propertiesmanager');

/**
 * PropertiesManager Configuration
 * 
 * Structure:
 *   config/default.json  - Base configuration (committed, safe values)
 *   config/local.json    - Local overrides (git-ignored, local values)
 *   config/secrets.json  - Sensitive data (git-ignored, credentials)
 * 
 * Priority (highest to lowest):
 *   1. Environment variables (PM_KEYCLOAK_BASE_URL=...)
 *   2. Command line (--keycloak.baseUrl=...)
 *   3. config/secrets.json
 *   4. config/local.json
 *   5. config/default.json
 * 
 * Usage:
 *   npm test                                                # Uses default + local + secrets config
 *   NODE_ENV=dev npm test                                  # Use dev environment config
 *   PM_KEYCLOAK_BASE_URL=http://remote:8080 npm test      # Override via environment variable
 *   npm test -- --keycloak.baseUrl=http://remote:8080     # Override via CLI argument
 */

const TEST_CONFIG = {
  baseUrl: conf.keycloak?.baseUrl || 'http://localhost:8080',
  realmName: conf.keycloak?.realm || 'master',
  username: conf.keycloak?.adminUsername || 'admin',
  password: conf.keycloak?.adminPassword || 'admin',
  clientId: conf.keycloak?.clientId || 'admin-cli',
  clientSecret: conf.keycloak?.clientSecret,
  grantType: conf.keycloak?.grantType || 'password',
};

console.log('\n📍 Keycloak Configuration (from propertiesmanager):');
console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`   Base URL: ${TEST_CONFIG.baseUrl}`);
console.log(`   Realm: ${TEST_CONFIG.realmName}`);
console.log(`   Client ID: ${TEST_CONFIG.clientId}`);
console.log(`   Grant Type: ${TEST_CONFIG.grantType}\n`);


let adminClient = null;

/**
 * Inizializza il client Keycloak admin
 * Aspetta che Keycloak sia pronto prima di connettersi
 */
async function initializeAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  let retries = 30;
  let lastError;

  while (retries > 0) {
    try {
      adminClient = new KcAdmClient({
        baseUrl: TEST_CONFIG.baseUrl,
        realmName: TEST_CONFIG.realmName,
      });

      await adminClient.auth({
        username: TEST_CONFIG.username,
        password: TEST_CONFIG.password,
        clientId: TEST_CONFIG.clientId,
        grantType: TEST_CONFIG.grantType,
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

  // Switcha a master realm per creare il test realm
  client.realmName = 'master';

  try {
    // Controlla se il realm esiste già
    const realms = await client.realms.find();
    const realmExists = realms.some((r) => r.realm === TEST_CONFIG.realmName);

    if (!realmExists) {
      await client.realms.create({
        realm: TEST_CONFIG.realmName,
        displayName: 'Test Realm',
        enabled: true,
        accessTokenLifespan: 3600,
        refreshTokenMaxReuse: 0,
        actionTokenGeneratedByAdminLifespan: 900,
        actionTokenGeneratedByUserLifespan: 900,
      });
      console.log(`✓ Test realm '${TEST_CONFIG.realmName}' created`);
    } else {
      console.log(`✓ Test realm '${TEST_CONFIG.realmName}' already exists`);
    }
  } catch (err) {
    if (err.response?.status === 409) {
      console.log(`✓ Test realm '${TEST_CONFIG.realmName}' already exists`);
    } else {
      throw err;
    }
  }

  // Switcha back al test realm
  client.realmName = TEST_CONFIG.realmName;
}

/**
 * Pulisce il realm di test
 */
async function cleanupTestRealm() {
  if (!adminClient) return;

  try {
    adminClient.realmName = 'master';
    await adminClient.realms.del({ realm: TEST_CONFIG.realmName });
    console.log(`✓ Test realm '${TEST_CONFIG.realmName}' deleted`);
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
}

module.exports = {
  TEST_CONFIG,
  initializeAdminClient,
  setupTestRealm,
  cleanupTestRealm,
  getAdminClient,
  resetAdminClient,
};
