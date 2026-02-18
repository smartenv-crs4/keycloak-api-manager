# Test Suite Updates - February 2026

## Summary

Complete refactoring of the test infrastructure to use a shared test realm approach with hierarchical configuration management.

## Key Changes

### 1. Shared Test Realm Architecture
- **Before**: Each test created and deleted its own realm (~2-5s overhead per test)
- **After**: Single realm created once, reused by all 59 tests
- **Performance Impact**: ~5-10 minutes faster for full test suite (10s vs 15 minutes)

### 2. Configuration Management (propertiesmanager)
Migrated from manual JSON loading to [propertiesmanager](https://www.npmjs.com/package/propertiesmanager):

**Files**:
- `test/config/default.json` - Base configuration (committed)
- `test/config/secrets.json` - Sensitive credentials (gitignored)
- `test/config/local.json` - Developer overrides (gitignored, optional)

**Benefits**:
- Hierarchical config merging (default → secrets → local)
- Environment-based configuration (uses NODE_ENV)
- Clear separation of public/secret/local settings
- Standard approach across team

### 3. Global Test Setup
- Added `test/setup.js` with Mocha global hooks
- Added `test/enableServerFeatures.js` for infrastructure creation
- Configured via `test/.mocharc.json` to run before all tests

### 4. Documentation Improvements

**New Documentation**:
- `test/README.md` - Complete test suite guide
- `test/config/README.md` - Configuration reference
- Updated main `README.md` with detailed test section

**Enhanced Code Comments**:
- `test/testConfig.js` - Full JSDoc header explaining configuration loading
- `test/setup.js` - Detailed comments on global hooks and shared realm strategy  
- `test/enableServerFeatures.js` - Architecture documentation and performance notes
- `index.js` - Comprehensive JSDoc for `configure()` function

### 5. Git Ignore Rules
Updated `.gitignore` to exclude:
- `**/config/secrets.json` - Passwords and sensitive data
- `**/config/local.json` - Developer-specific settings

## Migration Guide

For developers updating their local environment:

1. **Create secrets file**:
   ```bash
   cd test/config
   cp local.json.example secrets.json
   ```

2. **Edit secrets.json** with your admin password:
   ```json
   {
     "test": {
       "keycloak": { "password": "your-admin-password" },
       "realm": { "user": { "password": "test-password" } }
     }
   }
   ```

3. **(Optional) Create local overrides**:
   ```bash
   cp local.json.example local.json
   # Edit local.json to override baseUrl or other settings
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

## Breaking Changes

None - existing tests continue to work without modification.

## Test Results

All 59 tests passing, 7 tests skipped (optional features):
- ✅ Authentication Management (3 tests)
- ✅ Clients (18 tests, 3 skipped)
- ✅ Client Scopes (4 tests)
- ✅ Components (3 tests)
- ✅ Groups (4 tests)
- ✅ Identity Providers (3 tests, 1 skipped)
- ✅ Realms (16 tests, 1 skipped)
- ✅ Roles (4 tests)
- ✅ Users (8 tests, 2 skipped)

**Execution Time**: ~9 seconds (down from ~5-10 minutes)

## Technical Details

### Configuration Loading
```
testConfig.js sets up:
  ├─ NODE_ENV=test
  ├─ PROPERTIES_PATH=test/config/
  └─ Loads propertiesmanager
      ├─ Reads default.json["test"]
      ├─ Merges secrets.json["test"]  
      └─ Merges local.json["test"] (if exists)
```

### Test Execution Flow
```
npm test
  ├─ Sets NODE_ENV=test
  ├─ Mocha loads .mocharc.json
  │   └─ Runs setup.js (global before hook)
  │       └─ Calls enableServerFeatures()
  │           ├─ Configures admin client
  │           ├─ Creates test realm (if not exists)
  │           ├─ Creates test client
  │           ├─ Creates test user
  │           ├─ Creates test roles
  │           ├─ Creates test group
  │           └─ Creates test client scope
  └─ Runs all test suites in specs/
      └─ Each test uses shared realm infrastructure
```

## Developer Notes

- Test realm: `keycloak-api-manager-test-realm`
- Default Keycloak URL: `http://127.0.0.1:9998` (SSH tunnel)
- Configuration is cached by propertiesmanager (restart tests to reload)
- All environment sections must use `"test"` wrapper key

## References

- [Test Suite README](test/README.md)
- [Configuration Guide](test/config/README.md)
- [propertiesmanager docs](https://www.npmjs.com/package/propertiesmanager)
