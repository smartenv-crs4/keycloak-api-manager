const KcAdmClient = require('@keycloak/keycloak-admin-client').default;
const { delay } = require('async');

const TEST_CONFIG = {
  baseUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  realmName: 'test-realm',
  username: 'admin',
  password: 'admin',
  clientId: 'admin-cli',
  grantType: 'password',
};

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
