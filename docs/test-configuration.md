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

## Recommended Local Setup

1. Keep non-sensitive defaults in `default.json`.
2. Put secrets in `secrets.json`.
3. Override per-machine host/ports in `local.json`.

Example `local.json` for local Docker Keycloak:

```json
{
  "test": {
    "keycloak": {
      "baseUrl": "http://127.0.0.1:8080"
    }
  }
}
```

## Example `secrets.json`

```json
{
  "test": {
    "keycloak": {
      "password": "your-admin-password-here"
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
