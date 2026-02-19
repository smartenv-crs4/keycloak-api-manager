const path = require('path');

// Set up environment for propertiesmanager
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '../config');

const { conf } = require('propertiesmanager');

/**
 * Shared Test Configuration Module
 * 
 * This module centralizes all test configuration using propertiesmanager.
 * It loads configuration from test/config/ directory with the following merge order:
 * 
 * 1. default.json - Base configuration for all environments
 * 2. secrets.json - Sensitive credentials (gitignored)
 * 3. local.json - Developer-specific overrides (gitignored, optional)
 * 
 * Configuration Structure:
 * - All files use environment wrappers: { "test": { ... } }
 * - NODE_ENV determines which section to load (default: "test")
 * - propertiesmanager automatically merges configs based on NODE_ENV
 * 
 * Exports:
 * - KEYCLOAK_CONFIG: Admin connection settings (baseUrl, username, password, etc.)
 * - TEST_REALM: Name of the shared test realm
 * - TEST_CLIENT_*: Client configuration for tests
 * - TEST_USER_*: Test user credentials and details
 * - TEST_ROLES: Array of role names to create
 * - TEST_GROUP_NAME: Name of test group
 * - TEST_CLIENT_SCOPE: Name of test client scope
 * - generateUniqueName: Helper to create unique resource names
 * 
 * Usage in tests:
 *   const { KEYCLOAK_CONFIG, TEST_REALM, TEST_USER_USERNAME } = require('./testConfig');
 */

const realmConfig = conf?.realm || {};

module.exports = {
    // Keycloak Admin Config (for admin connections)
    KEYCLOAK_CONFIG: conf?.keycloak || {},
    
    // Test Realm Configuration
    TEST_REALM: realmConfig.name || 'keycloak-api-manager-test-realm',
    
    // Test Client Configuration
    TEST_CLIENT_ID: realmConfig.client?.clientId || 'test-client',
    TEST_CLIENT_SECRET: realmConfig.client?.clientSecret || 'test-client-secret',
    
    // Test User Configuration
    TEST_USER_USERNAME: realmConfig.user?.username || 'test-user',
    TEST_USER_PASSWORD: realmConfig.user?.password || 'test-password',
    TEST_USER_EMAIL: realmConfig.user?.email || 'test-user@test.local',
    TEST_USER_FIRSTNAME: realmConfig.user?.firstName || 'Test',
    TEST_USER_LASTNAME: realmConfig.user?.lastName || 'User',
    
    // Test Roles
    TEST_ROLES: realmConfig.roles || ['test-role-1', 'test-role-2', 'test-admin-role'],
    
    // Test Group
    TEST_GROUP_NAME: realmConfig.group?.name || 'test-group',
    
    // Test Client Scope
    TEST_CLIENT_SCOPE: realmConfig.clientScope?.name || 'test-scope',
    
    // Helper to generate unique names when needed
    generateUniqueName: (prefix) => `${prefix}-${Date.now()}`
};
