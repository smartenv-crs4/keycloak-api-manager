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
 * Integration tests for Server Info Handler
 * Tests server information and metadata retrieval
 */
describe('Server Info Handler Tests', function () {
    this.timeout(10000);

    before(async function () {
        await KeycloakManager.configure(config);
    });

    after(async function () {
        KeycloakManager.stop();
    });

    describe('Server Information', function () {
        let serverInfo;

        it('should get comprehensive server information', async function () {
            serverInfo = await KeycloakManager.serverInfo.getInfo();
            
            expect(serverInfo).to.exist;
            expect(serverInfo).to.be.an('object');
        });

        it('should contain system information', async function () {
            if (!serverInfo) this.skip();
            
            expect(serverInfo).to.have.property('systemInfo');
            expect(serverInfo.systemInfo).to.be.an('object');
            
            // System info typically includes version, uptime, etc.
            if (serverInfo.systemInfo.version) {
                expect(serverInfo.systemInfo.version).to.be.a('string');
            }
        });

        it('should contain memory information', async function () {
            if (!serverInfo) this.skip();
            
            expect(serverInfo).to.have.property('memoryInfo');
            expect(serverInfo.memoryInfo).to.be.an('object');
        });

        it('should contain profile information', async function () {
            if (!serverInfo) this.skip();
            
            expect(serverInfo).to.have.property('profileInfo');
            expect(serverInfo.profileInfo).to.be.an('object');
        });

        it('should contain available themes', async function () {
            if (!serverInfo) this.skip();
            
            expect(serverInfo).to.have.property('themes');
            expect(serverInfo.themes).to.be.an('object');
            
            // Themes should include login, account, admin, etc.
            const themeTypes = Object.keys(serverInfo.themes);
            expect(themeTypes.length).to.be.greaterThan(0);
        });

        it('should contain available providers', async function () {
            if (!serverInfo) this.skip();
            
            expect(serverInfo).to.have.property('providers');
            expect(serverInfo.providers).to.be.an('object');
            
            // Providers should include various SPIs
            const providerTypes = Object.keys(serverInfo.providers);
            expect(providerTypes.length).to.be.greaterThan(0);
        });

        it('should contain protocol mapper types', async function () {
            if (!serverInfo) this.skip();
            
            expect(serverInfo).to.have.property('protocolMapperTypes');
            expect(serverInfo.protocolMapperTypes).to.be.an('object');
        });

        it('should contain component types', async function () {
            if (!serverInfo) this.skip();
            
            if (serverInfo.componentTypes) {
                expect(serverInfo.componentTypes).to.be.an('object');
            }
        });

        it('should contain password policies', async function () {
            if (!serverInfo) this.skip();
            
            if (serverInfo.passwordPolicies) {
                expect(serverInfo.passwordPolicies).to.be.an('array');
            }
        });

        it('should contain enums', async function () {
            if (!serverInfo) this.skip();
            
            if (serverInfo.enums) {
                expect(serverInfo.enums).to.be.an('object');
            }
        });

        it('should verify specific provider categories exist', async function () {
            if (!serverInfo || !serverInfo.providers) this.skip();
            
            const providers = serverInfo.providers;
            
            // Check for common provider categories
            // Note: These may vary by Keycloak version
            const commonProviders = ['login-protocol', 'realm-cache', 'user-storage'];
            const foundProviders = commonProviders.filter(p => providers[p]);
            
            // At least some common providers should exist
            expect(foundProviders.length).to.be.greaterThan(0);
        });
    });
});
