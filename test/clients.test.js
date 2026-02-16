const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Clients Handler', function () {
  this.timeout(10000);
  let client;
  let testClientId;

  before(function () {
    client = getAdminClient();
  });

  describe('create', function () {
    it('should create a client with valid representation', async function () {
      const clientRepresentation = {
        clientId: 'integration-test-client',
        name: 'Integration Test Client',
        enabled: true,
        publicClient: false,
        standardFlowEnabled: true,
      };

      const result = await client.clients.create(
        { realm: 'test-realm' },
        clientRepresentation
      );

      expect(result).to.have.property('id');
      testClientId = result.id;
    });
  });

  describe('find', function () {
    it('should list all clients', async function () {
      const clients = await client.clients.find({ realm: 'test-realm' });

      expect(clients).to.be.an('array');
      expect(clients.some((c) => c.clientId === 'integration-test-client')).to.be.true;
    });

    it('should search clients by clientId', async function () {
      const clients = await client.clients.find({
        realm: 'test-realm',
        clientId: 'integration-test-client',
      });

      expect(clients).to.be.an('array');
      expect(clients.length).to.equal(1);
      expect(clients[0].clientId).to.equal('integration-test-client');
    });
  });

  describe('findOne', function () {
    it('should find a specific client by id', async function () {
      const foundClient = await client.clients.findOne({
        realm: 'test-realm',
        id: testClientId,
      });

      expect(foundClient).to.exist;
      expect(foundClient.clientId).to.equal('integration-test-client');
    });
  });

  describe('update', function () {
    it('should update client attributes', async function () {
      const updateRepresentation = {
        name: 'Updated Client Name',
        publicClient: true,
      };

      await client.clients.update(
        { realm: 'test-realm', id: testClientId },
        updateRepresentation
      );

      const updatedClient = await client.clients.findOne({
        realm: 'test-realm',
        id: testClientId,
      });

      expect(updatedClient.name).to.equal('Updated Client Name');
      expect(updatedClient.publicClient).to.be.true;
    });
  });

  describe('generateNewClientSecret', function () {
    it('should generate a new client secret', async function () {
      const secret = await client.clients.generateNewClientSecret({
        realm: 'test-realm',
        id: testClientId,
      });

      expect(secret).to.have.property('value');
      expect(secret.value).to.be.a('string');
      expect(secret.value.length).to.be.greaterThan(0);
    });
  });

  describe('getClientSecret', function () {
    it('should retrieve the client secret', async function () {
      const secret = await client.clients.getClientSecret({
        realm: 'test-realm',
        id: testClientId,
      });

      expect(secret).to.have.property('value');
      expect(secret.value).to.be.a('string');
    });
  });

  after(async function () {
    // Cleanup: delete test client
    try {
      if (testClientId) {
        await client.clients.del({ realm: 'test-realm', id: testClientId });
      }
    } catch (err) {
      // Ignore if not found
    }
  });
});
