/**
 * Global Test Setup - Mocha Hooks
 * 
 * This file is loaded by Mocha before any tests run (configured in .mocharc.json).
 * 
 * Purpose:
 * - Creates shared test realm infrastructure once before all tests
 * - Avoids repeated realm creation/deletion, improving test performance by ~5x
 * - Ensures consistent test environment across all test suites
 * 
 * What gets created:
 * - Test realm (keycloak-api-manager-test-realm)
 * - Test client with proper configuration
 * - Test user with credentials
 * - Test roles (test-role-1, test-role-2, test-admin-role)
 * - Test group
 * - Test client scope
 * 
 * Note: Individual tests should create unique resources (e.g., user-${timestamp})
 * to avoid conflicts when multiple tests run in parallel or sequence.
 */

const enableServerFeatures = require('./enableServerFeatures');

// Global before hook - runs once before all test suites
before(async function() {
    // Increase timeout - realm creation may take 10-20 seconds
    this.timeout(30000);
    
    console.log('\n=== Running global test setup ===\n');
    await enableServerFeatures();
    console.log('\n=== Global setup complete ===\n');
});
