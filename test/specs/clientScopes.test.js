const path = require('path');
const http = require('http');
const https = require('https');
const { expect } = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', 'config');

const { conf } = require('propertiesmanager');
const keycloakManager = require('keycloak-api-manager');

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
        let parsed = data;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch (err) {
          parsed = data;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function getAdminToken(baseUrl, username, password) {
  const url = new URL('/realms/master/protocol/openid-connect/token', baseUrl);
  const transport = url.protocol === 'https:' ? https : http;

  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: 'admin-cli',
    username,
    password,
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  return new Promise((resolve, reject) => {
    const req = transport.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          resolve(parsed.access_token);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

function shouldSkipFeature(err) {
  if (!err || !err.message) {
    return false;
  }
  const text = err.message.toLowerCase();
  return (
    text.includes('protocolmapper provider not found') ||
    text.includes('not supported') ||
    text.includes('http 404') ||
    text.includes('unknown_error')
  );
}

describe('ClientScopes Handler', function () {
  this.timeout(60000);

  const keycloakConfig = (conf && conf.keycloak) || {};
  const testRealm = `client-scopes-realm-${Date.now()}`;
  const scopeName = `client-scope-${Date.now()}`;
  const realmRoleName = `client-scope-realm-role-${Date.now()}`;
  const clientId = `client-scope-client-${Date.now()}`;
  const clientRoleName = `client-scope-client-role-${Date.now()}`;

  let adminToken = null;
  let scope = null;
  let realmRole = null;
  let client = null;
  let clientRole = null;
  let mapperId = null;

  before(async function () {
    await keycloakManager.configure({
      baseUrl: keycloakConfig.baseUrl,
      realmName: keycloakConfig.realmName,
      clientId: keycloakConfig.clientId,
      clientSecret: keycloakConfig.clientSecret,
      username: keycloakConfig.username,
      password: keycloakConfig.password,
      grantType: keycloakConfig.grantType,
      tokenLifeSpan: keycloakConfig.tokenLifeSpan,
      scope: keycloakConfig.scope,
    });

    adminToken = await getAdminToken(
      keycloakConfig.baseUrl,
      keycloakConfig.username,
      keycloakConfig.password
    );

    await keycloakManager.realms.create({ realm: testRealm, enabled: true });
    keycloakManager.setConfig({ realmName: testRealm });

    scope = await keycloakManager.clientScopes.create({
      name: scopeName,
      protocol: 'openid-connect',
      description: 'test scope',
    });

    await keycloakManager.roles.create({ name: realmRoleName });
    realmRole = await keycloakManager.roles.findOneByName({ name: realmRoleName });

    await keycloakManager.clients.create({
      clientId,
      name: clientId,
      enabled: true,
      publicClient: false,
      protocol: 'openid-connect',
      directAccessGrantsEnabled: true,
      standardFlowEnabled: true,
    });

    const clients = await keycloakManager.clients.find({ clientId });
    client = clients[0];

    await keycloakManager.clients.createRole({
      id: client.id,
      name: clientRoleName,
      description: 'client scope role',
    });

    clientRole = await keycloakManager.clients.findRole({
      id: client.id,
      roleName: clientRoleName,
    });
  });

  after(async function () {
    try {
      keycloakManager.setConfig({ realmName: testRealm });
    } catch (err) {
      // best effort
    }

    try {
      if (scope) {
        await keycloakManager.clientScopes.del({ id: scope.id });
      }
    } catch (err) {
      // best effort
    }

    try {
      if (client) {
        await keycloakManager.clients.del({ id: client.id });
      }
    } catch (err) {
      // best effort
    }

    try {
      if (realmRole) {
        await keycloakManager.roles.delByName({ name: realmRole.name });
      }
    } catch (err) {
      // best effort
    }

    try {
      await keycloakManager.realms.del({ realm: testRealm });
    } catch (err) {
      // best effort
    }

    if (typeof keycloakManager.stop === 'function') {
      keycloakManager.stop();
    }
  });

  it('should create, find, findOne, findOneByName, update and delete by name', async function () {
    const list = await keycloakManager.clientScopes.find();
    expect(list).to.be.an('array');
    expect(list.some((item) => item.id === scope.id)).to.equal(true);

    const one = await keycloakManager.clientScopes.findOne({ id: scope.id });
    expect(one).to.be.an('object');
    expect(one.name).to.equal(scopeName);

    const byName = await keycloakManager.clientScopes.findOneByName({ name: scopeName });
    expect(byName).to.be.an('object');
    expect(byName.id).to.equal(scope.id);

    const updatedDescription = `updated-${Date.now()}`;
    await keycloakManager.clientScopes.update(
      { id: scope.id },
      { name: scopeName, protocol: 'openid-connect', description: updatedDescription }
    );

    const updated = await keycloakManager.clientScopes.findOne({ id: scope.id });
    expect(updated.description).to.equal(updatedDescription);

    const direct = await requestAdmin(
      keycloakConfig.baseUrl,
      adminToken,
      `/admin/realms/${testRealm}/client-scopes/${scope.id}`
    );
    expect(direct.status).to.equal(200);
    expect(direct.body.description).to.equal(updatedDescription);

    const tempName = `client-scope-temp-${Date.now()}`;
    await keycloakManager.clientScopes.create({ name: tempName, protocol: 'openid-connect' });
    await keycloakManager.clientScopes.delByName({ name: tempName });

    const deleted = await keycloakManager.clientScopes.findOneByName({ name: tempName });
    expect(deleted).to.equal(undefined);
  });

  it('should manage default and optional client scopes', async function () {
    await keycloakManager.clientScopes.addDefaultClientScope({ id: scope.id });
    const defaults = await keycloakManager.clientScopes.listDefaultClientScopes();
    expect(defaults).to.be.an('array');
    expect(defaults.some((item) => item.id === scope.id)).to.equal(true);

    await keycloakManager.clientScopes.delDefaultClientScope({ id: scope.id });
    const defaultsAfter = await keycloakManager.clientScopes.listDefaultClientScopes();
    expect(defaultsAfter.some((item) => item.id === scope.id)).to.equal(false);

    await keycloakManager.clientScopes.addDefaultOptionalClientScope({ id: scope.id });
    const optional = await keycloakManager.clientScopes.listDefaultOptionalClientScopes();
    expect(optional).to.be.an('array');
    expect(optional.some((item) => item.id === scope.id)).to.equal(true);

    await keycloakManager.clientScopes.delDefaultOptionalClientScope({ id: scope.id });
    const optionalAfter = await keycloakManager.clientScopes.listDefaultOptionalClientScopes();
    expect(optionalAfter.some((item) => item.id === scope.id)).to.equal(false);
  });

  it('should manage protocol mappers when provider is available', async function () {
    const mapper = {
      name: `mapper-${Date.now()}`,
      protocol: 'openid-connect',
      protocolMapper: 'oidc-usermodel-property-mapper',
      config: {
        'user.attribute': 'email',
        'claim.name': 'email',
        'jsonType.label': 'String',
        'id.token.claim': 'true',
        'access.token.claim': 'true',
      },
    };

    try {
      await keycloakManager.clientScopes.addProtocolMapper({ id: scope.id }, mapper);
      const mappers = await keycloakManager.clientScopes.listProtocolMappers({ id: scope.id });
      expect(mappers).to.be.an('array');

      const foundByName = await keycloakManager.clientScopes.findProtocolMapperByName({
        id: scope.id,
        name: mapper.name,
      });
      expect(foundByName).to.be.an('object');
      mapperId = foundByName.id;

      const found = await keycloakManager.clientScopes.findProtocolMapper({
        id: scope.id,
        mapperId,
      });
      expect(found).to.be.an('object');

      const byProtocol = await keycloakManager.clientScopes.findProtocolMappersByProtocol({
        id: scope.id,
        protocol: 'openid-connect',
      });
      expect(byProtocol).to.be.an('array');

      await keycloakManager.clientScopes.updateProtocolMapper(
        { id: scope.id, mapperId },
        {
          id: mapperId,
          ...mapper,
          name: `${mapper.name}-updated`,
        }
      );

      await keycloakManager.clientScopes.delProtocolMapper({ id: scope.id, mapperId });
      mapperId = null;
    } catch (err) {
      if (shouldSkipFeature(err)) {
        this.skip();
        return;
      }
      throw err;
    }
  });

  it('should manage client and realm scope mappings', async function () {
    await keycloakManager.clientScopes.addRealmScopeMappings(
      { id: scope.id },
      [{ id: realmRole.id, name: realmRole.name }]
    );

    const realmMappings = await keycloakManager.clientScopes.listRealmScopeMappings({ id: scope.id });
    expect(realmMappings).to.be.an('array');
    expect(realmMappings.some((item) => item.id === realmRole.id)).to.equal(true);

    const availableRealm = await keycloakManager.clientScopes.listAvailableRealmScopeMappings({ id: scope.id });
    expect(availableRealm).to.be.an('array');

    const compositeRealm = await keycloakManager.clientScopes.listCompositeRealmScopeMappings({ id: scope.id });
    expect(compositeRealm).to.be.an('array');

    await keycloakManager.clientScopes.delRealmScopeMappings(
      { id: scope.id },
      [{ id: realmRole.id, name: realmRole.name }]
    );

    await keycloakManager.clientScopes.addClientScopeMappings(
      { id: scope.id, client: client.id },
      [{ id: clientRole.id, name: clientRole.name }]
    );

    const clientMappings = await keycloakManager.clientScopes.listClientScopeMappings({
      id: scope.id,
      client: client.id,
    });
    expect(clientMappings).to.be.an('array');
    expect(clientMappings.some((item) => item.id === clientRole.id)).to.equal(true);

    const availableClient = await keycloakManager.clientScopes.listAvailableClientScopeMappings({
      id: scope.id,
      client: client.id,
    });
    expect(availableClient).to.be.an('array');

    const compositeClient = await keycloakManager.clientScopes.listCompositeClientScopeMappings({
      id: scope.id,
      client: client.id,
    });
    expect(compositeClient).to.be.an('array');

    const mappings = await keycloakManager.clientScopes.listScopeMappings({ id: scope.id });
    expect(mappings).to.be.an('object');

    await keycloakManager.clientScopes.delClientScopeMappings(
      { id: scope.id, client: client.id },
      [{ id: clientRole.id, name: clientRole.name }]
    );
  });
});
