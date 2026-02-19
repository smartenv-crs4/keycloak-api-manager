const path = require('path');
const { expect } = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', '..', 'config');

const keycloakManager = require('keycloak-api-manager');
const { KEYCLOAK_CONFIG, TEST_REALM, TEST_CLIENT_ID, TEST_USER_USERNAME, TEST_USER_PASSWORD } = require('../../testConfig');
const { loadMatrix } = require('../../helpers/matrix');

function buildConfig(overrides = {}) {
  return {
    ...KEYCLOAK_CONFIG,
    ...overrides,
  };
}

describe('Matrix - Authentication', function () {
  this.timeout(30000);

  const matrix = loadMatrix('auth');

  let clientSecret = null;

  before(async function () {
    // Ensure we're using the test realm
    keycloakManager.setConfig({ realmName: TEST_REALM });
    
    const clients = await keycloakManager.clients.find({ clientId: TEST_CLIENT_ID });
    const testClient = clients.find((client) => client.clientId === TEST_CLIENT_ID);
    if (!testClient) {
      this.skip();
      return;
    }

    const secret = await keycloakManager.clients.getClientSecret({ id: testClient.id });
    clientSecret = secret?.value || null;
  });

  after(async function () {
    await keycloakManager.configure(
      buildConfig({
        grantType: KEYCLOAK_CONFIG.grantType || 'password',
        tokenLifeSpan: KEYCLOAK_CONFIG.tokenLifeSpan || 60,
      })
    );
  });

  matrix.cases.forEach((testCase) => {
    it(`auth case: ${testCase.name}`, async function () {
      if (testCase.grantType === 'client_credentials' && !clientSecret) {
        this.skip();
        return;
      }

      if (testCase.grantType === 'refresh_token') {
        // First obtain a refresh token using password grant
        await keycloakManager.configure(
          buildConfig({
            realmName: TEST_REALM,
            username: TEST_USER_USERNAME,
            password: TEST_USER_PASSWORD,
            grantType: 'password',
            tokenLifeSpan: 60,
          })
        );
        const token = keycloakManager.getToken();
        if (!token?.refreshToken) {
          this.skip();
          return;
        }

        await keycloakManager.configure(
          buildConfig({
            realmName: TEST_REALM,
            grantType: 'refresh_token',
            refreshToken: token.refreshToken,
            tokenLifeSpan: 60,
          })
        );
      } else if (testCase.grantType === 'client_credentials') {
        await keycloakManager.configure(
          buildConfig({
            realmName: TEST_REALM,
            clientId: TEST_CLIENT_ID,
            clientSecret,
            grantType: 'client_credentials',
            tokenLifeSpan: 60,
            username: undefined,
            password: undefined,
          })
        );
      } else {
        await keycloakManager.configure(
          buildConfig({
            realmName: TEST_REALM,
            username: TEST_USER_USERNAME,
            password: TEST_USER_PASSWORD,
            grantType: testCase.grantType,
            offlineToken: testCase.offlineToken || false,
            scope: testCase.scope,
            tokenLifeSpan: 60,
          })
        );
      }

      const token = keycloakManager.getToken();
      expect(token).to.have.property('accessToken');
      expect(token.accessToken).to.be.a('string').and.to.have.length.greaterThan(0);
    });
  });
});
