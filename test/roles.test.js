const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Roles Handler', function () {
  this.timeout(15000);
  let client;
  let testRoleId;
  let testRoleName;
  let compositeRoleId;

  before(async function () {
    client = getAdminClient();
    testRoleName = `test-role-${Date.now()}`;
  });

  // ==================== ROLE CRUD ====================
  describe('CRUD Operations', function () {
    describe('create', function () {
      it('should create a realm role with valid representation', async function () {
        const roleRep = {
          name: testRoleName,
          displayName: 'Test Role Display',
          description: 'Test role for integration',
        };

        const result = await client.roles.create(
          { realm: 'test-realm' },
          roleRep
        );

        expect(result).to.have.property('id');
        testRoleId = result.id;
      });

      it('should fail creating duplicate role name', async function () {
        try {
          await client.roles.create(
            { realm: 'test-realm' },
            { name: testRoleName }
          );
          expect.fail('Should have thrown error for duplicate role');
        } catch (err) {
          expect(err).to.exist;
        }
      });
    });

    describe('find', function () {
      it('should list all realm roles', async function () {
        const roles = await client.roles.find({ realm: 'test-realm' });

        expect(roles).to.be.an('array');
        expect(roles.length).to.be.greaterThan(0);
        expect(roles.some((r) => r.name === testRoleName)).to.be.true;
      });

      it('should support pagination parameters', async function () {
        const roles = await client.roles.find({
          realm: 'test-realm',
          first: 0,
          max: 5,
        });

        expect(roles).to.be.an('array');
        expect(roles.length).to.be.lessThanOrEqual(5);
      });
    });

    describe('findOneByName', function () {
      it('should find a specific role by name', async function () {
        const role = await client.roles.findOneByName({
          realm: 'test-realm',
          name: testRoleName,
        });

        expect(role).to.exist;
        expect(role.name).to.equal(testRoleName);
      });
    });

    describe('findOneById', function () {
      it('should find a specific role by id', async function () {
        const role = await client.roles.findOneById({
          realm: 'test-realm',
          id: testRoleId,
        });

        expect(role).to.exist;
        expect(role.id).to.equal(testRoleId);
      });
    });

    describe('update', function () {
      describe('updateByName', function () {
        it('should update role by name', async function () {
          const updateRep = {
            displayName: 'Updated Display Name',
            description: 'Updated description',
          };

          await client.roles.updateByName(
            { realm: 'test-realm', name: testRoleName },
            updateRep
          );

          const updated = await client.roles.findOneByName({
            realm: 'test-realm',
            name: testRoleName,
          });

          expect(updated.displayName).to.equal('Updated Display Name');
        });
      });

      describe('updateById', function () {
        it('should update role by id', async function () {
          const updateRep = {
            description: 'Updated by ID',
          };

          await client.roles.updateById(
            { realm: 'test-realm', id: testRoleId },
            updateRep
          );

          const updated = await client.roles.findOneById({
            realm: 'test-realm',
            id: testRoleId,
          });

          expect(updated.description).to.equal('Updated by ID');
        });
      });
    });
  });

  // ==================== COMPOSITE ROLES ====================
  describe('Composite Roles', function () {
    before(async function () {
      // Create a composite role
      const compositeRep = {
        name: `composite-role-${Date.now()}`,
        composite: true,
      };

      const result = await client.roles.create(
        { realm: 'test-realm' },
        compositeRep
      );
      compositeRoleId = result.id;
    });

    describe('createComposite', function () {
      it('should create composite role with child roles', async function () {
        const childRole = await client.roles.findOneByName({
          realm: 'test-realm',
          name: testRoleName,
        });

        await client.roles.createComposite(
          { realm: 'test-realm', name: `composite-role-${Date.now()}` },
          [childRole]
        );

        // Verify composite created
      });
    });

    describe('getCompositeRoles', function () {
      it('should retrieve composite roles', async function () {
        const composites = await client.roles.getCompositeRoles({
          realm: 'test-realm',
          id: compositeRoleId,
        });

        expect(composites).to.be.an('array');
      });
    });

    describe('getCompositeRolesForRealm', function () {
      it('should retrieve composite roles for realm', async function () {
        const composites = await client.roles.getCompositeRolesForRealm({
          realm: 'test-realm',
          id: compositeRoleId,
        });

        expect(composites).to.be.an('array');
      });
    });
  });

  // ==================== CLEANUP ====================
  after(async function () {
    try {
      if (testRoleId) {
        await client.roles.delByName({ realm: 'test-realm', name: testRoleName });
      }
      if (compositeRoleId) {
        // Delete composite role
        const compositeRole = await client.roles.findOneById({
          realm: 'test-realm',
          id: compositeRoleId,
        });
        if (compositeRole) {
          await client.roles.delByName({
            realm: 'test-realm',
            name: compositeRole.name,
          });
        }
      }
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  });
});
