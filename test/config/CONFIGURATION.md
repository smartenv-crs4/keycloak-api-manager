# Test Configuration

This directory contains hierarchical configuration files managed by [propertiesmanager](https://www.npmjs.com/package/propertiesmanager).

## Configuration Files

### `default.json` (required, committed to git)
Base configuration with non-sensitive defaults. Contains the "test" environment section with:

- **keycloak**: Admin connection settings (baseUrl, realmName, clientId, username, grantType)
- **realm**: Test realm infrastructure specifications (realm name, client, user, roles, groups, scopes)

**When to edit**: Update non-sensitive defaults that all developers should use.

### `secrets.json` (required, gitignored)
Sensitive credentials overlaid on default.json. Contains passwords and secrets.

**Structure**:
```json
{
  "test": {
    "keycloak": {
      "password": "admin"
    },
    "realm": {
      "user": {
        "password": "test-password"
      }
    }
  }
}
```

**When to create**: Before running tests for the first time. Copy structure above and fill in your Keycloak admin password.

### `local.json` (optional, gitignored)
Developer-specific overrides for local environments. Useful for:
- Custom baseUrl (localhost instead of tunnel)
- Different realm names
- Custom ports

**Example**:
```json
{
  "test": {
    "keycloak": {
      "baseUrl": "http://localhost:8080"
    }
  }
}
```

**When to create**: Only if you need to override defaults for your local environment.

### `local.json.example` (committed to git)
Template showing example local overrides. Copy to `local.json` and customize.

## Configuration Loading

Files are merged in this order:
1. **default.json** - Base configuration
2. **secrets.json** - Overlays sensitive credentials
3. **local.json** - Overlays developer-specific settings (if exists)

The environment section is determined by `NODE_ENV` (default: "test").

## Important Notes

### Environment Wrapper Required
All configuration must be wrapped in an environment key:

✅ **Correct**:
```json
{
  "test": {
    "keycloak": { "baseUrl": "..." }
  }
}
```

❌ **Incorrect**:
```json
{
  "keycloak": { "baseUrl": "..." }
}
```

### Git Ignored Files
These files are excluded from git (see `.gitignore`):
- `secrets.json` - Contains passwords
- `local.json` - Developer-specific customizations

### Security
- Never commit `secrets.json` or `local.json`
- Keep passwords out of `default.json`
- Use secure passwords in production-like environments

## Configuration Schema

### keycloak (admin connection)
```json
{
  "baseUrl": "http://127.0.0.1:9998",     // Keycloak server URL
  "realmName": "master",                   // Admin realm (usually "master")
  "clientId": "admin-cli",                 // Admin client ID
  "username": "admin",                     // Admin username
  "password": "admin",                     // Admin password (in secrets.json)
  "grantType": "password",                 // OAuth2 grant type
  "tokenLifeSpan": 60                      // Token refresh interval (seconds)
}
```

### realm (test infrastructure)
```json
{
  "name": "keycloak-api-manager-test-realm",  // Test realm name
  "client": {
    "clientId": "test-client",                 // Test client ID
    "clientSecret": "test-client-secret"       // Test client secret
  },
  "user": {
    "username": "test-user",                   // Test user username
    "password": "test-password",               // Test user password (in secrets.json)
    "email": "test-user@test.local",           // Test user email
    "firstName": "Test",                       // Test user first name
    "lastName": "User"                         // Test user last name
  },
  "roles": ["test-role-1", "test-role-2", "test-admin-role"],  // Roles to create
  "group": {
    "name": "test-group"                       // Test group name
  },
  "clientScope": {
    "name": "test-scope"                       // Test client scope name
  }
}
```

## Troubleshooting

### "Configuration loading failed"
- Ensure `secrets.json` exists with valid JSON
- Check that environment wrapper "test" is present in all files
- Verify JSON syntax (no trailing commas, proper quotes)

### "Access denied" errors during tests  
- Check admin username/password in `secrets.json`
- Verify `baseUrl` points to accessible Keycloak instance
- If using SSH tunnel, ensure it's active

### "Realm not found" errors
- Ensure global setup ran successfully (check console output)
- Verify realm name matches between config and test expectations
- Check that Keycloak instance is running and accessible

## More Information

See main project [README.md](../../README.md) for overall test architecture and execution instructions.
