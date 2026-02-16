const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Groups Handler', function () {
  this.timeout(10000);
  let client;
  let testGroupId;

  before(function () {
    client = getAdminClient();
  });

  describe('create', function () {
    it('should create a group with valid representation', async function () {
      const groupRepresentation = {
        name: 'integration-test-group',
      };

      const result = await client.groups.create(
        { realm: 'test-realm' },
        groupRepresentation
      );

      expect(result).to.have.property('id');
      testGroupId = result.id;
    });
  });

  describe('find', function () {
    it('should list all groups', async function () {
      const groups = await client.groups.find({ realm: 'test-realm' });

      expect(groups).to.be.an('array');
      expect(groups.some((g) => g.name === 'integration-test-group')).to.be.true;
    });

    it('should search groups by name', async function () {
      const groups = await client.groups.find({
        realm: 'test-realm',
        search: 'integration-test',
      });

      expect(groups).to.be.an('array');
      expect(groups.some((g) => g.name === 'integration-test-group')).to.be.true;
    });
  });

  describe('findOne', function () {
    it('should find a specific group by id', async function () {
      const group = await client.groups.findOne({ realm: 'test-realm', id: testGroupId });

      expect(group).to.exist;
      expect(group.name).to.equal('integration-test-group');
    });
  });

  describe('update', function () {
    it('should update group attributes', async function () {
      const updateRepresentation = {
        name: 'updated-integration-test-group',
      };

      await client.groups.update(
        { realm: 'test-realm', id: testGroupId },
        updateRepresentation
      );

      const updatedGroup = await client.groups.findOne({
        realm: 'test-realm',
        id: testGroupId,
      });

      expect(updatedGroup.name).to.equal('updated-integration-test-group');
    });
  });

  after(async function () {
    // Cleanup: delete test group
    try {
      if (testGroupId) {
        await client.groups.del({ realm: 'test-realm', id: testGroupId });
      }
    } catch (err) {
      // Ignore if not found
    }
  });
});
