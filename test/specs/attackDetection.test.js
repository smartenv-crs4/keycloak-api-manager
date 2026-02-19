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
 * Integration tests for Attack Detection Handler
 * Tests brute force detection, login failure management
 */
describe('Attack Detection Handler Tests', function () {
    this.timeout(10000);

    const testUserData = {
        username: 'test-bruteforce-user',
        email: 'bruteforce@test.com',
        enabled: true,
        credentials: [{ type: 'password', value: 'wrongpassword123', temporary: false }]
    };

    let createdUserId;

    before(async function () {
        await KeycloakManager.configure(config);
        
        // Create a test user for brute force testing
        const result = await KeycloakManager.users.create(testUserData);
        createdUserId = result.id;
    });

    after(async function () {
        // Clean up test user
        if (createdUserId) {
            await KeycloakManager.users.del({ id: createdUserId });
        }
        KeycloakManager.stop();
    });

    describe('Brute Force Status', function () {
        it('should get brute force status for user', async function () {
            try {
                const status = await KeycloakManager.attackDetection.getUserBruteForceStatus({
                    id: createdUserId
                });
                
                // Status should exist (even if no failures yet)
                expect(status).to.exist;
            } catch (error) {
                // API might not be available in all Keycloak versions
                if (error.response?.status === 404) {
                    this.skip();
                }
                throw error;
            }
        });

        it('should clear user login failures', async function () {
            try {
                await KeycloakManager.attackDetection.clearUserLoginFailures({
                    id: createdUserId
                });
                // If no error thrown, operation succeeded
                expect(true).to.be.true;
            } catch (error) {
                // API might not be available in all Keycloak versions
                if (error.response?.status === 404) {
                    this.skip();
                }
                throw error;
            }
        });

        it('should clear all login failures in realm', async function () {
            try {
                await KeycloakManager.attackDetection.clearAllLoginFailures({});
                // If no error thrown, operation succeeded
                expect(true).to.be.true;
            } catch (error) {
                // API might not be available in all Keycloak versions
                if (error.response?.status === 404) {
                    this.skip();
                }
                throw error;
            }
        });
    });
});
