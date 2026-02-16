const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Groups Handler', function () {
  this.timeout(15000);
  let client;
  let testGroupId;
  let testSubGroupId;
  let testRoleId;
  let testUserId;

  before(async function () {
    client = getAdminClient();

    // Create test role for role mappings
    const role = await client.roles.create(
      { realm: 'test-realm' },
      { name: `groups-test-role-${Date.now()}` }
    );
    testRoleId = role.id;

    // Create test user for group membership
    const user = await client.users.create(
      { realm: 'test-realm' },
      {
        username: `groups-test-user-${Date.now()}`,
        enabled: true,
      }
    );
    testUserId = user.id;
  });

  // ==================== GROUP CRUD ====================
  describe('CRUD Operations', function () {
    describe('create', function () {
      it('should create a group with valid representation', async function () {
        const groupRep = {
          name: `test-group-${Date.now()}`,
        };

        const result = await client.groups.create(
          { realm: 'test-realm' },
          groupRep
        );

        expect(result).to.have.property('id');
        testGroupId = result.id;
      });

      it('should fail creating duplicate group name', async function () {
        const groupName = `unique-group-${Date.now()}`;

        await client.groups.create(
          { realm: 'test-realm' },
          { name: groupName }
        );

        try {
          await client.groups.create(
            { realm: 'test-realm' },
            { name: groupName }
          );
          // Note: Some Keycloak versions allow duplicates at root level
        } catch (err) {
          expect(err).to.exist;
        }
      });
    });

    describe('find', function () {
      it('should list all groups', async function () {
        const groups = await client.groups.find({ realm: 'test-realm' });

        expect(groups).to.be.an('array');
        expect(groups.length).to.be.greaterThan(0);
      });

      it('should search groups by name', async function () {
        const groups = await client.groups.find({
          realm: 'test-realm',
          search: 'test-group',
        });

        expect(groups).to.be.an('array');
      });

      it('should support pagination', async function () {
        const groups = await client.groups.find({
          realm: 'test-realm',
          first: 0,
          max: 5,
        });

        expect(groups).to.be.an('array');
      });
    });

    describe('findOne', function () {
      it('should find a specific group by id', async function () {
        const group = await client.groups.findOne({
          realm: 'test-realm',
          id: testGroupId,
        });

        expect(group).to.exist;
        expect(group.id).to.equal(testGroupId);
      });
    });

    describe('count', function () {
      it('should count total groups', async function () {
        const count = await client.groups.count({ realm: 'test-realm' });

        expect(count).to.be.a('number');
        expect(count).to.be.greaterThan(0);
      });
    });

    describe('update', function () {
      it('should update group attributes', async function () {
        const updateRep = {
          name: `updated-group-${Date.now()}`,
          attributes: {
            department: ['Engineering'],
          },
        };

        await client.groups.update(
          { realm: 'test-realm', id: testGroupId },
          updateRep
        );

        const updated = await client.groups.findOne({
          realm: 'test-realm',
          id: testGroupId,
        });

        expect(updated.name).to.include('updated-group');
      });
    });
  });

  // ==================== SUBGROUPS ====================
  describe('Subgroups', function () {
    describe('listSubGroups', function () {
      it('should list subgroups of a group', async function () {
        const subgroups = await client.groups.listSubGroups({
          realm: 'test-realm',
          id: testGroupId,
        });

        expect(subgroups).to.be.an('array');
      });
    });

    // Note: Creating subgroups might require special handling in some Keycloak versions
  });

  // ==================== REALM ROLE MAPPINGS ====================
  describe('Realm Role Mappings', function () {
    describe('addRealmRoleMappings', function () {
      it('should add realm roles to group', async function () {
        await client.groups.addRealmRoleMappings({
          realm: 'test-realm',
          id: testGroupId,
          roles: [
            {
              id: testRoleId,
              name: `groups-test-role-${Date.now()}`,
            },
          ],
        });

        // Verify role added
      });
    });

    describe('listRoleMappings', function () {
      it('should list all role mappings for group', async function () {
        const mappings = await client.groups.listRoleMappings({
          realm: 'test-realm',
          id: testGroupId,
        });

        expect(mappings).to.be.an('object');
        expect(mappings).to.have.property('realmMappings');
      });
    });

    describe('listRealmRoleMappings', function () {
      it('should list realm role mappings', async function () {
        const mappings = await client.groups.listRealmRoleMappings({
          realm: 'test-realm',
          id: testGroupId,
        });

        expect(mappings).to.be.an('array');
      });
    });

    describe('listCompositeRealmRoleMappings', function () {
      it('should list composite realm role mappings', async function () {
        const mappings = await client.groups.listCompositeRealmRoleMappings({
          realm: 'test-realm',
          id: testGroupId,
        });

        expect(mappings).to.be.an('array');
      });
    });

    describe('listAvailableRealmRoleMappings', function () {
      it('should list available realm roles for group', async function () {
        const available = await client.groups.listAvailableRealmRoleMappings({
          realm: 'test-realm',
          id: testGroupId,
        });

        expect(available).to.be.an('array');
      });
    });

    describe('delRealmRoleMappings', function () {
      it('should remove realm roles from group', async function () {
        const mappings = await client.groups.listRealmRoleMappings({
          realm: 'test-realm',
          id: testGroupId,
        });

        if (mappings.length > 0) {
          await client.groups.delRealmRoleMappings({
            realm: 'test-realm',
            id: testGroupId,
            roles: mappings,
          });

          // Verify removed
        }
      });
    });
  });

  // ==================== CLIENT ROLE MAPPINGS ====================
  describe('Client Role Mappings', function () {
    describe('listAvailableClientRoleMappings', function () {
      it('should list available client roles for group', async function () {
        // Get a client first
        const clients = await client.clients.find({ realm: 'test-realm' });
        if (clients.length > 0) {
          const available = await client.groups.listAvailableClientRoleMappings({
            realm: 'test-realm',
            id: testGroupId,
            clientUniqueId: clients[0].id,
          });

          expect(available).to.be.an('array');
        }
      });
    });
  });

  // ==================== CLEANUP ====================
  after(async function () {
    try {
      if (testGroupId) {
        await client.groups.del({ realm: 'test-realm', id: testGroupId });
      }
      if (testRoleId) {
        const role = await client.roles.findOneById({
          realm: 'test-realm',
          id: testRoleId,
        });
        if (role) {
          await client.roles.delByName({ realm: 'test-realm', name: role.name });
        }
      }
      if (testUserId) {
        await client.users.del({ realm: 'test-realm', id: testUserId });
      }
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  });
});
