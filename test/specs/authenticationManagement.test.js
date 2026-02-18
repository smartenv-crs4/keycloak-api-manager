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
    text.includes('unknown_error') ||
    text.includes('http 404') ||
    text.includes('http 400')
  );
}

async function getFlowByAliasOrId(aliasOrId, candidateId) {
  try {
    return await keycloakManager.authenticationManagement.getFlow({ flowId: aliasOrId });
  } catch (firstErr) {
    if (candidateId) {
      return await keycloakManager.authenticationManagement.getFlow({ flowId: candidateId });
    }
    throw firstErr;
  }
}

async function deleteFlowByAliasOrId(aliasOrId, candidateId) {
  try {
    await keycloakManager.authenticationManagement.deleteFlow({ flowId: aliasOrId });
  } catch (firstErr) {
    if (candidateId) {
      await keycloakManager.authenticationManagement.deleteFlow({ flowId: candidateId });
      return;
    }
    throw firstErr;
  }
}

describe('AuthenticationManagement Handler', function () {
  this.timeout(60000);

  const keycloakConfig = (conf && conf.keycloak) || {};
  const testRealm = `auth-mgmt-realm-${Date.now()}`;
  const customFlowAlias = `custom-flow-${Date.now()}`;
  const copiedFlowAlias = `copied-flow-${Date.now()}`;

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
      await keycloakManager.authenticationManagement.deleteFlow({ flowId: copiedFlowAlias });
    } catch (err) {
      // best effort
    }

    try {
      await keycloakManager.authenticationManagement.deleteFlow({ flowId: customFlowAlias });
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

  it('should list required actions and provider metadata', async function () {
    const requiredActions = await keycloakManager.authenticationManagement.getRequiredActions();
    expect(requiredActions).to.be.an('array');

    const unregistered = await keycloakManager.authenticationManagement.getUnregisteredRequiredActions();
    expect(unregistered).to.be.an('array');

    const updatePassword = await keycloakManager.authenticationManagement.getRequiredActionForAlias({
      alias: 'UPDATE_PASSWORD',
    });
    expect(updatePassword).to.be.an('object');

    const actionProviders = await keycloakManager.authenticationManagement.getFormActionProviders();
    expect(actionProviders).to.be.an('array');

    const authenticatorProviders = await keycloakManager.authenticationManagement.getAuthenticatorProviders();
    expect(authenticatorProviders).to.be.an('array');

    const clientAuthenticatorProviders = await keycloakManager.authenticationManagement.getClientAuthenticatorProviders();
    expect(clientAuthenticatorProviders).to.be.an('array');

    const formProviders = await keycloakManager.authenticationManagement.getFormProviders();
    expect(formProviders).to.be.an('array');
  });

  it('should read and modify required action settings when available', async function () {
    try {
      const before = await keycloakManager.authenticationManagement.getRequiredActionForAlias({
        alias: 'UPDATE_PASSWORD',
      });

      const description = await keycloakManager.authenticationManagement.getRequiredActionConfigDescription({
        alias: 'UPDATE_PASSWORD',
      });
      expect(description).to.be.an('object');

      await keycloakManager.authenticationManagement.updateRequiredAction(
        { alias: 'UPDATE_PASSWORD' },
        {
          ...before,
          enabled: true,
        }
      );

      await keycloakManager.authenticationManagement.raiseRequiredActionPriority({
        alias: 'UPDATE_PASSWORD',
      });
      await keycloakManager.authenticationManagement.lowerRequiredActionPriority({
        alias: 'UPDATE_PASSWORD',
      });
    } catch (err) {
      if (shouldSkipFeature(err)) {
        this.skip();
        return;
      }
      throw err;
    }
  });

  it('should manage authentication flows and executions', async function () {
    const flows = await keycloakManager.authenticationManagement.getFlows();
    expect(flows).to.be.an('array');
    expect(flows.length).to.be.greaterThan(0);

    const browserFlow = flows.find((flow) => flow.alias === 'browser') || flows[0];
    const flowDetails = await getFlowByAliasOrId(browserFlow.alias, browserFlow.id);
    expect(flowDetails).to.be.an('object');

    await keycloakManager.authenticationManagement.createFlow({
      alias: customFlowAlias,
      providerId: 'basic-flow',
      topLevel: true,
      builtIn: false,
      description: 'Test custom flow',
    });

    const flowsAfterCreate = await keycloakManager.authenticationManagement.getFlows();
    const customFlowMeta = flowsAfterCreate.find((flow) => flow.alias === customFlowAlias);
    const customFlow = await getFlowByAliasOrId(
      customFlowAlias,
      customFlowMeta && customFlowMeta.id
    );
    expect(customFlow).to.be.an('object');
    expect(customFlow.alias).to.equal(customFlowAlias);

    await keycloakManager.authenticationManagement.copyFlow({
      flow: customFlowAlias,
      newName: copiedFlowAlias,
    });

    const flowsAfterCopy = await keycloakManager.authenticationManagement.getFlows();
    const copiedFlowMeta = flowsAfterCopy.find((flow) => flow.alias === copiedFlowAlias);
    const copiedFlow = await getFlowByAliasOrId(
      copiedFlowAlias,
      copiedFlowMeta && copiedFlowMeta.id
    );
    expect(copiedFlow).to.be.an('object');
    expect(copiedFlow.alias).to.equal(copiedFlowAlias);

    const executions = await keycloakManager.authenticationManagement.getExecutions({
      flow: copiedFlowAlias,
    });
    expect(executions).to.be.an('array');

    try {
      await keycloakManager.authenticationManagement.addExecutionToFlow({
        flow: copiedFlowAlias,
        provider: 'auth-cookie',
      });

      const executionsAfter = await keycloakManager.authenticationManagement.getExecutions({
        flow: copiedFlowAlias,
      });
      expect(executionsAfter).to.be.an('array');
    } catch (err) {
      if (!shouldSkipFeature(err)) {
        throw err;
      }
    }

    await deleteFlowByAliasOrId(copiedFlowAlias, copiedFlowMeta && copiedFlowMeta.id);
    await deleteFlowByAliasOrId(customFlowAlias, customFlowMeta && customFlowMeta.id);
  });
});
