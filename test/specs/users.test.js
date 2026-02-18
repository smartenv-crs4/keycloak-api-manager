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

function shouldSkipFeature(err) {
  if (!err || !err.message) {
    return false;
  }
  const text = err.message.toLowerCase();
  return (
    text.includes('feature not enabled') ||
    text.includes('not enabled') ||
    text.includes('not supported') ||
    text.includes('http 404') ||
    text.includes('unknown_error')
  );
}

describe('Users Handler', function () {
  this.timeout(60000);

  const keycloakConfig = (conf && conf.keycloak) || {};
  const testUserName = generateUniqueName('users-test');
  const testEmail = `${testUserName}@example.com`;
  const testPassword = 'UsersTest!123';
  const testGroupName = generateUniqueName('users-group');
  const testRealmRoleName = generateUniqueName('users-realm-role');
  const testClientId = generateUniqueName('users-client');
  const testClientRoleName = generateUniqueName('users-client-role');

  let adminToken = null;
  let userId = null;
  let groupId = null;
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

    const createdUser = await keycloakManager.users.create({
      username: testUserName,
      email: testEmail,
      enabled: true,
      firstName: 'Users',
      lastName: 'Test',
    });
    userId = createdUser.id;

    await keycloakManager.users.resetPassword({
      id: userId,
      credential: {
        type: 'password',
        value: testPassword,
        temporary: false,
      },
    });

    const createdGroup = await keycloakManager.groups.create({
      name: testGroupName,
    });
    groupId = createdGroup.id;

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
      description: 'Users test client role',
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
      // Best-effort cleanup.
    }

    try {
      if (userId) {
        await keycloakManager.users.del({ id: userId });
      }
    } catch (err) {
      // Best-effort cleanup.
    }

    try {
      if (client) {
        await keycloakManager.clients.del({ id: client.id });
      }
    } catch (err) {
      // Best-effort cleanup.
    }

    try {
      if (realmRole) {
        await keycloakManager.roles.delByName({ name: realmRole.name });
      }
    } catch (err) {
      // Best-effort cleanup.
    }

    try {
      if (groupId) {
        await keycloakManager.groups.del({ id: groupId });
      }
    } catch (err) {
      // Best-effort cleanup.
    }

    // Don't delete shared test realm

    if (typeof keycloakManager.stop === 'function') {
      keycloakManager.stop();
    }
  });

  it('should find, findOne, count and update users', async function () {
    const users = await keycloakManager.users.find({ username: testUserName });
    expect(users).to.be.an('array');
    expect(users.some((item) => item.id === userId)).to.equal(true);

    const one = await keycloakManager.users.findOne({ id: userId });
    expect(one).to.be.an('object');
    expect(one.username).to.equal(testUserName);

    const count = await keycloakManager.users.count({ username: testUserName });
    expect(count).to.be.a('number');
    expect(count).to.be.greaterThan(0);

    const newFirstName = `UsersUpdated-${Date.now()}`;
    await keycloakManager.users.update(
      { id: userId },
      { firstName: newFirstName }
    );

    const updated = await keycloakManager.users.findOne({ id: userId });
    expect(updated.firstName).to.equal(newFirstName);

    const direct = await requestAdmin(
      keycloakConfig.baseUrl,
      adminToken,
      `/admin/realms/${TEST_REALM}/users/${userId}`
    );
    expect(direct.status).to.equal(200);
    expect(direct.body.firstName).to.equal(newFirstName);
  });

  it('should manage password and credentials', async function () {
    const credentials = await keycloakManager.users.getCredentials({ id: userId });
    expect(credentials).to.be.an('array');

    const storageTypes = await keycloakManager.users.getUserStorageCredentialTypes({ id: userId });
    expect(storageTypes).to.be.an('array');

    if (!credentials.length) {
      this.skip();
      return;
    }

    const credential = credentials[0];
    await keycloakManager.users.updateCredentialLabel(
      { id: userId, credentialId: credential.id },
      `label-${Date.now()}`
    );
  });

  it('should manage group membership', async function () {
    await keycloakManager.users.addToGroup({ id: userId, groupId });

    const groups = await keycloakManager.users.listGroups({ id: userId });
    expect(groups).to.be.an('array');
    expect(groups.some((group) => group.id === groupId)).to.equal(true);

    const count = await keycloakManager.users.countGroups({ id: userId });
    expect(count).to.be.a('number');
    expect(count).to.be.greaterThan(0);

    const direct = await requestAdmin(
      keycloakConfig.baseUrl,
      adminToken,
      `/admin/realms/${TEST_REALM}/users/${userId}/groups`
    );
    expect(direct.status).to.equal(200);
    expect(Array.isArray(direct.body)).to.equal(true);

    await keycloakManager.users.delFromGroup({ id: userId, groupId });
    const groupsAfter = await keycloakManager.users.listGroups({ id: userId });
    expect(groupsAfter.some((group) => group.id === groupId)).to.equal(false);
  });

  it('should manage realm role mappings', async function () {
    await keycloakManager.users.addRealmRoleMappings({
      id: userId,
      roles: [{ id: realmRole.id, name: realmRole.name }],
    });

    const directRealmRoles = await keycloakManager.users.listRealmRoleMappings({ id: userId });
    expect(directRealmRoles.some((role) => role.id === realmRole.id)).to.equal(true);

    const compositeRealmRoles = await keycloakManager.users.listCompositeRealmRoleMappings({ id: userId });
    expect(compositeRealmRoles).to.be.an('array');

    const roleMappings = await keycloakManager.users.listRoleMappings({ id: userId });
    expect(roleMappings).to.be.an('object');

    const available = await keycloakManager.users.listAvailableRealmRoleMappings({ id: userId });
    expect(available).to.be.an('array');

    await keycloakManager.users.delRealmRoleMappings({
      id: userId,
      roles: [{ id: realmRole.id, name: realmRole.name }],
    });

    const afterDelete = await keycloakManager.users.listRealmRoleMappings({ id: userId });
    expect(afterDelete.some((role) => role.id === realmRole.id)).to.equal(false);
  });

  it('should manage client role mappings', async function () {
    await keycloakManager.users.addClientRoleMappings({
      id: userId,
      clientUniqueId: client.id,
      roles: [{ id: clientRole.id, name: clientRole.name }],
    });

    const roles = await keycloakManager.users.listClientRoleMappings({
      id: userId,
      clientUniqueId: client.id,
    });
    expect(roles).to.be.an('array');
    expect(roles.some((role) => role.id === clientRole.id)).to.equal(true);

    const composite = await keycloakManager.users.listCompositeClientRoleMappings({
      id: userId,
      clientUniqueId: client.id,
    });
    expect(composite).to.be.an('array');

    const available = await keycloakManager.users.listAvailableClientRoleMappings({
      id: userId,
      clientUniqueId: client.id,
    });
    expect(available).to.be.an('array');

    await keycloakManager.users.delClientRoleMappings({
      id: userId,
      clientUniqueId: client.id,
      roles: [{ id: clientRole.id, name: clientRole.name }],
    });

    const rolesAfter = await keycloakManager.users.listClientRoleMappings({
      id: userId,
      clientUniqueId: client.id,
    });
    expect(rolesAfter.some((role) => role.id === clientRole.id)).to.equal(false);
  });

  it('should list sessions and support logout', async function () {
    const sessions = await keycloakManager.users.listSessions({ id: userId });
    expect(sessions).to.be.an('array');

    try {
      const offlineSessions = await keycloakManager.users.listOfflineSessions({
        id: userId,
        clientId: testClientId,
      });
      expect(offlineSessions).to.be.an('array');
    } catch (err) {
      if (shouldSkipFeature(err)) {
        this.skip();
        return;
      }
      throw err;
    }

    await keycloakManager.users.logout({ id: userId });
  });

  it('should list and revoke consents when available', async function () {
    let consents;
    try {
      consents = await keycloakManager.users.listConsents({ id: userId });
    } catch (err) {
      if (shouldSkipFeature(err)) {
        this.skip();
        return;
      }
      throw err;
    }

    expect(consents).to.be.an('array');

    if (!consents.length) {
      this.skip();
      return;
    }

    await keycloakManager.users.revokeConsent({
      id: userId,
      clientId: consents[0].clientId,
    });
  });

  it('should support impersonation when enabled', async function () {
    try {
      const response = await keycloakManager.users.impersonation({ id: userId });
      expect(response).to.be.an('object');
    } catch (err) {
      if (shouldSkipFeature(err)) {
        this.skip();
        return;
      }
      throw err;
    }
  });

  it('should list federated identities and handle optional provider linkage', async function () {
    const identities = await keycloakManager.users.listFederatedIdentities({ id: userId });
    expect(identities).to.be.an('array');

    try {
      await keycloakManager.users.addToFederatedIdentity({
        id: userId,
        federatedIdentityId: 'google',
        federatedIdentity: {
          identityProvider: 'google',
          userId: `federated-${Date.now()}`,
          userName: `federated-${Date.now()}`,
        },
      });

      await keycloakManager.users.delFromFederatedIdentity({
        id: userId,
        federatedIdentityId: 'google',
      });
    } catch (err) {
      if (shouldSkipFeature(err)) {
        this.skip();
        return;
      }
      throw err;
    }
  });
});
