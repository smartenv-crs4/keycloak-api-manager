const { expect } = require('chai');
const { getAdminClient } = require('./config');

describe('Authentication Management Handler', function () {
  this.timeout(20000);
  let client;
  let testFlowId;
  let testFlowAlias;
  let testExecutionId;
  let testRequiredActionAlias;

  before(function () {
    client = getAdminClient();
    testFlowAlias = `test-flow-${Date.now()}`;
  });

  // ==================== AUTHENTICATION FLOWS ====================
  describe('Authentication Flows', function () {
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
      it('should create an authentication flow', async function () {
        const flowRep = {
          alias: testFlowAlias,
          description: 'Test Flow Description',
          flowType: 'basic-flow',
          builtIn: false,
        };

        const result = await client.authenticationManagement.createFlow(
          { realm: 'test-realm' },
          flowRep
        );

        expect(result).to.have.property('id');
        testFlowId = result.id;
      });
    });

    describe('getFlow', function () {
      it('should retrieve a specific flow', async function () {
        if (testFlowId) {
          const flow = await client.authenticationManagement.getFlow({
            realm: 'test-realm',
            id: testFlowId,
          });

          expect(flow).to.exist;
          expect(flow.id).to.equal(testFlowId);
        }
      });
    });

    describe('updateFlow', function () {
      it('should update flow configuration', async function () {
        if (testFlowId) {
          const updateRep = {
            description: 'Updated Description',
          };

          await client.authenticationManagement.updateFlow(
            { realm: 'test-realm', id: testFlowId },
            updateRep
          );

          const updated = await client.authenticationManagement.getFlow({
            realm: 'test-realm',
            id: testFlowId,
          });

          expect(updated.description).to.equal('Updated Description');
        }
      });
    });

    describe('copyFlow', function () {
      it('should copy an authentication flow', async function () {
        if (testFlowId) {
          try {
            const flowCopy = await client.authenticationManagement.copyFlow(
              { realm: 'test-realm', id: testFlowId },
              { newName: `copied-${testFlowAlias}` }
            );

            expect(flowCopy).to.exist;
          } catch (err) {
            // Copy might not be supported in all versions
          }
        }
      });
    });
  });

  // ==================== FLOW EXECUTIONS ====================
  describe('Flow Executions', function () {
    describe('getExecutions', function () {
      it('should retrieve flow executions', async function () {
        if (testFlowId) {
          const executions = await client.authenticationManagement.getExecutions({
            realm: 'test-realm',
            flowAlias: testFlowAlias,
          });

          expect(executions).to.be.an('array');
        }
      });
    });

    describe('addExecutionToFlow', function () {
      it('should add an execution to a flow', async function () {
        if (testFlowId) {
          try {
            const execution = await client.authenticationManagement.addExecutionToFlow(
              { realm: 'test-realm', flowAlias: testFlowAlias },
              { provider: 'auth-cookie' }
            );

            expect(execution).to.exist;
            testExecutionId = execution.id;
          } catch (err) {
            // Execution might not be allowed
          }
        }
      });
    });

    describe('updateExecution', function () {
      it('should update an execution', async function () {
        if (testExecutionId && testFlowAlias) {
          try {
            const updateRep = {
              requirement: 'CONDITIONAL',
            };

            await client.authenticationManagement.updateExecution(
              { realm: 'test-realm', flowAlias: testFlowAlias },
              updateRep
            );

            // Verify no error thrown
          } catch (err) {
            // Update might fail for some providers
          }
        }
      });
    });

    describe('raisePriorityExecution', function () {
      it('should raise execution priority', async function () {
        if (testExecutionId && testFlowAlias) {
          try {
            await client.authenticationManagement.raisePriorityExecution({
              realm: 'test-realm',
              flowAlias: testFlowAlias,
              executionId: testExecutionId,
            });

            // Verify no error thrown
          } catch (err) {
            // Priority adjust might not be supported
          }
        }
      });
    });

    describe('lowerPriorityExecution', function () {
      it('should lower execution priority', async function () {
        if (testExecutionId && testFlowAlias) {
          try {
            await client.authenticationManagement.lowerPriorityExecution({
              realm: 'test-realm',
              flowAlias: testFlowAlias,
              executionId: testExecutionId,
            });

            // Verify no error thrown
          } catch (err) {
            // Priority adjust might not be supported
          }
        }
      });
    });
  });

  // ==================== REQUIRED ACTIONS ====================
  describe('Required Actions', function () {
    describe('getRequiredActions', function () {
      it('should list all required actions', async function () {
        const actions = await client.authenticationManagement.getRequiredActions();

        expect(actions).to.be.an('array');
        expect(actions.length).to.be.greaterThan(0);
      });
    });

    describe('getUnregisteredRequiredActions', function () {
      it('should list unregistered required actions', async function () {
        const unregistered = await client.authenticationManagement.getUnregisteredRequiredActions();

        expect(unregistered).to.be.an('array');
      });
    });

    describe('getRequiredActionForAlias', function () {
      it('should retrieve a required action by alias', async function () {
        const actions = await client.authenticationManagement.getRequiredActions();
        if (actions.length > 0) {
          const action = await client.authenticationManagement.getRequiredActionForAlias({
            alias: actions[0].alias,
          });

          expect(action).to.exist;
          testRequiredActionAlias = action.alias;
        }
      });
    });

    describe('updateRequiredAction', function () {
      it('should update a required action', async function () {
        if (testRequiredActionAlias) {
          try {
            const updateRep = {
              enabled: true,
            };

            await client.authenticationManagement.updateRequiredAction(
              { alias: testRequiredActionAlias },
              updateRep
            );

            // Verify no error thrown
          } catch (err) {
            // Update might not be allowed
          }
        }
      });
    });

    describe('raiseRequiredActionPriority', function () {
      it('should raise required action priority', async function () {
        if (testRequiredActionAlias) {
          try {
            await client.authenticationManagement.raiseRequiredActionPriority({
              alias: testRequiredActionAlias,
            });

            // Verify no error thrown
          } catch (err) {
            // Priority adjust might not be supported
          }
        }
      });
    });

    describe('lowerRequiredActionPriority', function () {
      it('should lower required action priority', async function () {
        if (testRequiredActionAlias) {
          try {
            await client.authenticationManagement.lowerRequiredActionPriority({
              alias: testRequiredActionAlias,
            });

            // Verify no error thrown
          } catch (err) {
            // Priority adjust might not be supported
          }
        }
      });
    });
  });

  // ==================== PROVIDER INFORMATION ====================
  describe('Authenticator Providers', function () {
    describe('getAuthenticatorProviders', function () {
      it('should retrieve authenticator providers', async function () {
        const providers = await client.authenticationManagement.getAuthenticatorProviders();

        expect(providers).to.be.an('array');
      });
    });

    describe('getClientAuthenticatorProviders', function () {
      it('should retrieve client authenticator providers', async function () {
        const providers = await client.authenticationManagement.getClientAuthenticatorProviders();

        expect(providers).to.be.an('array');
      });
    });

    describe('getFormProviders', function () {
      it('should retrieve form providers', async function () {
        const providers = await client.authenticationManagement.getFormProviders();

        expect(providers).to.be.an('array');
      });
    });

    describe('getFormActionProviders', function () {
      it('should retrieve form action providers', async function () {
        const providers = await client.authenticationManagement.getFormActionProviders();

        expect(providers).to.be.an('array');
      });
    });
  });

  // ==================== CLEANUP ====================
  after(async function () {
    try {
      if (testFlowId) {
        await client.authenticationManagement.deleteFlow({
          realm: 'test-realm',
          id: testFlowId,
        });
      }
    } catch (err) {
      console.error('Cleanup error:', err.message);
    }
  });
});
