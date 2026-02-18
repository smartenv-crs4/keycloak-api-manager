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
    text.includes('provider') && text.includes('not found') ||
    text.includes('feature not enabled') ||
    text.includes('not supported') ||
    text.includes('http 404') ||
    text.includes('unknown_error')
  );
}

describe('IdentityProviders Handler', function () {
  this.timeout(60000);

  const keycloakConfig = (conf && conf.keycloak) || {};
  const testRealm = `idp-realm-${Date.now()}`;
  const idpAlias = `idp-oidc-${Date.now()}`;
  const mapperName = `idp-mapper-${Date.now()}`;

  let adminToken = null;
  let idpCreated = false;
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

    try {
      await keycloakManager.identityProviders.create({
        alias: idpAlias,
        providerId: 'oidc',
        enabled: true,
        trustEmail: false,
        storeToken: false,
        addReadTokenRoleOnCreate: false,
        authenticateByDefault: false,
        config: {
          authorizationUrl: 'https://example.com/auth',
          tokenUrl: 'https://example.com/token',
          userInfoUrl: 'https://example.com/userinfo',
          clientId: 'dummy-client-id',
          clientSecret: 'dummy-client-secret',
          defaultScope: 'openid profile email',
        },
      });
      idpCreated = true;
    } catch (err) {
      if (shouldSkipFeature(err)) {
        idpCreated = false;
      } else {
        throw err;
      }
    }
  });

  after(async function () {
    try {
      keycloakManager.setConfig({ realmName: testRealm });
    } catch (err) {
      // best effort
    }

    try {
      if (mapperId && idpCreated) {
        await keycloakManager.identityProviders.delMapper({ alias: idpAlias, id: mapperId });
      }
    } catch (err) {
      // best effort
    }

    try {
      if (idpCreated) {
        await keycloakManager.identityProviders.del({ alias: idpAlias });
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

  it('should list identity providers and find factory', async function () {
    const providers = await keycloakManager.identityProviders.find();
    expect(providers).to.be.an('array');

    const factory = await keycloakManager.identityProviders.findFactory({ providerId: 'oidc' });
    expect(factory).to.exist;
  });

  it('should create/findOne/update/delete identity provider when supported', async function () {
    if (!idpCreated) {
      this.skip();
      return;
    }

    const one = await keycloakManager.identityProviders.findOne({ alias: idpAlias });
    expect(one).to.be.an('object');
    expect(one.alias).to.equal(idpAlias);

    await keycloakManager.identityProviders.update(
      { alias: idpAlias },
      {
        ...one,
        displayName: 'Updated OIDC Provider',
      }
    );

    const updated = await keycloakManager.identityProviders.findOne({ alias: idpAlias });
    expect(updated.displayName).to.equal('Updated OIDC Provider');

    const direct = await requestAdmin(
      keycloakConfig.baseUrl,
      adminToken,
      `/admin/realms/${testRealm}/identity-provider/instances/${idpAlias}`
    );
    expect(direct.status).to.equal(200);
    expect(direct.body.alias).to.equal(idpAlias);
  });

  it('should manage idp mappers when supported', async function () {
    if (!idpCreated) {
      this.skip();
      return;
    }

    try {
      const created = await keycloakManager.identityProviders.createMapper({
        alias: idpAlias,
        identityProviderMapper: {
          name: mapperName,
          identityProviderAlias: idpAlias,
          identityProviderMapper: 'oidc-user-attribute-idp-mapper',
          config: {
            'claim': 'email',
            'user.attribute': 'email',
            'syncMode': 'INHERIT',
          },
        },
      });

      mapperId = created.id;
      expect(mapperId).to.exist;

      const mappers = await keycloakManager.identityProviders.findMappers({ alias: idpAlias });
      expect(mappers).to.be.an('array');

      const one = await keycloakManager.identityProviders.findOneMapper({ alias: idpAlias, id: mapperId });
      expect(one).to.be.an('object');
      expect(one.name).to.equal(mapperName);

      await keycloakManager.identityProviders.updateMapper(
        { alias: idpAlias, id: mapperId },
        {
          ...one,
          name: `${mapperName}-updated`,
        }
      );

      const updated = await keycloakManager.identityProviders.findOneMapper({ alias: idpAlias, id: mapperId });
      expect(updated.name).to.equal(`${mapperName}-updated`);

      await keycloakManager.identityProviders.delMapper({ alias: idpAlias, id: mapperId });
      mapperId = null;
    } catch (err) {
      if (shouldSkipFeature(err)) {
        this.skip();
        return;
      }
      throw err;
    }
  });

});
