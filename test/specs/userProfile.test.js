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
 * Integration tests for User Profile Handler
 * Tests user profile configuration and metadata (Keycloak 15+)
 */
describe('User Profile Handler Tests', function () {
    this.timeout(10000);

    before(async function () {
        await KeycloakManager.configure(config);
    });

    after(async function () {
        KeycloakManager.stop();
    });

    describe('User Profile Configuration', function () {
        let originalConfig;

        it('should get user profile configuration', async function () {
            try {
                const profileConfig = await KeycloakManager.userProfile.getConfiguration({});
                
                expect(profileConfig).to.exist;
                expect(profileConfig).to.have.property('attributes');
                expect(profileConfig.attributes).to.be.an('array');
                
                // Save original config for restoration
                originalConfig = profileConfig;
            } catch (error) {
                // User Profile API only available in Keycloak 15+
                if (error.response?.status === 404 || error.message?.includes('getProfile')) {
                    this.skip();
                }
                throw error;
            }
        });

        it('should verify standard attributes exist in profile', async function () {
            if (!originalConfig) this.skip();
            
            const attributeNames = originalConfig.attributes.map(attr => attr.name);
            
            // Standard attributes that should exist
            expect(attributeNames).to.include('username');
            expect(attributeNames).to.include('email');
        });

        it('should update user profile configuration', async function () {
            if (!originalConfig) this.skip();
            if (!originalConfig.attributes || !Array.isArray(originalConfig.attributes)) this.skip();
            
            // Add a custom attribute to the configuration
            const updatedConfig = JSON.parse(JSON.stringify(originalConfig));
            
            // Check if test attribute already exists
            const testAttrIndex = updatedConfig.attributes.findIndex(
                attr => attr.name === 'testCustomAttribute'
            );
            
            if (testAttrIndex === -1) {
                // Add new test attribute
                updatedConfig.attributes.push({
                    name: 'testCustomAttribute',
                    displayName: 'Test Custom Attribute',
                    validations: {},
                    permissions: {
                        view: ['admin', 'user'],
                        edit: ['admin']
                    },
                    multivalued: false
                });
            }

            try {
                await KeycloakManager.userProfile.updateConfiguration({}, updatedConfig);
                
                // Verify the update
                const verifyConfig = await KeycloakManager.userProfile.getConfiguration({});
                const customAttrExists = verifyConfig.attributes.some(
                    attr => attr.name === 'testCustomAttribute'
                );
                
                expect(customAttrExists).to.be.true;
                
                // Restore original configuration
                await KeycloakManager.userProfile.updateConfiguration({}, originalConfig);
            } catch (error) {
                // Restore on error
                if (originalConfig) {
                    await KeycloakManager.userProfile.updateConfiguration({}, originalConfig);
                }
                throw error;
            }
        });
    });

    describe('User Profile Metadata', function () {
        it('should get user profile metadata', async function () {
            try {
                const metadata = await KeycloakManager.userProfile.getMetadata({});
                
                expect(metadata).to.exist;
                // Metadata typically contains validators, attribute types, etc.
                // Structure may vary by Keycloak version
            } catch (error) {
                // Metadata endpoint might not be available in all versions
                if (error.response?.status === 404 || error.message?.includes('getProfileMetadata')) {
                    this.skip();
                }
                throw error;
            }
        });
    });
});
