const path = require('path');
const http = require('http');
const https = require('https');
const { expect } = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', 'config');

const { conf } = require('propertiesmanager');
const keycloakManager = require('keycloak-api-manager');
const { TEST_REALM, generateUniqueName } = require('../testConfig');

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

describe('Groups Handler', function () {
  this.timeout(60000);

  const keycloakConfig = (conf && conf.keycloak) || {};
  const parentGroupName = generateUniqueName('groups-parent');
  const childGroupName = generateUniqueName('groups-child');
  const testUserName = generateUniqueName('groups-user');
  const testRealmRoleName = generateUniqueName('groups-realm-role');
  const testClientId = generateUniqueName('groups-client');
  const testClientRoleName = generateUniqueName('groups-client-role');

  let adminToken = null;
  let parentGroupId = null;
  let childGroupId = null;
  let userId = null;
  let realmRole = null;
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

    // Use shared test realm (created by enableServerFeatures)
    keycloakManager.setConfig({ realmName: TEST_REALM });

    const createdParent = await keycloakManager.groups.create({ name: parentGroupName });
    parentGroupId = createdParent.id;

    const createdChild = await keycloakManager.groups.create({
      name: childGroupName,
      parentId: parentGroupId,
    });
    childGroupId = createdChild.id;

    const createdUser = await keycloakManager.users.create({
      username: testUserName,
      enabled: true,
      email: `${testUserName}@example.com`,
    });
    userId = createdUser.id;

    await keycloakManager.users.addToGroup({ id: userId, groupId: parentGroupId });

    await keycloakManager.roles.create({ name: testRealmRoleName });
    realmRole = await keycloakManager.roles.findOneByName({ name: testRealmRoleName });

    await keycloakManager.clients.create({
      clientId: testClientId,
      name: testClientId,
      enabled: true,
      publicClient: false,
      protocol: 'openid-connect',
      directAccessGrantsEnabled: true,
      standardFlowEnabled: true,
    });

    const clients = await keycloakManager.clients.find({ clientId: testClientId });
    client = clients[0];

    await keycloakManager.clients.createRole({
      id: client.id,
      name: testClientRoleName,
      description: 'Groups test client role',
    });

    clientRole = await keycloakManager.clients.findRole({
      id: client.id,
      roleName: testClientRoleName,
    });
  });

  after(async function () {
    try {
      keycloakManager.setConfig({ realmName: TEST_REALM });
    } catch (err) {
      // best effort
    }

    try {
      if (userId) {
        await keycloakManager.users.del({ id: userId });
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
      if (childGroupId) {
        await keycloakManager.groups.del({ id: childGroupId });
      }
    } catch (err) {
      // best effort
    }

    try {
      if (parentGroupId) {
        await keycloakManager.groups.del({ id: parentGroupId });
      }
    } catch (err) {
      // best effort
    }

    // Don't delete shared test realm

    if (typeof keycloakManager.stop === 'function') {
      keycloakManager.stop();
    }
  });

  it('should create, find, findOne, count and update groups', async function () {
    const groups = await keycloakManager.groups.find({ search: parentGroupName });
    expect(groups).to.be.an('array');
    expect(groups.some((group) => group.id === parentGroupId)).to.equal(true);

    const one = await keycloakManager.groups.findOne({ id: parentGroupId });
    expect(one).to.be.an('object');
    expect(one.id).to.equal(parentGroupId);

    const count = await keycloakManager.groups.count({ search: parentGroupName });
    expect(count).to.be.a('number');
    expect(count).to.be.greaterThan(0);

    const newName = `${parentGroupName}-updated`;
    await keycloakManager.groups.update(
      { id: parentGroupId },
      { name: newName }
    );

    const updated = await keycloakManager.groups.findOne({ id: parentGroupId });
    expect(updated.name).to.equal(newName);

    const direct = await requestAdmin(
      keycloakConfig.baseUrl,
      adminToken,
      `/admin/realms/${TEST_REALM}/groups/${parentGroupId}`
    );
    expect(direct.status).to.equal(200);
    expect(direct.body.name).to.equal(newName);
  });

  it('should list subgroups and members', async function () {
    const subGroups = await keycloakManager.groups.listSubGroups({
      parentId: parentGroupId,
      briefRepresentation: true,
    });
    expect(subGroups).to.be.an('array');
    expect(subGroups.some((group) => group.id === childGroupId)).to.equal(true);

    const directMembers = await requestAdmin(
      keycloakConfig.baseUrl,
      adminToken,
      `/admin/realms/${TEST_REALM}/groups/${parentGroupId}/members`
    );
    expect(directMembers.status).to.equal(200);
    expect(Array.isArray(directMembers.body)).to.equal(true);
    expect(directMembers.body.some((member) => member.id === userId)).to.equal(true);
  });

  it('should manage realm role mappings for groups', async function () {
    await keycloakManager.groups.addRealmRoleMappings({
      id: parentGroupId,
      roles: [{ id: realmRole.id, name: realmRole.name }],
    });

    const realmRoles = await keycloakManager.groups.listRealmRoleMappings({ id: parentGroupId });
    expect(realmRoles).to.be.an('array');
    expect(realmRoles.some((role) => role.id === realmRole.id)).to.equal(true);

    const compositeRoles = await keycloakManager.groups.listCompositeRealmRoleMappings({ id: parentGroupId });
    expect(compositeRoles).to.be.an('array');

    const availableRoles = await keycloakManager.groups.listAvailableRealmRoleMappings({ id: parentGroupId });
    expect(availableRoles).to.be.an('array');

    const mappings = await keycloakManager.groups.listRoleMappings({ id: parentGroupId });
    expect(mappings).to.be.an('object');

    await keycloakManager.groups.delRealmRoleMappings({
      id: parentGroupId,
      roles: [{ id: realmRole.id, name: realmRole.name }],
    });

    const realmRolesAfter = await keycloakManager.groups.listRealmRoleMappings({ id: parentGroupId });
    expect(realmRolesAfter.some((role) => role.id === realmRole.id)).to.equal(false);
  });

  it('should manage client role mappings for groups', async function () {
    await keycloakManager.groups.addClientRoleMappings({
      id: parentGroupId,
      clientUniqueId: client.id,
      roles: [{ id: clientRole.id, name: clientRole.name }],
    });

    const clientRoles = await keycloakManager.groups.listClientRoleMappings({
      id: parentGroupId,
      clientUniqueId: client.id,
    });
    expect(clientRoles).to.be.an('array');
    expect(clientRoles.some((role) => role.id === clientRole.id)).to.equal(true);

    const available = await keycloakManager.groups.listAvailableClientRoleMappings({
      id: parentGroupId,
      clientUniqueId: client.id,
    });
    expect(available).to.be.an('array');

    const composite = await keycloakManager.groups.listCompositeClientRoleMappings({
      id: parentGroupId,
      clientUniqueId: client.id,
    });
    expect(composite).to.be.an('array');

    await keycloakManager.groups.delClientRoleMappings({
      id: parentGroupId,
      clientUniqueId: client.id,
      roles: [{ id: clientRole.id, name: clientRole.name }],
    });

    const rolesAfter = await keycloakManager.groups.listClientRoleMappings({
      id: parentGroupId,
      clientUniqueId: client.id,
    });
    expect(rolesAfter.some((role) => role.id === clientRole.id)).to.equal(false);
  });

  it('should delete groups and verify via admin API', async function () {
    const toDelete = await keycloakManager.groups.create({ name: `groups-delete-${Date.now()}` });
    expect(toDelete.id).to.exist;

    await keycloakManager.groups.del({ id: toDelete.id });

    const direct = await requestAdmin(
      keycloakConfig.baseUrl,
      adminToken,
      `/admin/realms/${TEST_REALM}/groups/${toDelete.id}`
    );
    expect(direct.status).to.equal(404);
  });
});
