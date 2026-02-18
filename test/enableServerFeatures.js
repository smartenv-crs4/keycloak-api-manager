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
                bruteForceProtected: false
            });
            console.log(`   ✓ Test realm created: ${TEST_REALM}`);
        } else {
            console.log(`   ✓ Test realm already exists: ${TEST_REALM}`);
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
        if (!groups.some(g => g.name === TEST_GROUP_NAME)) {
            await keycloakManager.groups.create({
                name: TEST_GROUP_NAME,
                attributes: {
                    description: ['Test group for API testing']
                }
            });
            console.log('   ✓ Test group created');
        } else {
            console.log('   ✓ Test group already exists');
        }

        // 6. Enable fine-grained admin permissions
        console.log('\n6. Enabling fine-grained admin permissions...');
        try {
            const currentPerms = await keycloakManager.realms.getUsersManagementPermissions({
                realm: TEST_REALM
            });
            
            if (!currentPerms.enabled) {
                await keycloakManager.realms.setUsersManagementPermissions({
                    realm: TEST_REALM
                }, {
                    enabled: true
                });
                console.log('   ✓ Fine-grained admin permissions enabled');
            } else {
                console.log('   ✓ Fine-grained admin permissions already enabled');
            }
        } catch (err) {
            console.log(`   ⚠ Fine-grained permissions: ${err.message}`);
            console.log(`   ℹ This is typically a server configuration setting that requires`);
            console.log(`     enabling "authorizationServicesEnabled" in realm settings`);
        }

        // 7. Create default client scopes
        console.log('\n7. Setting up client scopes...');
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
