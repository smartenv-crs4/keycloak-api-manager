const path = require('path');
const http = require('http');
const https = require('https');
const { expect } = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', 'config');

const { conf } = require('propertiesmanager');
const keycloakManager = require('keycloak-api-manager');
const { TEST_REALM } = require('../testConfig');

function requestAdmin(baseUrl, token, apiPath, method = 'GET', body) {
  const url = new URL(apiPath, baseUrl);
  const transport = url.protocol === 'https:' ? https : http;
  const payload = body ? JSON.stringify(body) : null;

  const options = {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
    },
  };

  return new Promise((resolve, reject) => {
    const req = transport.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = {
              data: data ? JSON.parse(data) : null,
              statusCode: res.statusCode,
              headers: res.headers,
            };
            resolve(result);
          } catch {
            resolve({
              data: data || null,
              statusCode: res.statusCode,
              headers: res.headers,
            });
          }
        } else {
          const error = new Error(`HTTP ${res.statusCode}: ${data}`);
          error.statusCode = res.statusCode;
          error.response = data;
          reject(error);
        }
      });
    });

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

describe('Direct Keycloak API Test', function () {
  this.timeout(10000);

  const keycloakConfig = (conf && conf.keycloak) || {};
  let testClient = null;

  before(async function () {
    // Configura il realm
    keycloakManager.setConfig({ realmName: TEST_REALM });
    
    // Trova un client di test
    const clients = await keycloakManager.clients.find({ max: 1 });
    if (clients && clients.length > 0) {
      testClient = clients[0];
      console.log(`\nUsing test client: ${testClient.clientId} (ID: ${testClient.id})`);
    } else {
      this.skip();
    }
  });

  describe('Protocol Mappers API', function () {
    it('should test direct API call for protocol mappers', async function () {
      if (!testClient) {
        this.skip();
        return;
      }

      const token = keycloakManager.getToken();
      const baseUrl = keycloakConfig.baseUrl;
      const apiPath = `/admin/realms/${TEST_REALM}/clients/${testClient.id}/protocol-mappers/models`;

      console.log(`\n📡 Testing Direct API: POST ${apiPath}`);

      const protocolMapper = {
        name: `test-direct-mapper-${Date.now()}`,
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-attribute-mapper',
        consentRequired: false,
        config: {
          'user.attribute': 'email',
          'claim.name': 'email',
          'jsonType.label': 'String',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
        },
      };

      try {
        const result = await requestAdmin(
          baseUrl,
          token.accessToken,
          apiPath,
          'POST',
          protocolMapper
        );
        console.log('✅ SUCCESS - Protocol mapper created via direct API');
        console.log('Status:', result.statusCode);
        console.log('Response data:', JSON.stringify(result.data, null, 2));
        console.log('Location header:', result.headers.location);
        
        // Ora verifichiamo se è stato creato facendo una GET
        const listResult = await requestAdmin(
          baseUrl,
          token.accessToken,
          apiPath,
          'GET'
        );
        console.log('\n📋 Protocol mappers list retrieved');
        console.log('Total mappers:', listResult.data ? listResult.data.length : 0);
        
        // Cerca il mapper appena creato
        const createdMapper = listResult.data?.find(m => m.name === protocolMapper.name);
        if (createdMapper) {
          console.log('✅ Mapper found in list:', createdMapper.id);
          
          // Cleanup - prova a eliminarlo
          try {
            await requestAdmin(
              baseUrl,
              token.accessToken,
              `${apiPath}/${createdMapper.id}`,
              'DELETE'
            );
            console.log('🧹 Cleanup: Protocol mapper deleted');
          } catch (cleanupErr) {
            console.log('⚠️  Cleanup failed:', cleanupErr.message);
          }
        } else {
          console.log('⚠️  Mapper not found in list (may have been created but not visible)');
        }
        
        expect(result.statusCode).to.be.within(200, 299);
      } catch (err) {
        console.log('❌ FAILED - Direct API call failed');
        console.log('Status:', err.statusCode);
        console.log('Error:', err.message);
        console.log('Response:', err.response);
        throw err;
      }
    });

    it('should list available protocol mapper types', async function () {
      const token = keycloakManager.getToken();
      const baseUrl = keycloakConfig.baseUrl;
      const apiPath = `/admin/realms/${TEST_REALM}/client-templates`;

      console.log(`\n📡 Testing: GET ${apiPath}`);

      try {
        const result = await requestAdmin(
          baseUrl,
          token.accessToken,
          apiPath,
          'GET'
        );
        console.log('Available client templates:', result.data ? result.data.length : 0);
      } catch (err) {
        console.log('⚠️  Could not fetch client templates:', err.message);
      }

      // Prova anche server info
      const serverInfoPath = `/admin/serverinfo`;
      console.log(`\n📡 Testing: GET ${serverInfoPath}`);

      try {
        const serverInfo = await requestAdmin(
          baseUrl,
          token.accessToken,
          serverInfoPath,
          'GET'
        );
        
        if (serverInfo.data && serverInfo.data.providers && serverInfo.data.providers.protocolMapper) {
          console.log('\n📋 Available Protocol Mapper Providers:');
          Object.keys(serverInfo.data.providers.protocolMapper).forEach(provider => {
            console.log(`  - ${provider}`);
          });
        }
      } catch (err) {
        console.log('⚠️  Could not fetch server info:', err.message);
      }
    });
  });

  describe('Fine-Grained Permissions API', function () {
    it('should test direct API call for users management permissions', async function () {
      const token = keycloakManager.getToken();
      const baseUrl = keycloakConfig.baseUrl;
      const apiPath = `/admin/realms/${TEST_REALM}/users-management-permissions`;

      console.log(`\n📡 Testing Direct API: GET ${apiPath}`);

      try {
        const result = await requestAdmin(
          baseUrl,
          token.accessToken,
          apiPath,
          'GET'
        );
        console.log('✅ SUCCESS - Users management permissions retrieved');
        console.log('Status:', result.statusCode);
        console.log('Response:', JSON.stringify(result.data, null, 2));
        expect(result.data).to.be.an('object');

        if (!result.data.enabled) {
          console.log('\n🔧 Attempting to enable fine-grained permissions...');
          
          try {
            const updateResult = await requestAdmin(
              baseUrl,
              token.accessToken,
              apiPath,
              'PUT',
              { enabled: true }
            );
            console.log('✅ Fine-grained permissions enabled successfully');
            console.log('Status:', updateResult.statusCode);
            console.log('Update response:', JSON.stringify(updateResult.data, null, 2));
          } catch (updateErr) {
            console.log('❌ FAILED to enable permissions');
            console.log('Status:', updateErr.statusCode);
            console.log('Error:', updateErr.message);
            console.log('Response:', updateErr.response);
          }
        } else {
          console.log('ℹ️  Fine-grained permissions already enabled');
        }
      } catch (err) {
        console.log('❌ FAILED - Direct API call failed');
        console.log('Status:', err.statusCode);
        console.log('Error:', err.message);
        console.log('Response:', err.response);
        throw err;
      }
    });
  });
});
