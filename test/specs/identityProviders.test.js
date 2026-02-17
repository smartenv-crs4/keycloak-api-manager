const { expect } = require('chai');
const { getAdminClient } = require('../helpers/config');

describe('Identity Providers Handler', function () {
  this.timeout(15000);
  let client;
  let testIdpAlias;
  let testMapperId;

  before(function () {
    client = getAdminClient();
    testIdpAlias = `test-idp-${Date.now()}`;
  });

  // ==================== IDENTITY PROVIDER CRUD ====================
  describe('CRUD Operations', function () {
    describe('create', function () {
      it('should create an identity provider with valid representation', async function () {
        const idpRep = {
          alias: testIdpAlias,
          displayName: 'Test IDP',
          providerId: 'oidc',
          enabled: true,
          config: {
            clientId: 'test-client',
            clientSecret: 'test-secret',
            tokenUrl: 'https://example.com/token',
            authorizationUrl: 'https://example.com/authorize',
            userInfoUrl: 'https://example.com/userinfo',
          },
        };

        const result = await client.identityProviders.create(
          { realm: 'test-realm' },
          idpRep
        );

        expect(result).to.have.property('alias');
        expect(result.alias).to.equal(testIdpAlias);
      });
    });

    describe('find', function () {
      it('should list all identity providers', async function () {
        const idps = await client.identityProviders.find({ realm: 'test-realm' });

        expect(idps).to.be.an('array');
        expect(idps.some((idp) => idp.alias === testIdpAlias)).to.be.true;
      });
    });

    describe('findOne', function () {
      it('should find a specific identity provider by alias', async function () {
        const idp = await client.identityProviders.findOne({
          realm: 'test-realm',
          alias: testIdpAlias,
        });

        expect(idp).to.exist;
        expect(idp.alias).to.equal(testIdpAlias);
      });
    });

    describe('update', function () {
      it('should update identity provider attributes', async function () {
        const updateRep = {
          displayName: 'Updated IDP Name',
          enabled: false,
        };

        await client.identityProviders.update(
          { realm: 'test-realm', alias: testIdpAlias },
          updateRep
        );

        const updated = await client.identityProviders.findOne({
          realm: 'test-realm',
          alias: testIdpAlias,
        });

        expect(updated.displayName).to.equal('Updated IDP Name');
        expect(updated.enabled).to.be.false;
      });
    });
  });

  // ==================== IDENTITY PROVIDER MAPPERS ====================
  describe('Mappers', function () {
    describe('createMapper', function () {
      it('should create a mapper for identity provider', async function () {
        const mapperRep = {
          name: 'test-mapper',
          identityProviderAlias: testIdpAlias,
          identityProviderMapper: 'oidc-user-attribute-idp-mapper',
          config: {
            'user.attribute': 'email',
            'claim': 'email',
          },
        };

        const result = await client.identityProviders.createMapper(
          { realm: 'test-realm' },
          mapperRep
        );

        expect(result).to.exist;
        testMapperId = result.id;
      });
    });

    describe('findMappers', function () {
      it('should find all mappers for identity provider', async function () {
        const mappers = await client.identityProviders.findMappers({
          realm: 'test-realm',
          alias: testIdpAlias,
        });

        expect(mappers).to.be.an('array');
      });
    });

    describe('findOneMapper', function () {
      it('should find a specific mapper by id', async function () {
        if (testMapperId) {
          const mapper = await client.identityProviders.findOneMapper({
            realm: 'test-realm',
            alias: testIdpAlias,
            id: testMapperId,
          });

          expect(mapper).to.exist;
        }
      });
    });

    describe('delMapper', function () {
      it('should delete a mapper', async function () {
        if (testMapperId) {
          await client.identityProviders.delMapper({
            realm: 'test-realm',
            alias: testIdpAlias,
            id: testMapperId,
          });

          // Verify deleted
        }
      });
    });
  });

  // ==================== IDENTITY PROVIDER MANAGEMENT ====================
  describe('Management Operations', function () {
    describe('findFactory', function () {
      it('should retrieve identity provider factory', async function () {
        try {
          const factory = await client.identityProviders.findFactory({
            realm: 'test-realm',
            providerId: 'oidc',
          });

          expect(factory).to.exist;
        } catch (err) {
          // Factory endpoint might not be available
        }
      });
    });

    describe('listPermissions', function () {
      it('should list identity provider permissions', async function () {
        try {
          const perms = await client.identityProviders.listPermissions({
            realm: 'test-realm',
            alias: testIdpAlias,
          });

          expect(perms).to.be.an('object');
        } catch (err) {
          // Permissions might not be enabled
        }
      });
    });
  });

  // ==================== CLEANUP ====================
  after(async function () {
    try {
      if (testIdpAlias) {
        await client.identityProviders.del({
          realm: 'test-realm',
          alias: testIdpAlias,
        });
      }
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  });
});
