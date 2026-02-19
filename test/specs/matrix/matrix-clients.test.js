const path = require('path');
const { expect } = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', '..', 'config');

const keycloakManager = require('keycloak-api-manager');
const { TEST_REALM } = require('../../testConfig');
const { loadMatrix, uniqueName } = require('../../helpers/matrix');

describe('Matrix - Clients', function () {
  this.timeout(30000);

  const matrix = loadMatrix('clients');

  before(function () {
    keycloakManager.setConfig({ realmName: TEST_REALM });
  });

  matrix.cases.forEach((testCase) => {
    it(`client case: ${testCase.name}`, async function () {
      const clientId = uniqueName(`matrix-client-${testCase.name}`);

      const created = await keycloakManager.clients.create({
        clientId,
        enabled: true,
        protocol: 'openid-connect',
        publicClient: testCase.publicClient,
        serviceAccountsEnabled: testCase.serviceAccountsEnabled,
        directAccessGrantsEnabled: testCase.directAccessGrantsEnabled,
        standardFlowEnabled: testCase.standardFlowEnabled,
        consentRequired: testCase.consentRequired,
        redirectUris: ['http://localhost:*'],
        webOrigins: ['*'],
      });

      expect(created).to.exist;

      const found = await keycloakManager.clients.find({ clientId });
      expect(found).to.be.an('array');
      const stored = found.find((item) => item.clientId === clientId);
      expect(stored).to.exist;

      await keycloakManager.clients.update(
        { id: stored.id },
        {
          description: `updated-${clientId}`,
          consentRequired: false,
        }
      );

      const updated = await keycloakManager.clients.findOne({ id: stored.id });
      expect(updated).to.exist;
      expect(updated.description).to.equal(`updated-${clientId}`);

      await keycloakManager.clients.del({ id: stored.id });
    });
  });
});
