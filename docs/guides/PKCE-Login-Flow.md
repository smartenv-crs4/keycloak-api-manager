# PKCE Login Flow (Deprecated In This Package)

This package is focused on Keycloak Admin API resource management.

PKCE and user-authentication helpers in this package are deprecated since v6.0.0 and kept only for backward compatibility:

- `generateAuthorizationUrl(options)`
- `loginPKCE(credentials)`
- `login(credentials)`
- `auth(credentials)`

These methods are planned for removal in v7.0.0.

For production user authentication flows (including Authorization Code + PKCE), use:

- https://github.com/smartenv-crs4/keycloak-express-middleware

Migration references:

- [OIDC Migration Plan](../../OIDC_MIGRATION_PLAN.md)
- [Configuration & Authentication](../api/configuration.md)
