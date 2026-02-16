const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Client Scopes Handler', function () {
  this.timeout(10000);
  let client;
  let testScopeId;

  before(function () {
    client = getAdminClient();
  });

  describe('create', function () {
    it('should create a client scope with valid representation', async function () {
      const scopeRepresentation = {
        name: 'integration-test-scope',
        displayName: 'Integration Test Scope',
        protocol: 'openid-connect',
      };

      const result = await client.clientScopes.create(
        { realm: 'test-realm' },
        scopeRepresentation
      );

      expect(result).to.have.property('id');
      testScopeId = result.id;
    });
  });

  describe('find', function () {
    it('should list all client scopes', async function () {
      const scopes = await client.clientScopes.find({ realm: 'test-realm' });

      expect(scopes).to.be.an('array');
      expect(scopes.some((s) => s.name === 'integration-test-scope')).to.be.true;
    });
  });

  describe('findOne', function () {
    it('should find a specific scope by id', async function () {
      const scope = await client.clientScopes.findOne({
        realm: 'test-realm',
        id: testScopeId,
      });

      expect(scope).to.exist;
      expect(scope.name).to.equal('integration-test-scope');
    });
  });

  describe('update', function () {
    it('should update scope attributes', async function () {
      const updateRepresentation = {
        displayName: 'Updated Scope Display Name',
      };

      await client.clientScopes.update(
        { realm: 'test-realm', id: testScopeId },
        updateRepresentation
      );

      const updatedScope = await client.clientScopes.findOne({
        realm: 'test-realm',
        id: testScopeId,
      });

      expect(updatedScope.displayName).to.equal('Updated Scope Display Name');
    });
  });

  after(async function () {
    // Cleanup: delete test scope
    try {
      if (testScopeId) {
        await client.clientScopes.del({ realm: 'test-realm', id: testScopeId });
      }
    } catch (err) {
      // Ignore if not found
    }
  });
});
