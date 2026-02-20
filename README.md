# Keycloak API Manager

`keycloak-api-manager` is a Node.js wrapper around the Keycloak Admin REST API.
It provides a stable, function-oriented interface for managing Keycloak resources in code, scripts, and CI/CD pipelines.

## What You Can Manage

- Realms
- Users
- Roles (realm/client/composite)
- Groups and group permissions
- Clients and client scopes
- Identity Providers
- Components
- Authentication flows and required actions
- Attack detection (brute force endpoints)
- Organizations (Keycloak 25+)
- User Profile config (Keycloak 15+)
- Client Policies and Profiles
- Server Info

## Installation

```bash
npm install keycloak-api-manager
```

> **⚠️ DEPRECATION NOTICE (v6.0.0):** The OIDC authentication methods (`login()`, `loginPKCE()`, `generateAuthorizationUrl()`, `auth()`) have been **deprecated** and moved to [`keycloak-express-middleware`](https://github.com/smartenv-crs4/keycloak-express-middleware).
> 
> **This package is now exclusively for Keycloak admin resource management.** For user authentication flows, use `keycloak-express-middleware` instead.
> 
> See [OIDC_MIGRATION_PLAN.md](OIDC_MIGRATION_PLAN.md) for migration details.

## Quick Start

```js
const KeycloakManager = require('keycloak-api-manager');

await KeycloakManager.configure({
  baseUrl: 'https://your-keycloak-host:8443',
  realmName: 'master',
  clientId: 'admin-cli',
  username: 'admin',
  password: 'admin',
  grantType: 'password',
  tokenLifeSpan: 60
});

KeycloakManager.setConfig({ realmName: 'my-realm' });

const users = await KeycloakManager.users.find({ max: 20 });
console.log(users.length);

KeycloakManager.stop();
```

> **💡 Tip:** For user authentication (login with credentials, PKCE flow, token exchange), use [`keycloak-express-middleware`](https://github.com/smartenv-crs4/keycloak-express-middleware) instead. See [PKCE Login Flow Guide](docs/guides/PKCE-Login-Flow.md#-migration-to-keycloak-express-middleware-recommended) for migration examples.

## Keycloak Feature Flags

For full API coverage in this package (especially Organizations, Client Policies, User Profile, Group permissions), run Keycloak with:

```bash
--features=admin-fine-grained-authz:v1,organization,client-policies
```

### Why `admin-fine-grained-authz:v1`

In Keycloak 26.x, management-permissions APIs used by group/user fine-grained tests are compatible with `v1`.

## Public API Entry Points

- `configure(credentials)`
- `setConfig(overrides)`
- `getToken()`
- `stop()`
- ~~`login(credentials)`~~ **DEPRECATED** - moved to keycloak-express-middleware
- ~~`generateAuthorizationUrl(options)`~~ **DEPRECATED** - moved to keycloak-express-middleware
- ~~`loginPKCE(credentials)`~~ **DEPRECATED** - moved to keycloak-express-middleware
- ~~`auth(credentials)`~~ **DEPRECATED** - moved to keycloak-express-middleware

**Note:** OIDC authentication methods have been deprecated in v6.0.0. Use [`keycloak-express-middleware`](https://github.com/smartenv-crs4/keycloak-express-middleware) for user authentication flows.

Configured handler namespaces:

- `realms`
- `users`
- `clients`
- `clientScopes`
- `identityProviders`
- `groups`
- `roles`
- `components`
- `authenticationManagement`
- `attackDetection`
- `organizations`
- `userProfile`
- `clientPolicies`
- `serverInfo`

## Documentation Map

All documentation is centralized under `docs/`.

### Guides (Practical Implementation)

- [PKCE Login Flow Guide](docs/guides/PKCE-Login-Flow.md) - Step-by-step guide for implementing OAuth2 Authorization Code + PKCE authentication

### API Reference

- [API Reference (Index)](docs/api-reference.md)
- [API - Configuration](docs/api/configuration.md)
- [API - Realms](docs/api/realms.md)
- [API - Users](docs/api/users.md)
- [API - Clients](docs/api/clients.md)
- [API - Client Scopes](docs/api/client-scopes.md)
- [API - Groups](docs/api/groups.md)
- [API - Roles](docs/api/roles.md)
- [API - Identity Providers](docs/api/identity-providers.md)
- [API - Components](docs/api/components.md)
- [API - Authentication Management](docs/api/authentication-management.md)
- [API - Attack Detection](docs/api/attack-detection.md)
- [API - Organizations](docs/api/organizations.md)
- [API - User Profile](docs/api/user-profile.md)
- [API - Client Policies](docs/api/client-policies.md)
- [API - Server Info](docs/api/server-info.md)

### General Documentation

- [Architecture and Runtime](docs/architecture.md)
- [Keycloak Setup and Feature Flags](docs/keycloak-setup.md)
- [Testing Guide](docs/testing.md)
- [Test Configuration](docs/test-configuration.md)
- [Deployment (Local/Remote, HTTP/HTTPS)](docs/deployment.md)

## Testing

```bash
npm test
```

Or test workspace only:

```bash
npm --prefix test test
```

The suite runs against a real Keycloak instance and provisions a shared test realm during setup.

## Repository Structure

```text
Handlers/           # Keycloak resource wrappers
index.js            # Package runtime and handler wiring
index.mjs           # ESM bridge
test/
  specs/            # Test suites (core, diagnostics, matrix)
  support/          # Shared setup/bootstrap/config loaders
  config/           # default/local/secrets test configs
  docker-keycloak/  # Compose files and setup scripts
docs/               # Centralized documentation
```

## Versioning and Compatibility

- Package version: `6.0.0`
- Keycloak Admin client dependency: `@keycloak/keycloak-admin-client`
- Main compatibility target: Keycloak 25/26

### Breaking Changes in v6.0.0

OIDC authentication methods (`login()`, `loginPKCE()`, `generateAuthorizationUrl()`, `auth()`) are now deprecated.
These methods will be removed in v7.0.0. Migrate to `keycloak-express-middleware` for user authentication.

## License

MIT
