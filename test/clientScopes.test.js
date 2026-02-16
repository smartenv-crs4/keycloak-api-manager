const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Client Scopes Handler', function () {
  this.timeout(15000);
  let client;
  let testScopeId;
  let testScopeName;

  before(function () {
    client = getAdminClient();
    testScopeName = `test-scope-${Date.now()}`;
  });

  // ==================== CLIENT SCOPE CRUD ====================
  describe('CRUD Operations', function () {
    describe('create', function () {
      it('should create a client scope with valid representation', async function () {
        const scopeRep = {
          name: testScopeName,
          displayName: 'Test Scope Display',
          protocol: 'openid-connect',
          description: 'Test scope for integration',
        };

        const result = await client.clientScopes.create(
          { realm: 'test-realm' },
          scopeRep
        );

        expect(result).to.have.property('id');
        testScopeId = result.id;
      });
    });

    describe('find', function () {
      it('should list all client scopes', async function () {
        const scopes = await client.clientScopes.find({ realm: 'test-realm' });

        expect(scopes).to.be.an('array');
        expect(scopes.length).to.be.greaterThan(0);
        expect(scopes.some((s) => s.name === testScopeName)).to.be.true;
      });
    });

    describe('findOne', function () {
      it('should find a specific scope by id', async function () {
        const scope = await client.clientScopes.findOne({
          realm: 'test-realm',
          id: testScopeId,
        });

        expect(scope).to.exist;
        expect(scope.name).to.equal(testScopeName);
      });
    });

    describe('findOneByName', function () {
      it('should find a specific scope by name', async function () {
        const scope = await client.clientScopes.findOneByName({
          realm: 'test-realm',
          name: testScopeName,
        });

        expect(scope).to.exist;
        expect(scope.name).to.equal(testScopeName);
      });
    });

    describe('update', function () {
      it('should update scope attributes', async function () {
        const updateRep = {
          displayName: 'Updated Scope Display',
          description: 'Updated description',
        };

        await client.clientScopes.update(
          { realm: 'test-realm', id: testScopeId },
          updateRep
        );

        const updated = await client.clientScopes.findOne({
          realm: 'test-realm',
          id: testScopeId,
        });

        expect(updated.displayName).to.equal('Updated Scope Display');
      });
    });

    describe('delByName', function () {
      it('should delete scope by name', async function () {
        // Create temp scope for deletion test
        const tempScope = await client.clientScopes.create(
          { realm: 'test-realm' },
          { name: `temp-scope-${Date.now()}` }
        );

        await client.clientScopes.delByName({
          realm: 'test-realm',
          name: tempScope.name,
        });

        // Verify deleted
      });
    });
  });

  // ==================== DEFAULT CLIENT SCOPES ====================
  describe('Default Client Scopes', function () {
    describe('listDefaultClientScopes', function () {
      it('should list default client scopes', async function () {
        const scopes = await client.clientScopes.listDefaultClientScopes({
          realm: 'test-realm',
        });

        expect(scopes).to.be.an('array');
      });
    });

    describe('addDefaultClientScope', function () {
      it('should add a client scope to defaults', async function () {
        await client.clientScopes.addDefaultClientScope({
          realm: 'test-realm',
          id: testScopeId,
        });

        const defaults = await client.clientScopes.listDefaultClientScopes({
          realm: 'test-realm',
        });

        expect(defaults.some((s) => s.id === testScopeId)).to.be.true;
      });
    });

    describe('delDefaultClientScope', function () {
      it('should remove client scope from defaults', async function () {
        await client.clientScopes.delDefaultClientScope({
          realm: 'test-realm',
          id: testScopeId,
        });

        const defaults = await client.clientScopes.listDefaultClientScopes({
          realm: 'test-realm',
        });

        expect(defaults.some((s) => s.id === testScopeId)).to.be.false;
      });
    });
  });

  // ==================== DEFAULT OPTIONAL CLIENT SCOPES ====================
  describe('Default Optional Client Scopes', function () {
    describe('listDefaultOptionalClientScopes', function () {
      it('should list default optional client scopes', async function () {
        const scopes = await client.clientScopes.listDefaultOptionalClientScopes({
          realm: 'test-realm',
        });

        expect(scopes).to.be.an('array');
      });
    });

    describe('addDefaultOptionalClientScope', function () {
      it('should add scope to default optional', async function () {
        await client.clientScopes.addDefaultOptionalClientScope({
          realm: 'test-realm',
          id: testScopeId,
        });

        const optionals = await client.clientScopes.listDefaultOptionalClientScopes({
          realm: 'test-realm',
        });

        expect(optionals.some((s) => s.id === testScopeId)).to.be.true;
      });
    });

    describe('delDefaultOptionalClientScope', function () {
      it('should remove scope from default optional', async function () {
        await client.clientScopes.delDefaultOptionalClientScope({
          realm: 'test-realm',
          id: testScopeId,
        });

        const optionals = await client.clientScopes.listDefaultOptionalClientScopes({
          realm: 'test-realm',
        });

        expect(optionals.some((s) => s.id === testScopeId)).to.be.false;
      });
    });
  });

  // ==================== PROTOCOL MAPPERS ====================
  describe('Protocol Mappers', function () {
    describe('listProtocolMappers', function () {
      it('should list protocol mappers for scope', async function () {
        const mappers = await client.clientScopes.listProtocolMappers({
          realm: 'test-realm',
          id: testScopeId,
        });

        expect(mappers).to.be.an('array');
      });
    });

    describe('findProtocolMappersByProtocol', function () {
      it('should find protocol mappers by protocol', async function () {
        const mappers = await client.clientScopes.findProtocolMappersByProtocol({
          realm: 'test-realm',
          id: testScopeId,
          protocol: 'openid-connect',
        });

        expect(mappers).to.be.an('array');
      });
    });
  });

  // ==================== SCOPE MAPPINGS ====================
  describe('Scope Mappings', function () {
    describe('listScopeMappings', function () {
      it('should list all scope mappings', async function () {
        const mappings = await client.clientScopes.listScopeMappings({
          realm: 'test-realm',
          id: testScopeId,
        });

        expect(mappings).to.be.an('object');
      });
    });

    describe('listRealmScopeMappings', function () {
      it('should list realm scope mappings', async function () {
        const mappings = await client.clientScopes.listRealmScopeMappings({
          realm: 'test-realm',
          id: testScopeId,
        });

        expect(mappings).to.be.an('array');
      });
    });
  });

  // ==================== CLEANUP ====================
  after(async function () {
    try {
      if (testScopeId) {
        await client.clientScopes.del({ realm: 'test-realm', id: testScopeId });
      }
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  });
});
