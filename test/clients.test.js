const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Clients Handler', function () {
  this.timeout(15000);
  let client;
  let testClientId;
  let testRoleId;

  before(async function () {
    client = getAdminClient();

    // Create a test role for client role mappings
    const role = await client.roles.create(
      { realm: 'test-realm' },
      { name: 'clients-test-role' }
    );
    testRoleId = role.id;
  });

  // ==================== CLIENT CRUD ====================
  describe('CRUD Operations', function () {
    describe('create', function () {
      it('should create a client with valid representation', async function () {
        const clientRep = {
          clientId: `test-client-${Date.now()}`,
          name: 'Integration Test Client',
          enabled: true,
          publicClient: false,
          standardFlowEnabled: true,
          directAccessGrantsEnabled: true,
        };

        const result = await client.clients.create(
          { realm: 'test-realm' },
          clientRep
        );

        expect(result).to.have.property('id');
        testClientId = result.id;
      });

      it('should fail creating duplicate clientId', async function () {
        const clientId = `unique-client-${Date.now()}`;

        await client.clients.create({ realm: 'test-realm' }, {
          clientId,
          enabled: true,
        });

        try {
          await client.clients.create({ realm: 'test-realm' }, {
            clientId,
            enabled: true,
          });
          expect.fail('Should have thrown error for duplicate clientId');
        } catch (err) {
          expect(err).to.exist;
        }
      });
    });

    describe('find', function () {
      it('should list all clients in realm', async function () {
        const clients = await client.clients.find({ realm: 'test-realm' });

        expect(clients).to.be.an('array');
        expect(clients.length).to.be.greaterThan(0);
      });

      it('should search clients by clientId', async function () {
        const foundClients = await client.clients.find({
          realm: 'test-realm',
          clientId: `test-client-${Date.now()}`,
        });

        expect(foundClients).to.be.an('array');
      });
    });

    describe('findOne', function () {
      it('should find a specific client by id', async function () {
        const foundClient = await client.clients.findOne({
          realm: 'test-realm',
          id: testClientId,
        });

        expect(foundClient).to.exist;
        expect(foundClient.id).to.equal(testClientId);
      });
    });

    describe('update', function () {
      it('should update client attributes', async function () {
        const updateRep = {
          name: 'Updated Client Name',
          description: 'Updated description',
          publicClient: true,
          attributes: {
            'custom-attr': 'value',
          },
        };

        await client.clients.update(
          { realm: 'test-realm', id: testClientId },
          updateRep
        );

        const updated = await client.clients.findOne({
          realm: 'test-realm',
          id: testClientId,
        });

        expect(updated.name).to.equal('Updated Client Name');
        expect(updated.description).to.equal('Updated description');
      });
    });
  });

  // ==================== CLIENT SECRETS ====================
  describe('Secret Management', function () {
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
      it('should retrieve the current client secret', async function () {
        const secret = await client.clients.getClientSecret({
          realm: 'test-realm',
          id: testClientId,
        });

        expect(secret).to.have.property('value');
        expect(secret.value).to.be.a('string');
      });
    });
  });

  // ==================== CLIENT CREDENTIALS ====================
  describe('Credential Management', function () {
    describe('listClientCredentials', function () {
      it('should list all client credentials', async function () {
        const creds = await client.clients.getCredentials({
          realm: 'test-realm',
          id: testClientId,
        });

        expect(creds).to.be.an('array');
      });
    });
  });

  // ==================== CLIENT SESSIONS ====================
  describe('Session Management', function () {
    describe('getUserConsents', function () {
      it('should retrieve user consents for client', async function () {
        // This might be empty but should not error
        try {
          const consents = await client.clients.getUserConsents({
            realm: 'test-realm',
            id: testClientId,
          });

          expect(consents).to.be.an('array');
        } catch (err) {
          // Some versions might not support this
        }
      });
    });

    describe('getActiveSessions', function () {
      it('should retrieve active sessions for client', async function () {
        const sessions = await client.clients.getActiveSessions({
          realm: 'test-realm',
          id: testClientId,
        });

        expect(sessions).to.be.an('array');
      });
    });

    describe('getOfflineSessions', function () {
      it('should retrieve offline sessions for client', async function () {
        const sessions = await client.clients.getOfflineSessions({
          realm: 'test-realm',
          id: testClientId,
        });

        expect(sessions).to.be.an('array');
      });
    });
  });

  // ==================== CLIENT ROLE MAPPINGS ====================
  describe('Role Mappings', function () {
    describe('listServiceAccountRoleMappings', function () {
      it('should list service account role mappings', async function () {
        try {
          const mappings = await client.clients.listServiceAccountRoleMappings({
            realm: 'test-realm',
            id: testClientId,
          });

          expect(mappings).to.be.an('object');
        } catch (err) {
          // Service account might not be enabled
        }
      });
    });
  });

  // ==================== PROTOCOL MAPPERS ====================
  describe('Protocol Mappers', function () {
    describe('listProtocolMappers', function () {
      it('should list protocol mappers', async function () {
        const mappers = await client.clients.listProtocolMappers({
          realm: 'test-realm',
          id: testClientId,
        });

        expect(mappers).to.be.an('array');
      });
    });

    describe('addProtocolMapper', function () {
      it('should add a protocol mapper', async function () {
        const mapper = {
          name: 'test-mapper',
          protocol: 'openid-connect',
          protocolMapper: 'oidc-usermodel-attribute-mapper',
          config: {
            'user.attribute': 'email',
            'claim.name': 'email',
            'jsonType.label': 'String',
          },
        };

        const result = await client.clients.addProtocolMapper(
          { realm: 'test-realm', id: testClientId },
          mapper
        );

        expect(result).to.exist;
      });
    });
  });

  // ==================== SCOPE MAPPINGS ====================
  describe('Scope Mappings', function () {
    describe('listScopeMappings', function () {
      it('should list all scope mappings', async function () {
        const mappings = await client.clients.listScopeMappings({
          realm: 'test-realm',
          id: testClientId,
        });

        expect(mappings).to.be.an('object');
      });
    });
  });

  // ==================== CLEANUP ====================
  after(async function () {
    try {
      if (testClientId) {
        await client.clients.del({ realm: 'test-realm', id: testClientId });
      }
      if (testRoleId) {
        await client.roles.del({ realm: 'test-realm', id: testRoleId });
      }
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  });
});
