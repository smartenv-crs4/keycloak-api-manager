const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Components Handler', function () {
  this.timeout(10000);
  let client;
  let testComponentId;

  before(function () {
    client = getAdminClient();
  });

  describe('create', function () {
    it('should create a component with valid representation', async function () {
      const componentRepresentation = {
        name: 'integration-test-component',
        providerId: 'org.keycloak.storage.UserStorageProvider',
        providerType: 'org.keycloak.storage.UserStorageProvider',
        config: {
          priority: ['0'],
        },
      };

      const result = await client.components.create(
        { realm: 'test-realm' },
        componentRepresentation
      );

      expect(result).to.have.property('id');
      testComponentId = result.id;
    });
  });

  describe('find', function () {
    it('should list all components', async function () {
      const components = await client.components.find({ realm: 'test-realm' });

      expect(components).to.be.an('array');
    });

    it('should filter components by type', async function () {
      const components = await client.components.find({
        realm: 'test-realm',
        type: 'org.keycloak.storage.UserStorageProvider',
      });

      expect(components).to.be.an('array');
    });
  });

  describe('findOne', function () {
    it('should find a specific component by id', async function () {
      const component = await client.components.findOne({
        realm: 'test-realm',
        id: testComponentId,
      });

      expect(component).to.exist;
      expect(component.name).to.equal('integration-test-component');
    });
  });

  describe('update', function () {
    it('should update component attributes', async function () {
      const updateRepresentation = {
        name: 'updated-integration-test-component',
      };

      await client.components.update(
        { realm: 'test-realm', id: testComponentId },
        updateRepresentation
      );

      const updatedComponent = await client.components.findOne({
        realm: 'test-realm',
        id: testComponentId,
      });

      expect(updatedComponent.name).to.equal('updated-integration-test-component');
    });
  });

  after(async function () {
    // Cleanup: delete test component
    try {
      if (testComponentId) {
        await client.components.del({ realm: 'test-realm', id: testComponentId });
      }
    } catch (err) {
      // Ignore if not found
    }
  });
});
