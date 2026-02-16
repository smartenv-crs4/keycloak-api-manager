const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Users Handler', function () {
  this.timeout(15000);
  let client;
  let testUserId;
  let testGroupId;
  let testRoleId;

  before(async function () {
    client = getAdminClient();
    
    // Create test group and role for later tests
    const group = await client.groups.create(
      { realm: 'test-realm' },
      { name: 'users-test-group' }
    );
    testGroupId = group.id;

    const role = await client.roles.create(
      { realm: 'test-realm' },
      { name: 'users-test-role' }
    );
    testRoleId = role.id;
  });

  // ==================== USER CRUD ====================
  describe('CRUD Operations', function () {
    describe('create', function () {
      it('should create a user with minimal representation', async function () {
        const userRep = {
          username: `testuser-${Date.now()}`,
          enabled: true,
          firstName: 'Test',
          lastName: 'User',
          email: `test-${Date.now()}@example.com`,
        };

        const result = await client.users.create({ realm: 'test-realm' }, userRep);
        testUserId = result.id;

        expect(result).to.have.property('id');
      });

      it('should fail creating duplicate username', async function () {
        const username = `duplicate-${Date.now()}`;
        
        await client.users.create(
          { realm: 'test-realm' },
          { username, enabled: true }
        );

        try {
          await client.users.create(
            { realm: 'test-realm' },
            { username, enabled: true }
          );
          expect.fail('Should have thrown an error for duplicate username');
        } catch (err) {
          expect(err).to.exist;
        }
      });
    });

    describe('find', function () {
      it('should list users with pagination', async function () {
        const users = await client.users.find({
          realm: 'test-realm',
          first: 0,
          max: 10,
        });

        expect(users).to.be.an('array');
      });

      it('should search users by username', async function () {
        const users = await client.users.find({
          realm: 'test-realm',
          username: 'testuser',
        });

        expect(users).to.be.an('array');
      });

      it('should search users by email', async function () {
        const users = await client.users.find({
          realm: 'test-realm',
          email: 'test@example.com',
        });

        expect(users).to.be.an('array');
      });
    });

    describe('findOne', function () {
      it('should find a specific user by id', async function () {
        const user = await client.users.findOne({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(user).to.exist;
        expect(user.id).to.equal(testUserId);
      });
    });

    describe('count', function () {
      it('should count total users in realm', async function () {
        const count = await client.users.count({
          realm: 'test-realm',
        });

        expect(count).to.be.a('number');
        expect(count).to.be.greaterThan(0);
      });
    });

    describe('update', function () {
      it('should update user attributes', async function () {
        const updateRep = {
          firstName: 'Updated',
          lastName: 'Name',
          email: 'updated@example.com',
          attributes: {
            department: ['Engineering'],
          },
        };

        await client.users.update(
          { realm: 'test-realm', id: testUserId },
          updateRep
        );

        const updated = await client.users.findOne({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(updated.firstName).to.equal('Updated');
        expect(updated.attributes.department[0]).to.equal('Engineering');
      });
    });
  });

  // ==================== PASSWORD MANAGEMENT ====================
  describe('Password Management', function () {
    describe('resetPassword', function () {
      it('should set/reset user password', async function () {
        const passwordRep = {
          type: 'password',
          value: 'NewPassword123!@#',
          temporary: false,
        };

        await client.users.resetPassword(
          { realm: 'test-realm', id: testUserId },
          passwordRep
        );

        // Verify no error thrown
      });
    });

    describe('getCredentials', function () {
      it('should retrieve user credentials', async function () {
        const creds = await client.users.getCredentials({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(creds).to.be.an('array');
      });
    });

    describe('deleteCredential', function () {
      it('should delete a user credential', async function () {
        // First get credentials to have an id to delete
        const creds = await client.users.getCredentials({
          realm: 'test-realm',
          id: testUserId,
        });

        if (creds.length > 0) {
          await client.users.deleteCredential({
            realm: 'test-realm',
            id: testUserId,
            credentialId: creds[0].id,
          });
          // Verify no error thrown
        }
      });
    });
  });

  // ==================== GROUP MEMBERSHIP ====================
  describe('Group Membership', function () {
    describe('addToGroup', function () {
      it('should add user to a group', async function () {
        await client.users.addToGroup({
          realm: 'test-realm',
          id: testUserId,
          groupId: testGroupId,
        });

        // Verify in list groups
      });
    });

    describe('listGroups', function () {
      it('should list user groups', async function () {
        const groups = await client.users.listGroups({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(groups).to.be.an('array');
        expect(groups.some((g) => g.id === testGroupId)).to.be.true;
      });
    });

    describe('countGroups', function () {
      it('should count user groups', async function () {
        const count = await client.users.countGroups({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(count).to.be.a('number');
        expect(count).to.be.greaterThan(0);
      });
    });

    describe('delFromGroup', function () {
      it('should remove user from group', async function () {
        await client.users.delFromGroup({
          realm: 'test-realm',
          id: testUserId,
          groupId: testGroupId,
        });

        const groups = await client.users.listGroups({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(groups.some((g) => g.id === testGroupId)).to.be.false;
      });
    });
  });

  // ==================== ROLE MAPPINGS ====================
  describe('Role Mappings', function () {
    describe('addRealmRoleMappings', function () {
      it('should add realm roles to user', async function () {
        await client.users.addRealmRoleMappings({
          realm: 'test-realm',
          id: testUserId,
          roles: [
            {
              id: testRoleId,
              name: 'users-test-role',
            },
          ],
        });

        // Verify role added
      });
    });

    describe('listRoleMappings', function () {
      it('should list all user role mappings', async function () {
        const mappings = await client.users.listRoleMappings({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(mappings).to.be.an('object');
        expect(mappings).to.have.property('realmMappings');
      });
    });

    describe('listRealmRoleMappings', function () {
      it('should list user realm role mappings', async function () {
        const roles = await client.users.listRealmRoleMappings({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(roles).to.be.an('array');
      });
    });

    describe('listCompositeRealmRoleMappings', function () {
      it('should list composite realm role mappings', async function () {
        const roles = await client.users.listCompositeRealmRoleMappings({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(roles).to.be.an('array');
      });
    });

    describe('listAvailableRealmRoleMappings', function () {
      it('should list available realm roles for user', async function () {
        const availableRoles = await client.users.listAvailableRealmRoleMappings({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(availableRoles).to.be.an('array');
      });
    });

    describe('delRealmRoleMappings', function () {
      it('should remove realm roles from user', async function () {
        await client.users.delRealmRoleMappings({
          realm: 'test-realm',
          id: testUserId,
          roles: [
            {
              id: testRoleId,
              name: 'users-test-role',
            },
          ],
        });

        const mappings = await client.users.listRealmRoleMappings({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(mappings.some((r) => r.id === testRoleId)).to.be.false;
      });
    });
  });

  // ==================== SESSION MANAGEMENT ====================
  describe('Session Management', function () {
    describe('listSessions', function () {
      it('should list user active sessions', async function () {
        const sessions = await client.users.listSessions({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(sessions).to.be.an('array');
      });
    });

    describe('listOfflineSessions', function () {
      it('should list user offline sessions', async function () {
        const sessions = await client.users.listOfflineSessions({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(sessions).to.be.an('array');
      });
    });

    describe('logout', function () {
      it('should logout user from all sessions', async function () {
        await client.users.logout({
          realm: 'test-realm',
          id: testUserId,
        });

        // Verify no error thrown
      });
    });
  });

  // ==================== FEDERATED IDENTITIES ====================
  describe('Federated Identities', function () {
    describe('listFederatedIdentities', function () {
      it('should list user federated identities', async function () {
        const identities = await client.users.listFederatedIdentities({
          realm: 'test-realm',
          id: testUserId,
        });

        expect(identities).to.be.an('array');
      });
    });
  });

  // ==================== CLEANUP ====================
  after(async function () {
    try {
      if (testUserId) {
        await client.users.del({ realm: 'test-realm', id: testUserId });
      }
      if (testGroupId) {
        await client.groups.del({ realm: 'test-realm', id: testGroupId });
      }
      if (testRoleId) {
        await client.roles.del({ realm: 'test-realm', id: testRoleId });
      }
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  });
});
