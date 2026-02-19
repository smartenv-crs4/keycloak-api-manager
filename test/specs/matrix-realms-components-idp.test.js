const path = require('path');
const { expect } = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', 'config');

const keycloakManager = require('keycloak-api-manager');
const { KEYCLOAK_CONFIG } = require('../testConfig');
const { loadMatrix, uniqueName } = require('../helpers/matrix');

function shouldSkipFeature(err) {
  if (!err || !err.message) {
    return false;
  }
  const text = err.message.toLowerCase();
  return (
    (text.includes('provider') && text.includes('not found')) ||
    text.includes('feature not enabled') ||
    text.includes('not supported') ||
    text.includes('http 404') ||
    text.includes('unknown_error')
  );
}

describe('Matrix - Realms, Components, Identity Providers', function () {
  this.timeout(60000);

  const matrix = loadMatrix('realms-components-idp');

  before(async function () {
    await keycloakManager.configure({
      baseUrl: KEYCLOAK_CONFIG.baseUrl,
      realmName: KEYCLOAK_CONFIG.realmName,
      clientId: KEYCLOAK_CONFIG.clientId,
      clientSecret: KEYCLOAK_CONFIG.clientSecret,
      username: KEYCLOAK_CONFIG.username,
      password: KEYCLOAK_CONFIG.password,
      grantType: KEYCLOAK_CONFIG.grantType,
      tokenLifeSpan: KEYCLOAK_CONFIG.tokenLifeSpan,
      scope: KEYCLOAK_CONFIG.scope,
    });
  });

  matrix.realms.forEach((testCase) => {
    it(`realm case: ${testCase.name}`, async function () {
      const realmName = uniqueName(`matrix-realm-${testCase.name}`);

      await keycloakManager.realms.create({
        realm: realmName,
        enabled: true,
        ...testCase.realmConfig,
      });

      const realms = await keycloakManager.realms.find();
      expect(realms.map((r) => r.realm)).to.include(realmName);

      await keycloakManager.realms.update(
        { realm: realmName },
        {
          ...testCase.realmConfig,
          displayName: `Updated ${realmName}`,
        }
      );

      const updated = await keycloakManager.realms.findOne({ realm: realmName });
      expect(updated.displayName).to.equal(`Updated ${realmName}`);

      await keycloakManager.realms.del({ realm: realmName });
    });
  });

  it('components: find and check components exist', async function () {
    const components = await keycloakManager.components.find();
    expect(components).to.be.an('array');
  });

  matrix.identityProviders.forEach((testCase) => {
    it(`idp case: ${testCase.name}`, async function () {
      const realmName = uniqueName(`matrix-idp-realm-${testCase.name}`);
      const alias = uniqueName(`matrix-idp-${testCase.name}`);

      await keycloakManager.realms.create({ realm: realmName, enabled: true });
      keycloakManager.setConfig({ realmName });

      try {
        await keycloakManager.identityProviders.create({
          alias,
          providerId: testCase.providerId,
          enabled: true,
          trustEmail: false,
          storeToken: false,
          addReadTokenRoleOnCreate: false,
          authenticateByDefault: false,
          config: testCase.config,
        });
      } catch (err) {
        if (shouldSkipFeature(err)) {
          this.skip();
          return;
        }
        throw err;
      }

      const idps = await keycloakManager.identityProviders.find();
      expect(idps.map((i) => i.alias)).to.include(alias);

      await keycloakManager.identityProviders.del({ alias });
      await keycloakManager.realms.del({ realm: realmName });
    });
  });
});
