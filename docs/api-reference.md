# API Reference

Complete API documentation for keycloak-api-manager.

## Table of Contents

### Guides (Practical Implementation)
- [PKCE Login Flow Guide](guides/PKCE-Login-Flow.md) - Step-by-step OAuth2 Authorization Code + PKCE implementation guide

### Core API
- [Configuration & Authentication](api/configuration.md) - Setup, authentication, and lifecycle management

### Resource Management APIs

- [Realms](api/realms.md) - Realm creation, configuration, and management
- [Users](api/users.md) - User CRUD, credentials, roles, groups, sessions
- [Clients](api/clients.md) - Client management, secrets, authorization, service accounts
- [Client Scopes](api/client-scopes.md) - Client scope management and protocol mappers
- [Groups](api/groups.md) - Group management, members, roles, permissions
- [Roles](api/roles.md) - Realm and client roles, composite roles
- [Identity Providers](api/identity-providers.md) - IdP configuration and mappers
- [Components](api/components.md) - Component management (LDAP, Kerberos, etc.)

### Security & Authentication APIs

- [Authentication Management](api/authentication-management.md) - Flows, executions, required actions
- [Attack Detection](api/attack-detection.md) - Brute force protection and user lockout
- [Client Policies](api/client-policies.md) - Client policies and profiles

### Advanced APIs

- [Organizations](api/organizations.md) - Organization management (Keycloak 25+)
- [User Profile](api/user-profile.md) - User profile configuration and metadata
- [Server Info](api/server-info.md) - Server information, themes, providers

## Wrapper Enhancements (Beyond Basic Upstream Coverage)

The following areas include wrapper-level improvements for missing/incomplete endpoints and reliability fixes:

- **Organizations (Keycloak 25+)**: enriched CRUD and member/IdP linking flow, including robust update merge behavior
- **Client Policies**: direct REST coverage for update endpoints not reliably exposed in some client versions
- **User Profile**: direct REST coverage for configuration/metadata endpoints with consistent error handling
- **Groups Permissions**: fine-grained permissions helpers (`setPermissions`, `listPermissions`) for admin authorization flows
- **Clients Protocol Mappers**: helper methods for create/update/find/delete with safer mapper workflow handling

## Quick Reference

### Initialization

```javascript
const KeycloakManager = require('keycloak-api-manager');

// Configure and authenticate
await KeycloakManager.configure({
  baseUrl: 'https://keycloak.example.com:8443',
  realmName: 'master',
  username: 'admin',
  password: 'admin',
  grantType: 'password',
  clientId: 'admin-cli',
  tokenLifeSpan: 60
});

// Switch to different realm
KeycloakManager.setConfig({ realmName: 'my-realm' });

// Use handlers
const users = await KeycloakManager.users.find({ max: 100 });
const realm = await KeycloakManager.realms.findOne({ realm: 'my-realm' });

// Cleanup when done
KeycloakManager.stop();
```

### Handler Namespace Reference

| Namespace | Description | Module |
|-----------|-------------|--------|
| `configure()` | Authentication and setup | Core |
| `setConfig()` | Runtime configuration | Core |
| `getToken()` | Get current access token | Core |
| `login()` | Preferred OIDC token grant/login endpoint wrapper | Core |
| `generateAuthorizationUrl()` | Generate PKCE authorization URL and verifier pair | Core |
| `loginPKCE()` | Authorization Code + PKCE token exchange helper | Core |
| `auth()` | Backward-compatible alias of `login()` | Core |
| `stop()` | Stop token refresh timer | Core |
| `realms` | Realm management | realmsHandler |
| `users` | User management | usersHandler |
| `clients` | Client management | clientsHandler |
| `clientScopes` | Client scope management | clientScopesHandler |
| `groups` | Group management | groupsHandler |
| `roles` | Role management | rolesHandler |
| `identityProviders` | Identity provider management | identityProvidersHandler |
| `components` | Component management | componentsHandler |
| `authenticationManagement` | Authentication flow management | authenticationManagementHandler |
| `attackDetection` | Brute force detection | attackDetectionHandler |
| `organizations` | Organization management | organizationsHandler |
| `userProfile` | User profile configuration | userProfileHandler |
| `clientPolicies` | Client policy management | clientPoliciesHandler |
| `serverInfo` | Server information | serverInfoHandler |

## Parameter Conventions

Throughout the API:

- **Required parameters** are listed first and marked with ⚠️
- **Optional parameters** are listed after and marked with 📋
- **Query parameters** are passed as objects: `{ key: value, max: 100 }`
- **ID parameters** use Keycloak's UUID format
- **Realm context** can be set globally with `setConfig()` or per-call

## Error Handling

All API methods return Promises. Handle errors with try/catch:

```javascript
try {
  const user = await KeycloakManager.users.findOne({ id: userId });
  console.log(user.username);
} catch (error) {
  console.error('API Error:', error.message);
  // error.response may contain Keycloak-specific error details
}
```

## Return Values

- **Single resource**: Returns object (e.g., `{ id: '...', username: '...' }`)
- **Multiple resources**: Returns array (e.g., `[{ id: '...' }, ...]`)
- **Create operations**: Usually return `{ id: 'newly-created-id' }` or the created resource
- **Update operations**: Usually return void or updated resource
- **Delete operations**: Return void
- **Count operations**: Return number

## Authentication Modes

### Password Grant (Admin User)

```javascript
await KeycloakManager.configure({
  baseUrl: 'https://keycloak.example.com',
  realmName: 'master',
  username: 'admin',
  password: 'admin',
  grantType: 'password',
  clientId: 'admin-cli'
});
```

### Client Credentials Grant (Service Account)

```javascript
await KeycloakManager.configure({
  baseUrl: 'https://keycloak.example.com',
  realmName: 'master',
  clientId: 'my-service-client',
  clientSecret: 'client-secret-here',
  grantType: 'client_credentials'
});
```

## Next Steps

Browse the handler-specific documentation for detailed method reference:

1. Start with [Configuration](api/configuration.md) to set up authentication
2. Explore [Realms](api/realms.md) and [Users](api/users.md) for basic operations
3. Check [Organizations](api/organizations.md) for Keycloak 25+ features
4. Review [Server Info](api/server-info.md) to inspect your Keycloak capabilities
