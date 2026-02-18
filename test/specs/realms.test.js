const path = require('path');
const http = require('http');
const https = require('https');
const { expect } = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', 'config');

const { conf } = require('propertiesmanager');
const keycloakManager = require('keycloak-api-manager');

async function expectReject(promise, message) {
  try {
    await promise;
    throw new Error(message || 'Expected promise to reject');
  } catch (err) {
    expect(err).to.be.instanceOf(Error);
  }
}

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

describe('Realms Handler', function () {
  this.timeout(30000);

  const keycloakConfig = (conf && conf.keycloak) || {};
  const testRealm = `test-realm-${Date.now()}`;
  const testGroupName = `test-group-${Date.now()}`;
  const locale = 'en';
  const localizationKey = `test-key-${Date.now()}`;
  let initialAccessTokenId = null;
  let groupId = null;
  let adminBaseUrl = null;
  let accessToken = null;
  let tempRealmForDelete = null;

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

    adminBaseUrl = keycloakConfig.baseUrl;
    accessToken = keycloakManager.getToken().accessToken;

    await keycloakManager.realms.create({
      realm: testRealm,
      enabled: true,
    });

    const group = await keycloakManager.groups.create({
      realm: testRealm,
      name: testGroupName,
    });
    groupId = group.id;
  });

  after(async function () {
    try {
      if (initialAccessTokenId) {
        await keycloakManager.realms.delClientsInitialAccess({
          realm: testRealm,
          id: initialAccessTokenId,
        });
      }
    } catch (err) {
      // Best-effort cleanup.
    }

    try {
      await keycloakManager.realms.del({ realm: testRealm });
    } catch (err) {
      // Best-effort cleanup.
    }

    try {
      if (tempRealmForDelete) {
        await keycloakManager.realms.del({ realm: tempRealmForDelete });
      }
    } catch (err) {
      // Best-effort cleanup.
    }

    if (typeof keycloakManager.stop === 'function') {
      keycloakManager.stop();
    }
  });

  it('should find all realms', async function () {
    const realms = await keycloakManager.realms.find();
    expect(realms).to.be.an('array');
  });

  it('should create realm and verify via admin API', async function () {
    const tempRealm = `create-realm-${Date.now()}`;
    await keycloakManager.realms.create({
      realm: tempRealm,
      enabled: true,
    });

    const response = await requestAdmin(
      adminBaseUrl,
      accessToken,
      `/admin/realms/${tempRealm}`
    );
    expect(response.status).to.equal(200);
    expect(response.body.realm).to.equal(tempRealm);

    tempRealmForDelete = tempRealm;
  });

  it('should find realm by name', async function () {
    const realm = await keycloakManager.realms.findOne({ realm: testRealm });
    expect(realm).to.be.an('object');
    expect(realm.realm).to.equal(testRealm);
  });

  it('should update realm', async function () {
    const displayName = `Updated-${Date.now()}`;
    await keycloakManager.realms.update(
      { realm: testRealm },
      { displayName }
    );

    const updated = await keycloakManager.realms.findOne({ realm: testRealm });
    expect(updated.displayName).to.equal(displayName);

    const response = await requestAdmin(
      adminBaseUrl,
      accessToken,
      `/admin/realms/${testRealm}`
    );
    expect(response.status).to.equal(200);
    expect(response.body.displayName).to.equal(displayName);
  });

  it('should export realm configuration', async function () {
    const exported = await keycloakManager.realms.export({
      realm: testRealm,
      exportClients: false,
      exportGroupsAndRoles: false,
    });
    expect(exported).to.be.an('object');
  });

  it('should perform partial import', async function () {
    const result = await keycloakManager.realms.partialImport({
      realm: testRealm,
      ifResourceExists: 'SKIP',
      rep: {
        realm: testRealm,
        users: [],
        roles: { realm: [] },
        groups: [],
      },
    });
    expect(result).to.be.an('object');
  });

  it('should get client registration policy providers', async function () {
    const providers = await keycloakManager.realms.getClientRegistrationPolicyProviders({
      realm: testRealm,
    });
    expect(providers).to.be.an('array');
  });

  it('should manage initial access tokens', async function () {
    const created = await keycloakManager.realms.createClientsInitialAccess(
      { realm: testRealm },
      { count: 1, expiration: 3600 }
    );

    expect(created).to.be.an('object');
    expect(created.id).to.exist;
    initialAccessTokenId = created.id;

    const tokens = await keycloakManager.realms.getClientsInitialAccess({
      realm: testRealm,
    });
    expect(tokens).to.be.an('array');

    await keycloakManager.realms.delClientsInitialAccess({
      realm: testRealm,
      id: initialAccessTokenId,
    });
    initialAccessTokenId = null;
  });

  it('should manage default groups and group paths', async function () {
    await keycloakManager.realms.addDefaultGroup({
      realm: testRealm,
      id: groupId,
    });

    const defaults = await keycloakManager.realms.getDefaultGroups({
      realm: testRealm,
    });
    expect(defaults).to.be.an('array');

    const groupByPath = await keycloakManager.realms.getGroupByPath({
      realm: testRealm,
      path: `/${testGroupName}`,
    });
    expect(groupByPath).to.be.an('object');

    await keycloakManager.realms.removeDefaultGroup({
      realm: testRealm,
      id: groupId,
    });
  });

  it('should manage event configuration and events', async function () {
    const config = await keycloakManager.realms.getConfigEvents({
      realm: testRealm,
    });
    expect(config).to.be.an('object');

    await keycloakManager.realms.updateConfigEvents(
      { realm: testRealm },
      {
        eventsEnabled: true,
        adminEventsEnabled: true,
        adminEventsDetailsEnabled: true,
        eventsListeners: ['jboss-logging'],
      }
    );

    const events = await keycloakManager.realms.findEvents({
      realm: testRealm,
      max: 5,
    });
    expect(events).to.be.an('array');

    const adminEvents = await keycloakManager.realms.findAdminEvents({
      realm: testRealm,
      max: 5,
    });
    expect(adminEvents).to.be.an('array');

    await keycloakManager.realms.clearEvents({ realm: testRealm });
    await keycloakManager.realms.clearAdminEvents({ realm: testRealm });
  });

  it('should read realm keys and session stats', async function () {
    const keys = await keycloakManager.realms.getKeys({ realm: testRealm });
    expect(keys).to.be.an('object');

    const stats = await keycloakManager.realms.getClientSessionStats({
      realm: testRealm,
    });
    expect(stats).to.be.an('array');
  });

  it('should push revocation and logout all', async function () {
    await keycloakManager.realms.pushRevocation({ realm: testRealm });
    await keycloakManager.realms.logoutAll({ realm: testRealm });
  });

  it('should manage localization texts', async function () {
    await keycloakManager.realms.addLocalization(
      {
        realm: testRealm,
        selectedLocale: locale,
        key: localizationKey,
      },
      'Test Value'
    );

    const texts = await keycloakManager.realms.getRealmLocalizationTexts({
      realm: testRealm,
      selectedLocale: locale,
    });
    expect(texts).to.be.an('object');
    expect(texts[localizationKey]).to.equal('Test Value');

    const locales = await keycloakManager.realms.getRealmSpecificLocales({
      realm: testRealm,
      selectedLocale: locale,
    });
    expect(locales).to.be.an('array');

    await keycloakManager.realms.deleteRealmLocalizationTexts({
      realm: testRealm,
      selectedLocale: locale,
      key: localizationKey,
    });
  });

  it('should return errors for invalid LDAP/SMTP configs', async function () {
    await expectReject(
      keycloakManager.realms.testLDAPConnection(
        { realm: testRealm },
        {
          action: 'testConnection',
          connectionUrl: 'ldap://invalid-host:389',
          bindDn: 'cn=admin,dc=example,dc=org',
          bindCredential: 'invalid',
        }
      ),
      'LDAP connection should fail'
    );

    await expectReject(
      keycloakManager.realms.ldapServerCapabilities(
        { realm: testRealm },
        {
          action: 'testConnection',
          connectionUrl: 'ldap://invalid-host:389',
          bindDn: 'cn=admin,dc=example,dc=org',
          bindCredential: 'invalid',
        }
      ),
      'LDAP capabilities should fail'
    );

    await expectReject(
      keycloakManager.realms.testSMTPConnection(
        { realm: testRealm },
        {
          from: 'noreply@example.com',
          host: 'smtp.invalid',
          port: 25,
          auth: 'true',
          user: 'invalid',
          password: 'invalid',
        }
      ),
      'SMTP connection should fail'
    );
  });

  it('should delete realm and verify via admin API', async function () {
    if (!tempRealmForDelete) {
      this.skip();
    }

    await keycloakManager.realms.del({ realm: tempRealmForDelete });
    const response = await requestAdmin(
      adminBaseUrl,
      accessToken,
      `/admin/realms/${tempRealmForDelete}`
    );
    expect(response.status).to.equal(404);
    tempRealmForDelete = null;
  });
});
