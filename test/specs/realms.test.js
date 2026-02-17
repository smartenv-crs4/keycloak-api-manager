const { expect } = require('chai');
const { getAdminClient } = require('../helpers/config');

describe('Realms Handler', function () {
  this.timeout(15000);
  let client;
  let testRealmName;
  let testGroupId;

  before(function () {
    client = getAdminClient();
    testRealmName = `test-realm-${Date.now()}`;
  });

  // ==================== REALM CRUD ====================
  describe('CRUD Operations', function () {
    describe('create', function () {
      it('should create a realm with minimal representation', async function () {
        const result = await client.realms.create({
          realm: testRealmName,
          enabled: true,
        });

        expect(result).to.have.property('id');
        expect(result.realm).to.equal(testRealmName);
      });

      it('should fail creating duplicate realm', async function () {
        try {
          await client.realms.create({
            realm: testRealmName,
            enabled: true,
          });
          expect.fail('Should have thrown an error for duplicate realm');
        } catch (err) {
          expect(err).to.exist;
        }
      });

      it('should fail with missing realm name', async function () {
        try {
          await client.realms.create({
            displayName: 'Invalid',
          });
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err).to.exist;
        }
      });
    });

    describe('find', function () {
      it('should list all realms', async function () {
        const realms = await client.realms.find();

        expect(realms).to.be.an('array');
        expect(realms.length).to.be.greaterThan(0);
        expect(realms.some((r) => r.realm === testRealmName)).to.be.true;
      });
    });

    describe('findOne', function () {
      it('should find a specific realm by name', async function () {
        const realm = await client.realms.findOne({ realm: testRealmName });

        expect(realm).to.exist;
        expect(realm.realm).to.equal(testRealmName);
        expect(realm.enabled).to.be.true;
      });

      it('should return null for non-existent realm', async function () {
        try {
          await client.realms.findOne({ realm: 'non-existent-realm-xyz' });
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err).to.exist;
        }
      });
    });

    describe('update', function () {
      it('should update realm configuration', async function () {
        const updateRep = {
          displayName: 'Updated Display Name',
          loginTheme: 'keycloak',
          accessCodeLifespan: 60,
        };

        await client.realms.update({ realm: testRealmName }, updateRep);

        const updated = await client.realms.findOne({ realm: testRealmName });
        expect(updated.displayName).to.equal('Updated Display Name');
        expect(updated.loginTheme).to.equal('keycloak');
      });

      it('should update realm enabled status', async function () {
        await client.realms.update({ realm: testRealmName }, { enabled: false });

        const updated = await client.realms.findOne({ realm: testRealmName });
        expect(updated.enabled).to.be.false;
      });
    });
  });

  // ==================== REALM CONFIGURATION ====================
  describe('Configuration Operations', function () {
    describe('export', function () {
      it('should export realm configuration', async function () {
        const exported = await client.realms.export({
          realm: testRealmName,
          exportClients: true,
          exportGroupsAndRoles: true,
        });

        expect(exported).to.be.an('object');
        expect(exported.realm).to.equal(testRealmName);
      });
    });

    describe('getKeys', function () {
      it('should retrieve realm keys', async function () {
        const keys = await client.realms.getKeys({ realm: testRealmName });

        expect(keys).to.be.an('object');
        expect(keys).to.have.property('keys');
        expect(keys.keys).to.be.an('array');
      });
    });

    describe('getClientSessionStats', function () {
      it('should retrieve client session statistics', async function () {
        const stats = await client.realms.getClientSessionStats({ realm: testRealmName });

        expect(stats).to.be.an('array');
      });
    });
  });

  // ==================== EVENT CONFIGURATION ====================
  describe('Event Management', function () {
    describe('getConfigEvents', function () {
      it('should retrieve event configuration', async function () {
        const config = await client.realms.getConfigEvents({ realm: testRealmName });

        expect(config).to.be.an('object');
      });
    });

    describe('updateConfigEvents', function () {
      it('should update event configuration', async function () {
        const eventConfig = {
          eventsEnabled: true,
          eventsListeners: ['jboss-logging'],
          enabledEventTypes: ['LOGIN', 'LOGOUT'],
        };

        await client.realms.updateConfigEvents({ realm: testRealmName }, eventConfig);

        const updated = await client.realms.getConfigEvents({ realm: testRealmName });
        expect(updated.eventsEnabled).to.be.true;
      });
    });

    describe('findEvents', function () {
      it('should retrieve realm events', async function () {
        const events = await client.realms.findEvents({
          realm: testRealmName,
          max: 10,
        });

        expect(events).to.be.an('array');
      });
    });

    describe('findAdminEvents', function () {
      it('should retrieve admin events', async function () {
        const events = await client.realms.findAdminEvents({
          realm: testRealmName,
          max: 10,
        });

        expect(events).to.be.an('array');
      });
    });

    describe('clearEvents', function () {
      it('should clear events for realm', async function () {
        await client.realms.clearEvents({ realm: testRealmName });
        // Verify no error thrown
      });
    });

    describe('clearAdminEvents', function () {
      it('should clear admin events for realm', async function () {
        await client.realms.clearAdminEvents({ realm: testRealmName });
        // Verify no error thrown
      });
    });
  });

  // ==================== DEFAULT GROUPS ====================
  describe('Default Groups Management', function () {
    before(async function () {
      // Create a test group first
      const group = await client.groups.create(
        { realm: testRealmName },
        { name: 'test-default-group' }
      );
      testGroupId = group.id;
    });

    describe('getDefaultGroups', function () {
      it('should retrieve default groups for realm', async function () {
        const groups = await client.realms.getDefaultGroups({
          realm: testRealmName,
        });

        expect(groups).to.be.an('array');
      });
    });

    describe('addDefaultGroup', function () {
      it('should add a group to default groups', async function () {
        await client.realms.addDefaultGroup({
          realm: testRealmName,
          id: testGroupId,
        });

        const defaultGroups = await client.realms.getDefaultGroups({
          realm: testRealmName,
        });

        expect(defaultGroups.some((g) => g.id === testGroupId)).to.be.true;
      });
    });

    describe('removeDefaultGroup', function () {
      it('should remove a group from default groups', async function () {
        await client.realms.removeDefaultGroup({
          realm: testRealmName,
          id: testGroupId,
        });

        const defaultGroups = await client.realms.getDefaultGroups({
          realm: testRealmName,
        });

        expect(defaultGroups.some((g) => g.id === testGroupId)).to.be.false;
      });
    });

    describe('getGroupByPath', function () {
      it('should retrieve group by path', async function () {
        const group = await client.realms.getGroupByPath({
          realm: testRealmName,
          path: '/test-default-group',
        });

        expect(group).to.exist;
        expect(group.name).to.equal('test-default-group');
      });
    });
  });

  // ==================== CLIENT REGISTRATION ====================
  describe('Client Registration', function () {
    let initialAccessTokenId;

    describe('createClientsInitialAccess', function () {
      it('should create initial access token for client registration', async function () {
        const result = await client.realms.createClientsInitialAccess(
          { realm: testRealmName },
          { count: 1, expiration: 3600 }
        );

        expect(result).to.have.property('token');
        initialAccessTokenId = result.id;
      });
    });

    describe('getClientsInitialAccess', function () {
      it('should list all initial access tokens', async function () {
        const tokens = await client.realms.getClientsInitialAccess({
          realm: testRealmName,
        });

        expect(tokens).to.be.an('array');
        expect(tokens.some((t) => t.id === initialAccessTokenId)).to.be.true;
      });
    });

    describe('delClientsInitialAccess', function () {
      it('should delete an initial access token', async function () {
        await client.realms.delClientsInitialAccess({
          realm: testRealmName,
          id: initialAccessTokenId,
        });

        const tokens = await client.realms.getClientsInitialAccess({
          realm: testRealmName,
        });

        expect(tokens.some((t) => t.id === initialAccessTokenId)).to.be.false;
      });
    });

    describe('getClientRegistrationPolicyProviders', function () {
      it('should retrieve client registration policy providers', async function () {
        const providers = await client.realms.getClientRegistrationPolicyProviders({
          realm: testRealmName,
        });

        expect(providers).to.be.an('array');
      });
    });
  });

  // ==================== REALM MANAGEMENT ====================
  describe('Realm Management', function () {
    describe('logoutAll', function () {
      it('should logout all users in realm', async function () {
        await client.realms.logoutAll({ realm: testRealmName });
        // Verify no error thrown
      });
    });

    describe('pushRevocation', function () {
      it('should push revocation policy to realm', async function () {
        await client.realms.pushRevocation({ realm: testRealmName });
        // Verify no error thrown
      });
    });
  });

  // ==================== CLEANUP ====================
  after(async function () {
    try {
      // Cleanup test group
      if (testGroupId) {
        await client.groups.del({ realm: testRealmName, id: testGroupId });
      }
      // Delete test realm
      await client.realms.del({ realm: testRealmName });
    } catch (err) {
      // Ignore if not found
      console.error('Cleanup error:', err.message);
    }
  });
});
