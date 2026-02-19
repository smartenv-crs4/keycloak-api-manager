const path = require('path');
const { expect } = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', 'config');

const { conf } = require('propertiesmanager');
const KeycloakManager = require('../../index');
const { TEST_REALM, generateUniqueName } = require('../testConfig');

const config = {
    baseUrl: conf.keycloak.baseUrl,
    realmName: conf.keycloak.realmName,
    clientId: conf.keycloak.clientId,
    clientSecret: conf.keycloak.clientSecret,
    grantType: conf.keycloak.grantType,
    username: conf.keycloak.username,
    password: conf.keycloak.password,
    tokenLifeSpan: conf.keycloak.tokenLifeSpan
};

/**
 * Integration tests for Client Policies Handler
 * Tests client policies and profiles configuration (Keycloak 12+)
 */
describe('Client Policies Handler Tests', function () {
    this.timeout(10000);

    before(async function () {
        await KeycloakManager.configure(config);
    });

    after(async function () {
        KeycloakManager.stop();
    });

    describe('Client Policies', function () {
        let originalPolicies;

        it('should get client policies', async function () {
            try {
                const policiesResult = await KeycloakManager.clientPolicies.getPolicies({});
                
                expect(policiesResult).to.exist;
                expect(policiesResult).to.have.property('policies');
                expect(policiesResult.policies).to.be.an('array');
                
                originalPolicies = policiesResult;
            } catch (error) {
                // Client Policies API only available in Keycloak 12+
                if (error.response?.status === 404 || error.message?.includes('clientPolicies')) {
                    this.skip();
                }
                throw error;
            }
        });

        it('should update client policies', async function () {
            if (!originalPolicies) this.skip();
            
            const updatedPolicies = JSON.parse(JSON.stringify(originalPolicies));
            
            // Add a test policy if it doesn't exist
            const testPolicyExists = updatedPolicies.policies.some(
                p => p.name === 'test-policy'
            );
            
            if (!testPolicyExists) {
                updatedPolicies.policies.push({
                    name: 'test-policy',
                    description: 'Test policy for integration tests',
                    enabled: false,
                    conditions: [],
                    profiles: []
                });
            }

            try {
                await KeycloakManager.clientPolicies.updatePolicies({}, updatedPolicies);
                
                // Verify the update
                const verifyPolicies = await KeycloakManager.clientPolicies.getPolicies({});
                const testPolicyFound = verifyPolicies.policies.some(
                    p => p.name === 'test-policy'
                );
                
                expect(testPolicyFound).to.be.true;
                
                // Restore original policies
                await KeycloakManager.clientPolicies.updatePolicies({}, originalPolicies);
            } catch (error) {
                // Restore on error
                if (originalPolicies) {
                    await KeycloakManager.clientPolicies.updatePolicies({}, originalPolicies);
                }
                throw error;
            }
        });
    });

    describe('Client Profiles', function () {
        let originalProfiles;

        it('should get client profiles', async function () {
            try {
                const profilesResult = await KeycloakManager.clientPolicies.getProfiles({});
                
                expect(profilesResult).to.exist;
                expect(profilesResult).to.have.property('profiles');
                expect(profilesResult.profiles).to.be.an('array');
                
                originalProfiles = profilesResult;
            } catch (error) {
                // API might not be available
                if (error.response?.status === 404) {
                    this.skip();
                }
                throw error;
            }
        });

        it('should update client profiles', async function () {
            if (!originalProfiles) this.skip();
            
            const updatedProfiles = JSON.parse(JSON.stringify(originalProfiles));
            
            // Add a test profile if it doesn't exist
            const testProfileExists = updatedProfiles.profiles.some(
                p => p.name === 'test-profile'
            );
            
            if (!testProfileExists) {
                updatedProfiles.profiles.push({
                    name: 'test-profile',
                    description: 'Test profile for integration tests',
                    executors: []
                });
            }

            try {
                await KeycloakManager.clientPolicies.updateProfiles({}, updatedProfiles);
                
                // Verify the update
                const verifyProfiles = await KeycloakManager.clientPolicies.getProfiles({});
                const testProfileFound = verifyProfiles.profiles.some(
                    p => p.name === 'test-profile'
                );
                
                expect(testProfileFound).to.be.true;
                
                // Restore original profiles
                await KeycloakManager.clientPolicies.updateProfiles({}, originalProfiles);
            } catch (error) {
                // Restore on error
                if (originalProfiles) {
                    await KeycloakManager.clientPolicies.updateProfiles({}, originalProfiles);
                }
                throw error;
            }
        });
    });
});
