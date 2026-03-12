# Configuration & Authentication

Core API methods for initializing and managing the Keycloak Admin Client connection.

## Table of Contents

- [configure()](#configure)
- [setConfig()](#setconfig)
- [getToken()](#gettoken)
- [Deprecated OIDC Methods](#deprecated-oidc-methods)
- [stop()](#stop)

---

## configure()

Initialize and authenticate the Keycloak Admin Client. Must be called before using any handler methods.

**Syntax:**
```javascript
await KeycloakManager.configure(credentials)
```

### Parameters

#### credentials (Object) ⚠️ Required

Authentication configuration object.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `baseUrl` | string | ⚠️ Yes | Keycloak server base URL (e.g., `https://keycloak.example.com:8443`) |
| `realmName` | string | ⚠️ Yes | Target realm name for authentication (usually `master`) |
| `grantType` | string | ⚠️ Yes | OAuth2 grant type: `'password'` or `'client_credentials'` |
| `clientId` | string | ⚠️ Yes | Client ID (e.g., `admin-cli` for password grant) |
| `username` | string | 📋 Conditional | Required for `password` grant type |
| `password` | string | 📋 Conditional | Required for `password` grant type |
| `clientSecret` | string | 📋 Conditional | Required for `client_credentials` grant type |
| `tokenLifeSpan` | number | 📋 Optional | Token lifespan hint in seconds used to schedule refresh (`tokenLifeSpan / 2`) |
| `scope` | string | 📋 Optional | OAuth2 scope (e.g., `'offline_access'` for refresh tokens) |

### Returns

**Promise\<void\>** - Resolves when authentication succeeds

### Examples

#### Password Grant (Admin User)

```javascript
const KeycloakManager = require('keycloak-api-manager');

// Bootstrap admin session once at startup.
await KeycloakManager.configure({
  baseUrl: 'https://keycloak.example.com:8443',
  realmName: 'master',
  username: 'admin',
  password: 'admin-password',
  grantType: 'password',
  clientId: 'admin-cli',
  tokenLifeSpan: 60
});

// All handler calls below reuse the authenticated admin context.
console.log('Authenticated successfully');
```

#### Client Credentials (Service Account)

```javascript
await KeycloakManager.configure({
  baseUrl: 'https://keycloak.example.com:8443',
  realmName: 'master',
  clientId: 'my-service-account',
  clientSecret: 'your-client-secret-here',
  grantType: 'client_credentials',
  tokenLifeSpan: 300
});
```

#### With Refresh Token Support

```javascript
await KeycloakManager.configure({
  baseUrl: 'https://keycloak.example.com:8443',
  realmName: 'master',
  username: 'admin',
  password: 'admin',
  grantType: 'password',
  clientId: 'admin-cli',
  scope: 'offline_access', // Request offline access for refresh tokens
  tokenLifeSpan: 60
});
```

### Automatic Token Refresh

The client automatically refreshes the access token using an internal timer.

- If `tokenLifeSpan` is provided and valid, refresh runs at half that interval (`tokenLifeSpan / 2`).
- If `tokenLifeSpan` is omitted/invalid, a safe fallback interval of 30 seconds is used.

### Error Handling

```javascript
try {
  await KeycloakManager.configure({
    baseUrl: 'https://invalid-url',
    realmName: 'master',
    username: 'admin',
    password: 'wrong-password',
    grantType: 'password',
    clientId: 'admin-cli'
  });
} catch (error) {
  console.error('Authentication failed:', error.message);
  // Possible errors:
  // - Network errors (connection refused, timeout)
  // - Invalid credentials (401 Unauthorized)
  // - Invalid realm or client (404 Not Found)
}
```

---

## setConfig()

Update runtime configuration for the Keycloak Admin Client. Use this to switch realms or update settings after initial configuration.

**Syntax:**
```javascript
KeycloakManager.setConfig(overrides)
```

### Parameters

#### overrides (Object) ⚠️ Required

Configuration overrides object.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `realmName` | string | 📋 Optional | Switch to a different realm context |
| `baseUrl` | string | 📋 Optional | Override Keycloak base URL for subsequent calls |
| `requestConfig` | object | 📋 Optional | HTTP client request overrides forwarded to `@keycloak/keycloak-admin-client` internals (typically Axios). Supported keys depend on the installed admin client version |

### Returns

**void** - Synchronous operation

### Examples

#### Switch Realm Context

```javascript
// Initial configuration in master realm
await KeycloakManager.configure({
  baseUrl: 'https://keycloak.example.com',
  realmName: 'master',
  username: 'admin',
  password: 'admin',
  grantType: 'password',
  clientId: 'admin-cli'
});

// Now operate on a different realm
KeycloakManager.setConfig({ realmName: 'my-application-realm' });

// All subsequent operations use 'my-application-realm'
const users = await KeycloakManager.users.find({ max: 100 });
```

#### Custom Request Configuration

```javascript
// Runtime realm switch is immediate and affects subsequent API calls.
KeycloakManager.setConfig({
  realmName: 'my-realm',
  requestConfig: {
    timeout: 10000,
    headers: {
      'X-Custom-Header': 'value'
    }
  }
});
```

### Notes

- `setConfig()` does NOT perform token/login calls. It only updates the runtime context.
- Changing `realmName` affects all subsequent API calls until changed again.
- Changing `baseUrl` updates the runtime target URL and is normalized (trailing slash removed).
- The access token remains valid across realm switches (as long as the authenticated user/service account has permissions).

---

## getToken()

Retrieve the current access token. Useful for debugging or passing the token to other services.

**Syntax:**
```javascript
const { accessToken, refreshToken } = KeycloakManager.getToken()
```

### Parameters

None

### Returns

**{ accessToken: string, refreshToken: string }** - Current token pair managed by the client

### Examples

```javascript
await KeycloakManager.configure({
  baseUrl: 'https://keycloak.example.com',
  realmName: 'master',
  username: 'admin',
  password: 'admin',
  grantType: 'password',
  clientId: 'admin-cli'
});

// Reads token currently managed by the internal refresh loop.
const { accessToken } = KeycloakManager.getToken();
console.log('Access Token:', accessToken);

// Use token with custom HTTP client
const axios = require('axios');
const response = await axios.get('https://keycloak.example.com/admin/realms/master', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Notes

- The returned token is automatically refreshed by the internal timer (if `tokenLifeSpan` was configured).
- `accessToken` is JWT (JSON Web Token). `refreshToken` may be undefined depending on grant/scope.

---

## Deprecated OIDC Methods

The following methods are still available only for backward compatibility and are deprecated since v6.0.0:

- `auth(credentials)`
- `login(credentials)`
- `generateAuthorizationUrl(options)`
- `loginPKCE(credentials)`

These methods will be removed in v7.0.0.

For all user authentication flows (including Authorization Code + PKCE), use keycloak-express-middleware:

- https://github.com/smartenv-crs4/keycloak-express-middleware

Migration notes:

- [OIDC Migration Plan](../../OIDC_MIGRATION_PLAN.md)

---

## stop()

Stop the automatic token refresh timer and cleanup resources. Call this when shutting down your application.

**Syntax:**
```javascript
KeycloakManager.stop()
```

### Parameters

None

### Returns

**void** - Synchronous operation

### Examples

#### Application Shutdown

```javascript
const KeycloakManager = require('keycloak-api-manager');

async function main() {
  await KeycloakManager.configure({
    baseUrl: 'https://keycloak.example.com',
    realmName: 'master',
    username: 'admin',
    password: 'admin',
    grantType: 'password',
    clientId: 'admin-cli',
    tokenLifeSpan: 60
  });
  
  // Do work
  const users = await KeycloakManager.users.find({ max: 100 });
  console.log(`Found ${users.length} users`);
  
  // Cleanup before exit
  KeycloakManager.stop();
  console.log('Token refresh timer stopped');
}

main().catch(console.error);
```

#### Process Signal Handlers

```javascript
let cleanupDone = false;

process.on('SIGINT', () => {
  if (!cleanupDone) {
    console.log('Shutting down gracefully...');
    KeycloakManager.stop();
    cleanupDone = true;
    process.exit(0);
  }
});

process.on('SIGTERM', () => {
  if (!cleanupDone) {
    console.log('Shutting down gracefully...');
    KeycloakManager.stop();
    cleanupDone = true;
    process.exit(0);
  }
});
```

### Notes

- Always call `stop()` before application exit to prevent dangling timers.
- After calling `stop()`, you can call `configure()` or `auth()` again to restart.
- Not calling `stop()` may prevent Node.js process from exiting cleanly.

---

## Full Workflow Example

```javascript
const KeycloakManager = require('keycloak-api-manager');

async function keycloakWorkflow() {
  try {
    // 1) Configure and authenticate once.
    await KeycloakManager.configure({
      baseUrl: 'https://keycloak.example.com:8443',
      realmName: 'master',
      username: 'admin',
      password: 'admin',
      grantType: 'password',
      clientId: 'admin-cli',
      tokenLifeSpan: 60
    });
    console.log('✓ Authenticated');
    
    // 2) Run operations in the current realm context.
    const masterRealms = await KeycloakManager.realms.find();
    console.log(`✓ Found ${masterRealms.length} realms`);
    
    // 3) Switch realm context for following API calls.
    KeycloakManager.setConfig({ realmName: 'my-app' });
    console.log('✓ Switched to my-app realm');
    
    // 4) Execute admin operations in the target realm.
    const users = await KeycloakManager.users.find({ max: 100 });
    console.log(`✓ Found ${users.length} users in my-app`);
    
    // 5) Optionally inspect the token for debugging/integration checks.
    const { accessToken } = KeycloakManager.getToken();
    console.log('✓ Current token:', accessToken.substring(0, 50) + '...');
    
    // 6) Always stop refresh timer before process exit.
    KeycloakManager.stop();
    console.log('✓ Stopped token refresh');
    
  } catch (error) {
    // Ensure timer cleanup also happens on failures.
    console.error('✗ Error:', error.message);
    KeycloakManager.stop();
    process.exit(1);
  }
}

keycloakWorkflow();
```

---

## See Also

- [API Reference](../api-reference.md) - Complete API documentation index
- [Realms API](realms.md) - Realm management operations
- [Users API](users.md) - User management operations
