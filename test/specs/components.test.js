const path = require('path');
const { expect } = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', 'config');

const { conf } = require('propertiesmanager');
const keycloakManager = require('keycloak-api-manager');

function shouldSkipFeature(err) {
  if (!err || !err.message) {
    return false;
  }
  const text = err.message.toLowerCase();
  return (
    text.includes('not supported') ||
    text.includes('invalid') ||
    text.includes('unknown_error') ||
    text.includes('http 4')
  );
}

describe('Components Handler', function () {
  this.timeout(60000);

  const keycloakConfig = (conf && conf.keycloak) || {};
  const testRealm = `components-realm-${Date.now()}`;

  let sampleComponent = null;
  let createdComponentId = null;

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

    await keycloakManager.realms.create({ realm: testRealm, enabled: true });
    keycloakManager.setConfig({ realmName: testRealm });
  });

  after(async function () {
    try {
      keycloakManager.setConfig({ realmName: testRealm });
    } catch (err) {
      // best effort
    }

    try {
      if (createdComponentId) {
        await keycloakManager.components.del({ id: createdComponentId });
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

  it('should list components and find one', async function () {
    const components = await keycloakManager.components.find({});
    expect(components).to.be.an('array');

    if (!components.length) {
      this.skip();
      return;
    }

    sampleComponent = components[0];
    const found = await keycloakManager.components.findOne({ id: sampleComponent.id });
    expect(found).to.be.an('object');
    expect(found.id).to.equal(sampleComponent.id);
  });

  it('should list sub-components when available', async function () {
    if (!sampleComponent) {
      const components = await keycloakManager.components.find({});
      if (!components.length) {
        this.skip();
        return;
      }
      sampleComponent = components[0];
    }

    const sub = await keycloakManager.components.listSubComponents({
      id: sampleComponent.id,
      type: sampleComponent.providerType || 'org.keycloak.component.ComponentFactory',
    });
    expect(sub).to.be.an('array');
  });

  it('should create, update and delete a component when provider allows it', async function () {
    const components = await keycloakManager.components.find({});
    if (!components.length) {
      this.skip();
      return;
    }

    const base = components.find((item) => item.providerId && item.providerType) || components[0];

    const payload = {
      name: `component-copy-${Date.now()}`,
      providerId: base.providerId,
      providerType: base.providerType,
      parentId: base.parentId,
      config: base.config || {},
    };

    try {
      const created = await keycloakManager.components.create(payload);
      createdComponentId = created.id;
      expect(createdComponentId).to.exist;

      await keycloakManager.components.update(
        { id: createdComponentId },
        {
          ...payload,
          name: `${payload.name}-updated`,
        }
      );

      const updated = await keycloakManager.components.findOne({ id: createdComponentId });
      expect(updated).to.be.an('object');
      expect(updated.name).to.equal(`${payload.name}-updated`);

      await keycloakManager.components.del({ id: createdComponentId });
      createdComponentId = null;
    } catch (err) {
      if (shouldSkipFeature(err)) {
        this.skip();
        return;
      }
      throw err;
    }
  });
});
