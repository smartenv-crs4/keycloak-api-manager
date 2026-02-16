const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Authentication Management Handler', function () {
  this.timeout(10000);
  let client;
  let testFlowAlias;

  before(function () {
    client = getAdminClient();
  });

  describe('getFlows', function () {
    it('should list all authentication flows', async function () {
      const flows = await client.authenticationManagement.getFlows({
        realm: 'test-realm',
      });

      expect(flows).to.be.an('array');
      expect(flows.length).to.be.greaterThan(0);
    });
  });

  describe('createFlow', function () {
    it('should create an authentication flow with valid representation', async function () {
      const flowRepresentation = {
        alias: 'integration-test-flow',
        description: 'Integration test authentication flow',
        flowType: 'basic-flow',
        builtIn: false,
      };

      const result = await client.authenticationManagement.createFlow(
        { realm: 'test-realm' },
        flowRepresentation
      );

      expect(result).to.have.property('id');
      testFlowAlias = result.alias;
    });
  });

  describe('getFlow', function () {
    it('should get a specific authentication flow by id', async function () {
      const flows = await client.authenticationManagement.getFlows({
        realm: 'test-realm',
      });

      const testFlow = flows.find((f) => f.alias === testFlowAlias);
      expect(testFlow).to.exist;

      if (testFlow) {
        const flow = await client.authenticationManagement.getFlow({
          realm: 'test-realm',
          id: testFlow.id,
        });

        expect(flow).to.exist;
        expect(flow.alias).to.equal(testFlowAlias);
      }
    });
  });

  describe('getFlowsExecutions', function () {
    it('should get execution flow for a flow', async function () {
      const flows = await client.authenticationManagement.getFlows({
        realm: 'test-realm',
      });

      const testFlow = flows.find((f) => f.alias === testFlowAlias);

      if (testFlow) {
        const executions = await client.authenticationManagement.getFlowsExecutions({
          realm: 'test-realm',
          flowAlias: testFlow.alias,
        });

        expect(executions).to.be.an('array');
      }
    });
  });

  after(async function () {
    // Cleanup: delete test authentication flow
    try {
      const flows = await client.authenticationManagement.getFlows({
        realm: 'test-realm',
      });

      const testFlow = flows.find((f) => f.alias === testFlowAlias);
      if (testFlow) {
        await client.authenticationManagement.deleteFlow({
          realm: 'test-realm',
          id: testFlow.id,
        });
      }
    } catch (err) {
      // Ignore if not found
    }
  });
});
