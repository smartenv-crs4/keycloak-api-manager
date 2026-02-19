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
 * Integration tests for Organizations Handler
 * Tests organization CRUD, members, identity providers (Keycloak 25+)
 */
describe('Organizations Handler Tests', function () {
    this.timeout(10000);

    const testOrgData = {
        name: `test-org-${Date.now()}`,
        domains: [],
        attributes: {
            customAttr: ['value1']
        }
    };

    let createdOrgId;
    let testUserId;

    before(async function () {
        await KeycloakManager.configure(config);
        
        // Create a test user for member operations
        const userResult = await KeycloakManager.users.create({
            username: `org-test-user-${Date.now()}`,
            email: 'orguser@test.com',
            enabled: true
        });
        testUserId = userResult.id;
    });

    after(async function () {
        // Clean up
        if (createdOrgId) {
            try {
                await KeycloakManager.organizations.del({ id: createdOrgId });
            } catch (e) {
                // Org might already be deleted
            }
        }
        if (testUserId) {
            await KeycloakManager.users.del({ id: testUserId });
        }
        KeycloakManager.stop();
    });

    describe('Organization CRUD Operations', function () {
        it('should create an organization', async function () {
            try {
                const result = await KeycloakManager.organizations.create(testOrgData);
                expect(result).to.have.property('id');
                createdOrgId = result.id;
            } catch (error) {
                // Organizations require manual enablement via Admin Console  
                // Even with 'organization' feature flag, each realm must enable organizations
                // through the Admin UI before the API will work
                if (error.message?.includes('not enabled')) {
                    this.skip();
                }
                throw error;
            }
        });

        it('should find all organizations', async function () {
            if (!createdOrgId) this.skip();
            
            const orgs = await KeycloakManager.organizations.find({});
            expect(orgs).to.be.an('array');
            expect(orgs.length).to.be.greaterThan(0);
        });

        it('should find one organization by ID', async function () {
            if (!createdOrgId) this.skip();
            
            const org = await KeycloakManager.organizations.findOne({ id: createdOrgId });
            expect(org).to.have.property('id', createdOrgId);
            expect(org).to.have.property('name', testOrgData.name);
        });

        it('should update an organization', async function () {
            if (!createdOrgId) this.skip();
            
            const updatedData = {
                attributes: {
                    customAttr: ['updatedValue']
                }
            };
            
            await KeycloakManager.organizations.update({ id: createdOrgId }, updatedData);
            
            const org = await KeycloakManager.organizations.findOne({ id: createdOrgId });
            expect(org.attributes.customAttr).to.deep.equal(['updatedValue']);
        });
    });

    describe('Organization Members', function () {
        it('should add a member to organization', async function () {
            if (!createdOrgId || !testUserId) this.skip();
            
            await KeycloakManager.organizations.addMember({
                id: createdOrgId,
                userId: testUserId
            });
            
            expect(true).to.be.true;
        });

        it('should list organization members', async function () {
            if (!createdOrgId) this.skip();
            
            const members = await KeycloakManager.organizations.listMembers({
                id: createdOrgId
            });
            
            expect(members).to.be.an('array');
        });

        it('should remove a member from organization', async function () {
            if (!createdOrgId || !testUserId) this.skip();
            
            await KeycloakManager.organizations.delMember({
                id: createdOrgId,
                userId: testUserId
            });
            
            expect(true).to.be.true;
        });
    });

    describe('Organization Identity Providers', function () {
        it('should list identity providers for organization', async function () {
            if (!createdOrgId) this.skip();
            
            try {
                const idps = await KeycloakManager.organizations.listIdentityProviders({
                    id: createdOrgId
                });
                
                expect(idps).to.be.an('array');
            } catch (error) {
                // Method might not be available
                if (error.response?.status === 404) {
                    this.skip();
                }
                throw error;
            }
        });
    });

    describe('Organization Deletion', function () {
        it('should delete an organization', async function () {
            if (!createdOrgId) this.skip();
            
            await KeycloakManager.organizations.del({ id: createdOrgId });
            
            try {
                await KeycloakManager.organizations.findOne({ id: createdOrgId });
                throw new Error('Organization should have been deleted');
            } catch (error) {
                expect(error.response?.status).to.equal(404);
            }
            
            createdOrgId = null; // Prevent cleanup attempt
        });
    });
});
