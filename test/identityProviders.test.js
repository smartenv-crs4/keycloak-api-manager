const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Identity Providers Handler', function () {
  this.timeout(10000);
  let client;
  let testIdpAlias;

  before(function () {
    client = getAdminClient();
  });

  describe('create', function () {
    it('should create an identity provider with valid representation', async function () {
      const idpRepresentation = {
        alias: 'integration-test-idp',
        displayName: 'Integration Test IDP',
        providerId: 'oidc',
        enabled: true,
        config: {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          tokenUrl: 'https://example.com/token',
          authorizationUrl: 'https://example.com/auth',
          userInfoUrl: 'https://example.com/userinfo',
        },
      };

      const result = await client.identityProviders.create(
        { realm: 'test-realm' },
        idpRepresentation
      );

      expect(result).to.have.property('alias');
      testIdpAlias = result.alias;
    });
  });

  describe('find', function () {
    it('should list all identity providers', async function () {
      const idps = await client.identityProviders.find({ realm: 'test-realm' });

      expect(idps).to.be.an('array');
      expect(idps.some((i) => i.alias === 'integration-test-idp')).to.be.true;
    });
  });

  describe('findOne', function () {
    it('should find a specific identity provider by alias', async function () {
      const idp = await client.identityProviders.findOne({
        realm: 'test-realm',
        alias: testIdpAlias,
      });

      expect(idp).to.exist;
      expect(idp.alias).to.equal('integration-test-idp');
    });
  });

  describe('update', function () {
    it('should update identity provider attributes', async function () {
      const updateRepresentation = {
        displayName: 'Updated IDP Display Name',
        enabled: false,
      };

      await client.identityProviders.update(
        { realm: 'test-realm', alias: testIdpAlias },
        updateRepresentation
      );

      const updatedIdp = await client.identityProviders.findOne({
        realm: 'test-realm',
        alias: testIdpAlias,
      });

      expect(updatedIdp.displayName).to.equal('Updated IDP Display Name');
      expect(updatedIdp.enabled).to.be.false;
    });
  });

  after(async function () {
    // Cleanup: delete test identity provider
    try {
      if (testIdpAlias) {
        await client.identityProviders.del({ realm: 'test-realm', alias: testIdpAlias });
      }
    } catch (err) {
      // Ignore if not found
    }
  });
});
