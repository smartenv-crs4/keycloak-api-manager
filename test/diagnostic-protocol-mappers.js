const path = require('path');
const http = require('http');
const https = require('https');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, 'config');

const { conf } = require('propertiesmanager');
const keycloakManager = require('keycloak-api-manager');
const { TEST_REALM } = require('./testConfig');

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

async function main() {
  try {
    // Configura keycloak manager
    const keycloakConfig = (conf && conf.keycloak) || {};
    console.log('keycloakConfig baseUrl:', keycloakConfig.baseUrl);
    
    if (!keycloakConfig.baseUrl) {
      throw new Error('baseUrl not configured in keycloak config');
    }
    
    await keycloakManager.configure(keycloakConfig);
    
    keycloakManager.setConfig({ realmName: TEST_REALM });
    const token = keycloakManager.getToken();
    const baseUrl = keycloakConfig.baseUrl.endsWith('/') ? keycloakConfig.baseUrl : `${keycloakConfig.baseUrl}/`;

    console.log('\n=== PROTOCOL MAPPER DIRECT API TEST ===');
    console.log('Base URL:', baseUrl);
    console.log();

    // 1. Trova il test client
    const clients = await keycloakManager.clients.find({ clientId: 'test-client' });
    if (!clients || !clients.length) {
      console.log('❌ Test client not found');
      process.exit(1);
    }
    const testClient = clients[0];
    console.log(`✅ Found test client: ${testClient.clientId} (ID: ${testClient.id})\n`);

    // 2. Prova a creare un protocol mapper con API diretta
    const apiPath = `/admin/realms/${TEST_REALM}/clients/${testClient.id}/protocol-mappers/models`;
    
    const protocolMapper = {
      name: `direct-api-test-${Date.now()}`,
      protocol: 'openid-connect',
      protocolMapper: 'oidc-usermodel-attribute-mapper',
      consentRequired: false,
      config: {
        'user.attribute': 'email',
        'claim.name': 'email_test',
        'jsonType.label': 'String',
        'id.token.claim': 'true',
        'access.token.claim': 'true',
      },
    };

    console.log(`📡 Direct API POST: ${apiPath}`);
    console.log(`Payload: ${JSON.stringify(protocolMapper, null, 2)}\n`);

    const result = await requestAdmin(
      baseUrl,
      token.accessToken,
      apiPath,
      'POST',
      protocolMapper
    );

    console.log(`✅ SUCCESS - Status: ${result.statusCode}`);
    console.log(`Location: ${result.headers.location || 'N/A'}\n`);

    // 3. Verifica che sia stato creato
    const listResult = await requestAdmin(
      baseUrl,
      token.accessToken,
      apiPath,
      'GET'
    );

    const createdMapper = listResult.data?.find(m => m.name === protocolMapper.name);
    if (createdMapper) {
      console.log(`✅ Mapper verified in list:`);
      console.log(`   ID: ${createdMapper.id}`);
      console.log(`   Name: ${createdMapper.name}`);
      console.log(`   Protocol Mapper: ${createdMapper.protocolMapper}\n`);

      // Cleanup
      await requestAdmin(
        baseUrl,
        token.accessToken,
        `${apiPath}/${createdMapper.id}`,
        'DELETE'
      );
      console.log('🧹 Cleanup: Mapper deleted\n');
    }

    // 4. Prova con il client manager della libreria
    console.log('=== TESTING THROUGH KEYCLOAK MANAGER ===\n');
    
    try {
      await keycloakManager.clients.addProtocolMapper(
        { id: testClient.id },
        {
          name: `library-test-${Date.now()}`,
          protocol: 'openid-connect',
          protocolMapper: 'oidc-usermodel-attribute-mapper',
          consentRequired: false,
          config: {
            'user.attribute': 'username',
            'claim.name': 'user_name',
            'jsonType.label': 'String',
            'id.token.claim': 'true',
            'access.token.claim': 'true',
          },
        }
      );
      console.log('✅ SUCCESS through keycloak-api-manager');
    } catch (err) {
      console.log('❌ FAILED through keycloak-api-manager');
      console.log(`Error: ${err.message}\n`);
    }

    console.log('\n=== SUMMARY ===');
    console.log('Direct API: ✅ Works');
    console.log('Library: Check output above');

  } catch (err) {
    console.error('❌ ERROR:', err.message);
    if (err.response) {
      console.error('Response:', err.response);
    }
    process.exit(1);
  }
}

main();
