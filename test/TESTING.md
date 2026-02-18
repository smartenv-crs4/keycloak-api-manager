# Keycloak API Manager - Test Suite

Comprehensive test suite for `keycloak-api-manager` library.

## Overview

This test workspace validates all administrative functions provided by the library against a real Keycloak instance. Tests cover:

- **Authentication Management** - Required actions, authentication flows, executions
- **Clients** - CRUD operations, roles, secrets, scopes, sessions, authorization services
- **Client Scopes** - Management, protocol mappers, scope mappings
- **Components** - Provider listing, CRUD operations, sub-components
- **Groups** - CRUD, members, role mappings, admin permissions
- **Identity Providers** - Factory listing, CRUD, mappers
- **Realms** - Full lifecycle, configuration, events, keys, localization
- **Roles** - CRUD, composite roles, user assignments
- **Users** - CRUD, credentials, groups, role mappings, sessions, impersonation

## Architecture

### Shared Test Realm Strategy

Unlike traditional test approaches where each suite creates/destroys its own realm, this implementation uses a **shared test realm** created once before all tests:

**Benefits**:
- ⚡ **5-10x faster** - Eliminates repeated realm creation overhead (~2-5s per test)
- 🔄 **Consistent environment** - All tests run against identical infrastructure
- 🛡️ **Idempotent setup** - Running tests multiple times doesn't recreate existing resources
- 🎯 **Isolated resources** - Tests create unique resources (e.g., `user-${timestamp}`) to avoid conflicts

**Trade-offs**:
- Requires cleanup of test-specific resources (most tests handle this)
- Shared realm means tests can't modify realm-level settings without affecting others

### File Structure

```
test/
├── config/                    # Configuration files (propertiesmanager)
│   ├── default.json          # Base configuration (committed)
│   ├── secrets.json          # Passwords (gitignored, required)
│   ├── local.json            # Developer overrides (gitignored, optional)
│   ├── local.json.example    # Template for local.json
│   └── CONFIGURATION.md      # Configuration documentation
├── specs/                     # Test suites
│   ├── authenticationManagement.test.js
│   ├── clients.test.js
│   ├── clientScopes.test.js
│   ├── components.test.js
│   ├── groups.test.js
│   ├── identityProviders.test.js
│   ├── realms.test.js
│   ├── roles.test.js
│   └── users.test.js
├── .mocharc.json             # Mocha configuration
├── enableServerFeatures.js   # Creates shared test infrastructure
├── package.json              # Test dependencies
├── setup.js                  # Global Mocha hooks
└── testConfig.js             # Configuration loader and exports
```

### Key Components

#### `testConfig.js`
Centralized configuration module that:
- Sets up propertiesmanager environment
- Loads and merges config files (default → secrets → local)
- Exports standardized constants for tests:
  - `KEYCLOAK_CONFIG` - Admin connection settings
  - `TEST_REALM` - Shared realm name
  - `TEST_CLIENT_*` - Client configuration
  - `TEST_USER_*` - User details and credentials
  - `TEST_ROLES` - Array of test roles
  - `TEST_GROUP_NAME` - Test group name
  - `TEST_CLIENT_SCOPE` - Client scope name
  - `generateUniqueName()` - Helper for unique resource names

#### `setup.js`
Global Mocha hooks loaded via `.mocharc.json`:
- Runs `enableServerFeatures()` once in `before()` hook
- Sets 30s timeout for realm creation
- Logs setup progress to console

#### `enableServerFeatures.js`
Infrastructure setup script that creates (if not exists):
1. **Test Realm** - Isolated environment for all tests
2. **Test Client** - Service account client for auth tests
3. **Test User** - Standard user with credentials
4. **Test Roles** - Multiple roles for RBAC testing  
5. **Test Group** - Group for membership tests
6. **Fine-grained Permissions** - Admin permissions (if server supports)
7. **Client Scope** - For scope mapping tests

Runs idempotently - safe to execute multiple times.

#### `.mocharc.json`
Mocha configuration:
```json
{
  "file": ["setup.js"],        // Load global hooks before tests
  "spec": ["specs/*.test.js"]  // Run all test suites
}
```

## Running Tests

### Prerequisites

1. **Keycloak Instance**: Running and accessible
2. **Configuration**: Create `test/config/secrets.json` with admin password
3. **SSH Tunnel** (if remote): Ensure tunnel is active before running tests

### Commands

```bash
# Install dependencies and run all tests
npm test

# Or step-by-step:
npm --prefix test install        # Install test dependencies
npm --prefix test test           # Run all tests

# Run specific test suite
npm --prefix test test -- --grep "Users Handler"

# Run specific test
npm --prefix test test -- --grep "should create, find, update, and delete clients"
```

## Diagnostics

### Protocol Mapper Diagnostic Script

The file [test/diagnostic-protocol-mappers.js](test/diagnostic-protocol-mappers.js) is a manual troubleshooting script.
It is not part of the automated Mocha test suite. It is used to validate protocol mapper creation via:

- Direct Admin REST API calls
- The library client (`keycloak-api-manager`)

Run it manually when you need to debug protocol mapper behavior:

```bash
node test/diagnostic-protocol-mappers.js
```

It uses the same `test/config` configuration and the shared test realm.

### Expected Output

```
propertiesmanager Configuration loaded successfully for environment: test

=== Running global test setup ===

Configuring Keycloak Admin Client...

1. Setting up test realm: keycloak-api-manager-test-realm
   ✓ Test realm already exists: keycloak-api-manager-test-realm

2. Setting up test client...
   ✓ Test client updated: test-client

[... additional setup output ...]

✓ Keycloak server configuration complete!

=== Global setup complete ===

  Users Handler
    ✔ should find, findOne, count and update users
    ✔ should manage password and credentials
    [... more tests ...]

  59 passing (9s)
  7 pending
```

## Configuration

Configuration uses [propertiesmanager](https://www.npmjs.com/package/propertiesmanager) for hierarchical config management.

**Quick Setup**:

1. Copy secrets template:
   ```bash
   cp test/config/local.json.example test/config/secrets.json
   ```

2. Edit `test/config/secrets.json`:
   ```json
   {
     "test": {
       "keycloak": {
         "password": "your-admin-password"
       },
       "realm": {
         "user": {
           "password": "test-user-password"
         }
       }
     }
   }
   ```

3. (Optional) Override baseUrl in `test/config/local.json`:
   ```json
   {
     "test": {
       "keycloak": {
         "baseUrl": "http://localhost:8080"
       }
     }
   }
   ```

See [config/CONFIGURATION.md](config/CONFIGURATION.md) for detailed configuration documentation.

## Test Writing Guidelines

### Use Shared Configuration

```javascript
const {
    TEST_REALM,
    TEST_CLIENT_ID,
    TEST_USER_USERNAME,
    generateUniqueName
} = require('../testConfig');
```

### Create Unique Resources

Avoid conflicts by using timestamps or UUIDs:

```javascript
const userName = generateUniqueName('test-user');
const roleName = `role-${Date.now()}`;
```

### Respect Shared Realm

Don't:
- Modify realm-level settings (will affect other tests)
- Delete the shared realm
- Assume exclusive access to shared resources (client, user, roles)

Do:
- Create test-specific resources with unique names
- Clean up resources created during test (in `after()` hooks)
- Use the shared infrastructure for read operations

### Handle Feature Availability

Some Keycloak features may not be available on all server versions:

```javascript
try {
    await keycloakManager.users.listConsents({ realm: TEST_REALM, id: userId });
} catch (err) {
    if (err.response?.status === 404) {
        this.skip(); // Skip test if feature not available
    }
    throw err;
}
```

## Troubleshooting

### Tests hang indefinitely
- Check Keycloak instance is running and accessible
- Verify SSH tunnel is active (if using remote Keycloak)
- Check `baseUrl` in configuration matches your setup

### "Configuration loading failed"
- Ensure `test/config/secrets.json` exists
- Verify JSON syntax (no trailing commas)
- Check environment wrapper present: `{ "test": { ... } }`

### "Access denied" or 403 errors
- Verify admin credentials in `secrets.json`
- Ensure admin user has realm-management permissions
- Check `realmName` is correct (usually "master" for admin user)

### "Realm not found" errors
- Check global setup ran successfully (see console output)
- Verify shared realm created: look for "✓ Test realm created/exists"
- Ensure realm name matches configuration

### Slow test execution
- First run is slower (~10-20s) due to realm setup
- Subsequent runs should be faster (~5-10s)  
- If still slow, check network latency to Keycloak instance
- Consider using local Keycloak instance instead of remote tunnel

### Tests fail inconsistently
- May indicate race conditions or shared resource conflicts
- Ensure test resources use unique names
- Check cleanup logic in `after()` hooks
- Run single test in isolation to verify: `--grep "test name"`

## Performance Metrics

Typical performance on 2020 MacBook Pro with local Keycloak:

- **Global Setup**: ~10-15 seconds (runs once)
- **Full Suite**: ~9 seconds (59 tests)
- **Individual Test**: ~50-200ms average

Performance with remote Keycloak over SSH tunnel:
- **Global Setup**: ~15-25 seconds
- **Full Suite**: ~15-30 seconds

## Contributing

When adding new tests:

1. Follow existing patterns in `specs/` directory
2. Import shared config from `testConfig.js`
3. Use `generateUniqueName()` for test resources
4. Add cleanup in `after()` hooks
5. Handle optional features gracefully (use `this.skip()`)
6. Document any new configuration requirements
7. Update this README if adding new test categories

## License

Same as parent project.
