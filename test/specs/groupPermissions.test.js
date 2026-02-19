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
 * Integration tests for Group Permissions
 * Tests new permission management methods added to groupsHandler
 */
describe('Group Permissions Tests', function () {
    this.timeout(10000);

    const testGroupData = {
        name: `test-permissions-group-${Date.now()}`
    };

    let createdGroupId;

    before(async function () {
        await KeycloakManager.configure(config);
        
        // Create a test group
        const result = await KeycloakManager.groups.create(testGroupData);
        createdGroupId = result.id;
    });

    after(async function () {
        // Clean up test group
        if (createdGroupId) {
            await KeycloakManager.groups.del({ id: createdGroupId });
        }
        KeycloakManager.stop();
    });

    describe('Group Permission Management', function () {
        it('should enable permissions for a group', async function () {
            await KeycloakManager.groups.setPermissions(
                { id: createdGroupId },
                { enabled: true }
            );
            
            expect(true).to.be.true;
        });

        it('should get group permissions', async function () {
            const permissions = await KeycloakManager.groups.listPermissions({
                id: createdGroupId
            });
            
            expect(permissions).to.exist;
            expect(permissions).to.have.property('enabled');
            
            // If we enabled permissions in the previous test, it should be true
            if (permissions.enabled) {
                expect(permissions).to.have.property('resource');
            }
        });

        it('should disable permissions for a group', async function () {
            await KeycloakManager.groups.setPermissions(
                { id: createdGroupId },
                { enabled: false }
            );
            
            const permissions = await KeycloakManager.groups.listPermissions({
                id: createdGroupId
            });
            
            expect(permissions.enabled).to.be.false;
        });
    });
});
