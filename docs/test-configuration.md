# Test Configuration

Test configuration is managed through `propertiesmanager` with layered files.

## Files and Priority

1. `test/config/default.json` (committed defaults)
2. `test/config/secrets.json` (gitignored sensitive values)
3. `test/config/local.json` (gitignored machine-specific overrides)

The active section is selected by `NODE_ENV` (defaults to `test` in suite bootstrap).

## Required Keys

- `test.keycloak.baseUrl`
- `test.keycloak.realmName`
- `test.keycloak.clientId`
- `test.keycloak.username`
- `test.keycloak.password` (typically in `secrets.json`)
- `test.keycloak.grantType`

## Example `secrets.json`

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

## Security Rules

- Never commit `secrets.json`.
- Never commit production credentials.
- Keep `default.json` non-sensitive.
