const path = require('path');
const http = require('http');
const https = require('https');
const { expect } = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', '..', 'config');

const { conf } = require('propertiesmanager');
const keycloakManager = require('keycloak-api-manager');
const { TEST_REALM } = require('../../testConfig');

describe('Protocol Mappers - Debug Client Library', function () {
  this.timeout(10000);

  const keycloakConfig = (conf && conf.keycloak) || {};
  let testClient = null;

  before(async function () {
    keycloakManager.setConfig({ realmName: TEST_REALM });

    const clients = await keycloakManager.clients.find({ clientId: 'test-client' });
    if (clients && clients.length > 0) {
      testClient = clients[0];
      console.log(`\nUsing client: ${testClient.clientId} (${testClient.id})`);
    } else {
      this.skip();
    }
  });

  it('should log keycloak-admin-client requests', async function () {
    if (!testClient) {
      this.skip();
      return;
    }

    // Hook into Node's http module to log requests
    const originalRequest = http.request;
    let lastRequest = null;

    http.request = function(...args) {
      const urlOrOptions = args[0];
      lastRequest = {
        method: args[1]?.method || (typeof args[0] === 'object' ? args[0].method : undefined),
        url: typeof args[0] === 'string' ? args[0] : args[0]?.href,
        options: typeof args[0] === 'object' ? args[0] : args[1],
      };
      console.log('\n📝 HTTP Request Logged:');
      console.log('Method:', lastRequest.method);
      console.log('URL:', lastRequest.url);
      if (lastRequest.options) {
        console.log('Headers:', JSON.stringify(lastRequest.options.headers, null, 2));
      }
      return originalRequest.apply(this, args);
    };

    try {
      console.log('\n=== Attempting protocol mapper creation via library ===');
      
      await keycloakManager.clients.addProtocolMapper(
        { id: testClient.id },
        {
          name: `debug-mapper-${Date.now()}`,
          protocol: 'openid-connect',
          protocolMapper: 'oidc-usermodel-attribute-mapper',
          consentRequired: false,
          config: {
            'user.attribute': 'email',
            'claim.name': 'email_debug',
            'jsonType.label': 'String',
            'id.token.claim': 'true',
            'access.token.claim': 'true',
          },
        }
      );
      
      console.log('✅ SUCCESS');
    } catch (err) {
      console.log('❌ ERROR:', err.message);
      if (lastRequest) {
        console.log('\nLast request details:', JSON.stringify(lastRequest, null, 2));
      }
    } finally {
      // Restore original
      http.request = originalRequest;
    }
  });
});
