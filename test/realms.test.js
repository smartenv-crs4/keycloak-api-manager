const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Realms Handler', function () {
  this.timeout(10000);
  let client;

  before(function () {
    client = getAdminClient();
  });

  describe('create', function () {
    it('should create a realm with valid representation', async function () {
      const realmRepresentation = {
        realm: 'integration-test-realm',
        displayName: 'Integration Test Realm',
        enabled: true,
      };

      const result = await client.realms.create(realmRepresentation);

      expect(result).to.have.property('id');
      expect(result.realm).to.equal('integration-test-realm');
    });

    it('should fail with invalid representation', async function () {
      try {
        await client.realms.create({
          // Missing 'realm' field
          displayName: 'Invalid Realm',
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
      expect(realms.some((r) => r.realm === 'test-realm')).to.be.true;
    });
  });

  describe('findOne', function () {
    it('should find a specific realm by name', async function () {
      const realm = await client.realms.findOne({ realm: 'test-realm' });

      expect(realm).to.exist;
      expect(realm.realm).to.equal('test-realm');
    });
  });

  describe('update', function () {
    it('should update realm display name', async function () {
      const updateRepresentation = {
        displayName: 'Updated Test Realm',
      };

      await client.realms.update({ realm: 'test-realm' }, updateRepresentation);

      const updatedRealm = await client.realms.findOne({ realm: 'test-realm' });
      expect(updatedRealm.displayName).to.equal('Updated Test Realm');
    });
  });

  describe('getKeys', function () {
    it('should get realm keys', async function () {
      const keys = await client.realms.getKeys({ realm: 'test-realm' });

      expect(keys).to.be.an('object');
      expect(keys).to.have.property('keys');
    });
  });

  after(async function () {
    // Cleanup: delete test realm
    try {
      await client.realms.del({ realm: 'integration-test-realm' });
    } catch (err) {
      // Ignore if not found
    }
  });
});
