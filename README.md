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

## OIDC Deprecation Notice

DEPRECATION NOTICE (v6.0.0): The OIDC authentication methods (login(), loginPKCE(), generateAuthorizationUrl(), auth()) have been deprecated and moved to keycloak-express-middleware.

This package is now exclusively for Keycloak admin resource management. For user authentication flows, use keycloak-express-middleware instead.

See [OIDC_MIGRATION_PLAN.md](OIDC_MIGRATION_PLAN.md) for migration details.

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

// Alternative after configure(): update runtime context (for example realm)
// without re-authenticating or calling configure() again.
KeycloakManager.setConfig({ realmName: 'my-realm' });

const users = await KeycloakManager.users.find({ max: 20 });
console.log(users.length);

KeycloakManager.stop();
```

## Keycloak Feature Flags

Some APIs exposed by this package depend on Keycloak server features that are disabled by default. Enable these flags when you want full endpoint coverage (local dev, CI, or production environments that use these modules):

```bash
--features=admin-fine-grained-authz:v1,organization,client-policies
```

What each flag is for:

- `admin-fine-grained-authz:v1`: enables management-permissions endpoints used by group/user fine-grained permission flows.
- `organization`: enables Organizations APIs.
- `client-policies`: enables Client Policies and Client Profiles APIs.

When you can skip them:

- If you only use core admin operations (for example realms/users/clients CRUD), the package still works without these flags.
- If you use `organizations`, `clientPolicies`, or management-permissions methods, these flags are required.

### Why `admin-fine-grained-authz:v1` in Keycloak 26.x

In Keycloak 26.x, the management-permissions APIs used by this package are compatible with the `v1` variant, so `admin-fine-grained-authz:v1` is the recommended setting.

### Example (Docker)

```bash
docker run -d --name keycloak \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -e KC_FEATURES=admin-fine-grained-authz:v1,organization,client-policies \
  quay.io/keycloak/keycloak:latest start-dev
```

See [Keycloak Setup and Feature Flags](docs/keycloak-setup.md) for full setup details.

## Public API Entry Points

- `configure(credentials)`
- `setConfig(overrides)`
- `getToken()`
- `stop()`

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

### Guides

- [OIDC Migration Plan](OIDC_MIGRATION_PLAN.md) - Migration notes for legacy OIDC helpers

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

- Package version: `6.0.3`
- Keycloak Admin client dependency: `@keycloak/keycloak-admin-client`
- Main compatibility target: Keycloak 25/26

### Breaking Changes in v6.0.0

See OIDC Deprecation Notice.

## License

MIT
