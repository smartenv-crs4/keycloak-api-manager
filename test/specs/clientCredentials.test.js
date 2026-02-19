const path = require('path');
const { expect } = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', 'config');

const keycloakManager = require('keycloak-api-manager');
const { KEYCLOAK_CONFIG, TEST_CLIENT_ID, TEST_REALM } = require('../testConfig');

function buildConfig(overrides = {}) {
  return {
    ...KEYCLOAK_CONFIG,
    ...overrides,
  };
}

describe('Authentication - client_credentials grant', function () {
  this.timeout(20000);

  let testClientId = null;
  let testClientSecret = null;

  before(async function () {
    // Ensure we're using the test realm
    keycloakManager.setConfig({ realmName: TEST_REALM });
    
    const clients = await keycloakManager.clients.find({ clientId: TEST_CLIENT_ID });
    const testClient = clients.find((client) => client.clientId === TEST_CLIENT_ID);

    if (!testClient) {
      this.skip();
      return;
    }

    testClientId = testClient.clientId;
    const secret = await keycloakManager.clients.getClientSecret({ id: testClient.id });
    testClientSecret = secret?.value;

    if (!testClientSecret) {
      this.skip();
    }
  });

  after(async function () {
    if (!KEYCLOAK_CONFIG?.username || !KEYCLOAK_CONFIG?.password) {
      return;
    }

    await keycloakManager.configure(
      buildConfig({
        grantType: KEYCLOAK_CONFIG.grantType || 'password',
        tokenLifeSpan: KEYCLOAK_CONFIG.tokenLifeSpan || 60,
      })
    );
  });

  it('authenticates without refresh token errors', async function () {
    if (!testClientId || !testClientSecret) {
      this.skip();
      return;
    }

    await keycloakManager.configure(
      buildConfig({
        realmName: TEST_REALM,
        clientId: testClientId,
        clientSecret: testClientSecret,
        grantType: 'client_credentials',
        tokenLifeSpan: 60,
        username: undefined,
        password: undefined,
      })
    );

    const token = keycloakManager.getToken();
    expect(token).to.have.property('accessToken');
    expect(token.accessToken).to.be.a('string').and.to.have.length.greaterThan(0);
  });
});
