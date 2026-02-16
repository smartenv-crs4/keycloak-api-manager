const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Roles Handler', function () {
  this.timeout(10000);
  let client;
  let testRoleId;

  before(function () {
    client = getAdminClient();
  });

  describe('create', function () {
    it('should create a realm role with valid representation', async function () {
      const roleRepresentation = {
        name: 'integration-test-role',
        displayName: 'Integration Test Role',
        description: 'Test role for integration tests',
      };

      const result = await client.roles.create(
        { realm: 'test-realm' },
        roleRepresentation
      );

      expect(result).to.have.property('id');
      testRoleId = result.id;
    });
  });

  describe('find', function () {
    it('should list all realm roles', async function () {
      const roles = await client.roles.find({ realm: 'test-realm' });

      expect(roles).to.be.an('array');
      expect(roles.some((r) => r.name === 'integration-test-role')).to.be.true;
    });
  });

  describe('findOne', function () {
    it('should find a specific role by id', async function () {
      const role = await client.roles.findOne({ realm: 'test-realm', id: testRoleId });

      expect(role).to.exist;
      expect(role.name).to.equal('integration-test-role');
    });

    it('should find a specific role by name', async function () {
      const role = await client.roles.findOneByName({
        realm: 'test-realm',
        name: 'integration-test-role',
      });

      expect(role).to.exist;
      expect(role.name).to.equal('integration-test-role');
    });
  });

  describe('update', function () {
    it('should update role attributes', async function () {
      const updateRepresentation = {
        displayName: 'Updated Role Display',
        description: 'Updated description',
      };

      await client.roles.update(
        { realm: 'test-realm', id: testRoleId },
        updateRepresentation
      );

      const updatedRole = await client.roles.findOne({
        realm: 'test-realm',
        id: testRoleId,
      });

      expect(updatedRole.displayName).to.equal('Updated Role Display');
      expect(updatedRole.description).to.equal('Updated description');
    });
  });

  after(async function () {
    // Cleanup: delete test role
    try {
      if (testRoleId) {
        await client.roles.del({ realm: 'test-realm', id: testRoleId });
      }
    } catch (err) {
      // Ignore if not found
    }
  });
});
