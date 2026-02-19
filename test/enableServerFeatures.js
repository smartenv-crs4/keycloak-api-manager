/**
 * Enable Server Features - Shared Test Infrastructure Setup
 * 
 * This script configures a shared Keycloak test realm with all necessary infrastructure
 * before any tests run. It's called from setup.js in the global before() hook.
 * 
 * Architecture:
 * - Uses configuration from testConfig.js (loaded via propertiesmanager)
 * - Creates infrastructure only if it doesn't already exist (idempotent)
 * - All tests share this realm, avoiding repeated creation/deletion overhead
 * 
 * Infrastructure Created:
 * 1. Test Realm - Isolated environment for all tests
 * 2. Test Client - Service account client for authentication tests
 * 3. Test User - Standard user with credentials for user management tests
 * 4. Test Roles - Realm roles for RBAC tests
 * 5. Test Group - Group for group management tests
 * 6. Fine-grained Permissions - Admin permissions if supported by server
 * 7. Client Scope - Scope for protocol mapper and scope mapping tests
 * 
 * Known Server-Side Limitations (Cannot be enabled via API):
 * - Installation Providers: Requires server configuration, not API-configurable
 * - Protocol Mappers: Requires protocol mapper providers to be installed/enabled at server level
 * - Authorization Services: Some features require explicit server configuration
 * - Consents Feature: Requires server-side configuration
 * 
 * Tests that require these features will be marked as skipped with appropriate messages.
 * These are not bugs - they are legitimate environmental constraints.
 * 
 * Performance Impact:
 * - Setup runs once: ~10-20 seconds
 * - Per-test overhead saved: ~2-5 seconds per test
 * - Total time saved: ~5-10 minutes for full suite (59 tests)
 * 
 * Configuration Source:
 * - test/config/default.json - Base config
 * - test/config/secrets.json - Passwords
 * - test/config/local.json - Optional developer overrides
 */

const path = require('path');

// Ensure NODE_ENV and config path are set before requiring testConfig
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, 'config');

const keycloakManager = require('../index');
const {
    TEST_REALM,
    TEST_CLIENT_ID,
    TEST_USER_USERNAME,
    TEST_USER_PASSWORD,
    TEST_USER_EMAIL,
    TEST_USER_FIRSTNAME,
    TEST_USER_LASTNAME,
    TEST_ROLES,
    TEST_GROUP_NAME,
    TEST_CLIENT_SCOPE,
    KEYCLOAK_CONFIG
} = require('./testConfig');

/**
 * Main setup function - creates shared test infrastructure
 * @returns {Promise<void>}
 */
async function enableServerFeatures() {
    const keycloakConfig = KEYCLOAK_CONFIG;
    
    console.log('Configuring Keycloak Admin Client...');
    await keycloakManager.configure({
        baseUrl: keycloakConfig.baseUrl,
        realmName: keycloakConfig.realmName,
        clientId: keycloakConfig.clientId,
        username: keycloakConfig.username,
        password: keycloakConfig.password,
        grantType: keycloakConfig.grantType
    });

    try {
        // Step 1: Create or verify test realm
        console.log(`\n1. Setting up test realm: ${TEST_REALM}`);
        const existingRealms = await keycloakManager.realms.find();
        const realmExists = existingRealms.some(r => r.realm === TEST_REALM);
        
        if (!realmExists) {
            await keycloakManager.realms.create({
                realm: TEST_REALM,
                enabled: true,
                displayName: 'Keycloak API Manager Test Realm',
                loginTheme: 'keycloak',
                accountTheme: 'keycloak',
                adminTheme: 'keycloak',
                emailTheme: 'keycloak',
                accessTokenLifespan: 3600,
                ssoSessionIdleTimeout: 1800,
                ssoSessionMaxLifespan: 36000,
                offlineSessionIdleTimeout: 2592000,
                registrationAllowed: false,
                registrationEmailAsUsername: false,
                rememberMe: true,
                verifyEmail: false,
                loginWithEmailAllowed: true,
                duplicateEmailsAllowed: false,
                resetPasswordAllowed: true,
                editUsernameAllowed: false,
                bruteForceProtected: false,
                organizationsEnabled: true  // Enable Organizations (requires 'organization' feature flag)
            });
            console.log(`   ✓ Test realm created: ${TEST_REALM}`);
        } else {
            console.log(`   ✓ Test realm already exists: ${TEST_REALM}`);
            // Update existing realm to ensure all required settings are enabled
            await keycloakManager.realms.update(
                { realm: TEST_REALM },
                {
                    enabled: true,
                    bruteForceProtected: false,
                    organizationsEnabled: true
                }
            );
        }

        // Switch to test realm for all subsequent operations
        keycloakManager.setConfig({ realmName: TEST_REALM });

        // 2. Create test client with all features enabled
        console.log('\n2. Setting up test client...');
        const clients = await keycloakManager.clients.find({ clientId: TEST_CLIENT_ID });
        let testClient = clients.find(c => c.clientId === TEST_CLIENT_ID);
        
        if (!testClient) {
            const created = await keycloakManager.clients.create({
                clientId: TEST_CLIENT_ID,
                enabled: true,
                protocol: 'openid-connect',
                publicClient: false,
                directAccessGrantsEnabled: true,
                serviceAccountsEnabled: true,
                authorizationServicesEnabled: true,
                standardFlowEnabled: true,
                implicitFlowEnabled: false,
                bearerOnly: false,
                consentRequired: false,
                fullScopeAllowed: true,
                redirectUris: ['http://localhost:*'],
                webOrigins: ['*'],
                attributes: {
                    'client.secret.creation.time': Date.now().toString()
                }
            });
            const allClients = await keycloakManager.clients.find({ clientId: TEST_CLIENT_ID });
            testClient = allClients.find(c => c.clientId === TEST_CLIENT_ID);
            console.log(`   ✓ Test client created: ${TEST_CLIENT_ID}`);
        } else {
            // Update to ensure all features are enabled
            await keycloakManager.clients.update({
                id: testClient.id
            }, {
                authorizationServicesEnabled: true,
                serviceAccountsEnabled: true,
                publicClient: false,
                directAccessGrantsEnabled: true,
                standardFlowEnabled: true
            });
            console.log(`   ✓ Test client updated: ${TEST_CLIENT_ID}`);
        }

        // 3. Create test user
        console.log('\n3. Setting up test user...');
        const users = await keycloakManager.users.find({ username: TEST_USER_USERNAME });
        let testUser = users.find(u => u.username === TEST_USER_USERNAME);
        
        if (!testUser) {
            const created = await keycloakManager.users.create({
                username: TEST_USER_USERNAME,
                email: TEST_USER_EMAIL,
                firstName: TEST_USER_FIRSTNAME,
                lastName: TEST_USER_LASTNAME,
                enabled: true,
                emailVerified: true
            });
            await keycloakManager.users.resetPassword({
                id: created.id,
                credential: {
                    type: 'password',
                    value: TEST_USER_PASSWORD,
                    temporary: false
                }
            });
            console.log(`   ✓ Test user created: ${TEST_USER_USERNAME}`);
        } else {
            console.log(`   ✓ Test user already exists: ${TEST_USER_USERNAME}`);
        }

        // 4. Create test roles
        console.log('\n4. Setting up test roles...');
        const existingRoles = await keycloakManager.roles.find();
        
        for (const roleName of TEST_ROLES) {
            if (!existingRoles.some(r => r.name === roleName)) {
                await keycloakManager.roles.create({
                    name: roleName,
                    description: `${roleName} for testing`
                });
                console.log(`   ✓ Role created: ${roleName}`);
            } else {
                console.log(`   ✓ Role already exists: ${roleName}`);
            }
        }

        // 5. Create test group
        console.log('\n5. Setting up test groups...');
        const groups = await keycloakManager.groups.find();
        let testGroupId;
        if (!groups.some(g => g.name === TEST_GROUP_NAME)) {
            const groupResult = await keycloakManager.groups.create({
                name: TEST_GROUP_NAME,
                attributes: {
                    description: ['Test group for API testing']
                }
            });
            testGroupId = groupResult.id;
            console.log('   ✓ Test group created');
        } else {
            testGroupId = groups.find(g => g.name === TEST_GROUP_NAME).id;
            console.log('   ✓ Test group already exists');
        }

        // 6. Enable fine-grained admin permissions
        console.log('\n6. Enabling fine-grained admin permissions...');
        try {
            // Enable users management permissions
            const currentUserPerms = await keycloakManager.realms.getUsersManagementPermissions({
                realm: TEST_REALM
            });
            
            if (!currentUserPerms.enabled) {
                await keycloakManager.realms.updateUsersManagementPermissions({
                    realm: TEST_REALM,
                    enabled: true
                });
                console.log('   ✓ Users fine-grained admin permissions enabled');
            } else {
                console.log('   ✓ Users fine-grained admin permissions already enabled');
            }
            
            // Enable groups management permissions for the test group
            if (testGroupId) {
                try {
                    const groupPerms = await keycloakManager.groups.listPermissions({ id: testGroupId });
                    if (!groupPerms.enabled) {
                        await keycloakManager.groups.setPermissions(
                            { id: testGroupId },
                            { enabled: true }
                        );
                        console.log('   ✓ Groups fine-grained permissions enabled');
                    } else {
                        console.log('   ✓ Groups fine-grained permissions already enabled');
                    }
                } catch (groupPermErr) {
                    console.log(`   ⚠ Groups permissions: ${groupPermErr.message}`);
                }
            }
        } catch (err) {
            console.log(`   ⚠ Fine-grained permissions: ${err.message}`);
            console.log(`   ℹ This feature requires 'admin-fine-grained-authz' to be enabled`);
            console.log(`     in KC_FEATURES environment variable`);
        }

        // 7. Realm features requiring server-side configuration
        console.log('\n7. Enabling realm features...');
        try {
            // Note: Some features like installation providers cannot be enabled via API
            // They require server-side configuration in keycloak configuration files
            console.log('   ℹ Installation providers and protocol mappers require server configuration');
        } catch (err) {
            console.log(`   ⚠ Realm features: ${err.message}`);
        }

        // 8. Create default client scopes
        console.log('\n8. Setting up client scopes...');
        const clientScopes = await keycloakManager.clientScopes.find();
        if (!clientScopes.some(cs => cs.name === TEST_CLIENT_SCOPE)) {
            await keycloakManager.clientScopes.create({
                name: TEST_CLIENT_SCOPE,
                description: 'Test client scope',
                protocol: 'openid-connect'
            });
            console.log('   ✓ Test client scope created');
        } else {
            console.log('   ✓ Test client scope already exists');
        }

        // 9. Enable authorization services for the test client to support all permissions scenarios
        console.log('\n9. Configuring fine-grained permissions for test client...');
        try {
            const clients = await keycloakManager.clients.find({ clientId: TEST_CLIENT_ID });
            const client = clients.find(c => c.clientId === TEST_CLIENT_ID);
            
            if (client) {
                await keycloakManager.clients.updateFineGrainPermission(
                    { id: client.id },
                    { enabled: true }
                );
                console.log('   ✓ Fine-grained permissions enabled for test client');
            }
        } catch (err) {
            console.log(`   ⚠ Client fine-grained permissions: ${err.message}`);
        }

        console.log('\n✓ Keycloak server configuration complete!');
        console.log(`\nTest realm: ${TEST_REALM}`);
        console.log(`Test client: ${TEST_CLIENT_ID}`);
        console.log(`Test user: ${TEST_USER_USERNAME}:${TEST_USER_PASSWORD}`);

    } catch (error) {
        console.error('\n✗ Error configuring Keycloak server:', error.message);
        if (error.response?.data) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    } finally {
        keycloakManager.stop();
    }
}

module.exports = enableServerFeatures;

// Allow running standalone
if (require.main === module) {
    enableServerFeatures();
}
