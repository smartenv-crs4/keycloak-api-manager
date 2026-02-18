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

describe('Roles Handler', function () {
  this.timeout(60000);

  const keycloakConfig = (conf && conf.keycloak) || {};
  const testRealm = `roles-realm-${Date.now()}`;
  const roleName = `roles-base-${Date.now()}`;
  const secondRoleName = `roles-second-${Date.now()}`;
  const compositeRoleName = `roles-composite-${Date.now()}`;
  const clientId = `roles-client-${Date.now()}`;
  const clientRoleName = `roles-client-role-${Date.now()}`;
  const userName = `roles-user-${Date.now()}`;

  let adminToken = null;
  let baseRole = null;
  let secondRole = null;
  let compositeRole = null;
  let user = null;
  let client = null;
  let clientRole = null;

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

    await keycloakManager.realms.create({
      realm: testRealm,
      enabled: true,
    });

    keycloakManager.setConfig({ realmName: testRealm });

    await keycloakManager.roles.create({ name: roleName, description: 'base role' });
    await keycloakManager.roles.create({ name: secondRoleName, description: 'second role' });
    await keycloakManager.roles.create({ name: compositeRoleName, description: 'composite role' });

    baseRole = await keycloakManager.roles.findOneByName({ name: roleName });
    secondRole = await keycloakManager.roles.findOneByName({ name: secondRoleName });
    compositeRole = await keycloakManager.roles.findOneByName({ name: compositeRoleName });

    user = await keycloakManager.users.create({
      username: userName,
      enabled: true,
      email: `${userName}@example.com`,
    });

    await keycloakManager.users.addRealmRoleMappings({
      id: user.id,
      roles: [{ id: baseRole.id, name: baseRole.name }],
    });

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
      description: 'role for composite test',
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
      if (user) {
        await keycloakManager.users.del({ id: user.id });
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
      await keycloakManager.roles.delByName({ name: compositeRoleName });
    } catch (err) {
      // best effort
    }

    try {
      await keycloakManager.roles.delByName({ name: secondRoleName });
    } catch (err) {
      // best effort
    }

    try {
      await keycloakManager.roles.delByName({ name: roleName });
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

  it('should create, find, find by id/name, and update roles', async function () {
    const roles = await keycloakManager.roles.find({ search: roleName });
    expect(roles).to.be.an('array');
    expect(roles.some((role) => role.name === roleName)).to.equal(true);

    const byName = await keycloakManager.roles.findOneByName({ name: roleName });
    expect(byName).to.be.an('object');
    expect(byName.id).to.equal(baseRole.id);

    const byId = await keycloakManager.roles.findOneById({ id: baseRole.id });
    expect(byId).to.be.an('object');
    expect(byId.name).to.equal(roleName);

    const updatedName = `${roleName}-updated`;
    await keycloakManager.roles.updateByName(
      { name: roleName },
      { name: updatedName, description: 'updated by name' }
    );

    const updatedByName = await keycloakManager.roles.findOneByName({ name: updatedName });
    expect(updatedByName).to.be.an('object');

    await keycloakManager.roles.updateById(
      { id: updatedByName.id },
      { name: roleName, description: 'updated by id' }
    );

    const restored = await keycloakManager.roles.findOneByName({ name: roleName });
    expect(restored).to.be.an('object');
    expect(restored.description).to.equal('updated by id');

    const direct = await requestAdmin(
      keycloakConfig.baseUrl,
      adminToken,
      `/admin/realms/${testRealm}/roles/${roleName}`
    );
    expect(direct.status).to.equal(200);
    expect(direct.body.name).to.equal(roleName);
  });

  it('should find users with a role', async function () {
    const users = await keycloakManager.roles.findUsersWithRole({ name: roleName });
    expect(users).to.be.an('array');
    expect(users.some((item) => item.id === user.id)).to.equal(true);
  });

  it('should manage composite roles for realm and client', async function () {
    await keycloakManager.roles.createComposite(
      { roleId: compositeRole.id },
      [
        { id: secondRole.id, name: secondRole.name },
        {
          id: clientRole.id,
          name: clientRole.name,
          clientRole: true,
          containerId: client.id,
        },
      ]
    );

    const allComposite = await keycloakManager.roles.getCompositeRoles({ id: compositeRole.id });
    expect(allComposite).to.be.an('array');
    expect(allComposite.some((role) => role.id === secondRole.id)).to.equal(true);

    const realmComposite = await keycloakManager.roles.getCompositeRolesForRealm({ id: compositeRole.id });
    expect(realmComposite).to.be.an('array');
    expect(realmComposite.some((role) => role.id === secondRole.id)).to.equal(true);

    const clientComposite = await keycloakManager.roles.getCompositeRolesForClient({
      id: compositeRole.id,
      clientId: client.id,
    });
    expect(clientComposite).to.be.an('array');
    expect(clientComposite.some((role) => role.id === clientRole.id)).to.equal(true);
  });

  it('should delete role by name and verify via admin API', async function () {
    const tempRoleName = `roles-temp-${Date.now()}`;
    await keycloakManager.roles.create({ name: tempRoleName });

    await keycloakManager.roles.delByName({ name: tempRoleName });

    const direct = await requestAdmin(
      keycloakConfig.baseUrl,
      adminToken,
      `/admin/realms/${testRealm}/roles/${tempRoleName}`
    );
    expect(direct.status).to.equal(404);
  });
});
