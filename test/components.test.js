const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Components Handler', function () {
  this.timeout(15000);
  let client;
  let testComponentId;

  before(function () {
    client = getAdminClient();
  });

  // ==================== COMPONENT CRUD ====================
  describe('CRUD Operations', function () {
    describe('create', function () {
      it('should create a component with valid representation', async function () {
        const componentRep = {
          name: `test-component-${Date.now()}`,
          providerId: 'org.keycloak.storage.UserStorageProvider',
          providerType: 'org.keycloak.storage.UserStorageProvider',
          config: {
            priority: ['0'],
          },
        };

        const result = await client.components.create(
          { realm: 'test-realm' },
          componentRep
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

      it('should filter components by provider id', async function () {
        const components = await client.components.find({
          realm: 'test-realm',
          filter: 'org.keycloak.storage.UserStorageProvider',
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
        expect(component.id).to.equal(testComponentId);
      });
    });

    describe('update', function () {
      it('should update component attributes', async function () {
        const updateRep = {
          name: `updated-component-${Date.now()}`,
          config: {
            priority: ['1'],
          },
        };

        await client.components.update(
          { realm: 'test-realm', id: testComponentId },
          updateRep
        );

        const updated = await client.components.findOne({
          realm: 'test-realm',
          id: testComponentId,
        });

        expect(updated.name).to.include('updated-component');
      });
    });
  });

  // ==================== SUBCOMPONENTS ====================
  describe('Subcomponents', function () {
    describe('listSubComponents', function () {
      it('should list subcomponents', async function () {
        const subcomponents = await client.components.listSubComponents({
          realm: 'test-realm',
          id: testComponentId,
        });

        expect(subcomponents).to.be.an('array');
      });
    });
  });

  // ==================== CLEANUP ====================
  after(async function () {
    try {
      if (testComponentId) {
        await client.components.del({ realm: 'test-realm', id: testComponentId });
      }
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  });
});
