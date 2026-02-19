# Configuration & Authentication

Core API methods for initializing and managing the Keycloak Admin Client connection.

## Table of Contents

- [configure()](#configure)
- [setConfig()](#setconfig)
- [getToken()](#gettoken)
- [auth()](#auth)
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
| `tokenLifeSpan` | number | 📋 Optional | Token refresh interval in seconds (default: 60) |
| `scope` | string | 📋 Optional | OAuth2 scope (e.g., `'offline_access'` for refresh tokens) |

### Returns

**Promise\<void\>** - Resolves when authentication succeeds

### Examples

#### Password Grant (Admin User)

```javascript
const KeycloakManager = require('keycloak-api-manager');

await KeycloakManager.configure({
  baseUrl: 'https://keycloak.example.com:8443',
  realmName: 'master',
  username: 'admin',
  password: 'admin-password',
  grantType: 'password',
  clientId: 'admin-cli',
  tokenLifeSpan: 60
});

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

When `tokenLifeSpan` is set, the client automatically refreshes the access token before expiration using an internal timer. The refresh happens at `tokenLifeSpan` seconds interval.

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
| `requestConfig` | object | 📋 Optional | Axios request configuration overrides |

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

- `setConfig()` does NOT re-authenticate. It only updates the context.
- Changing `realmName` affects all subsequent API calls until changed again.
- The access token remains valid across realm switches (as long as the authenticated user/service account has permissions).

---

## getToken()

Retrieve the current access token. Useful for debugging or passing the token to other services.

**Syntax:**
```javascript
const token = await KeycloakManager.getToken()
```

### Parameters

None

### Returns

**Promise\<string\>** - The current access token (JWT)

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

const token = await KeycloakManager.getToken();
console.log('Access Token:', token);

// Use token with custom HTTP client
const axios = require('axios');
const response = await axios.get('https://keycloak.example.com/admin/realms/master', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Notes

- The returned token is automatically refreshed by the internal timer (if `tokenLifeSpan` was configured).
- Token format is JWT (JSON Web Token).

---

## auth()

Re-authenticate with new or updated credentials. Use this to switch users or refresh authentication manually.

**Syntax:**
```javascript
await KeycloakManager.auth(credentials)
```

### Parameters

#### credentials (Object) ⚠️ Required

Same structure as `configure()` credentials parameter.

### Returns

**Promise\<void\>** - Resolves when re-authentication succeeds

### Examples

#### Switch User

```javascript
// Initial authentication as admin
await KeycloakManager.configure({
  baseUrl: 'https://keycloak.example.com',
  realmName: 'master',
  username: 'admin',
  password: 'admin',
  grantType: 'password',
  clientId: 'admin-cli'
});

// Later, re-authenticate as different user
await KeycloakManager.auth({
  baseUrl: 'https://keycloak.example.com',
  realmName: 'master',
  username: 'realm-admin',
  password: 'realm-admin-password',
  grantType: 'password',
  clientId: 'admin-cli'
});
```

#### Refresh Expired Session

```javascript
// If session expired or token invalidated
try {
  await KeycloakManager.users.find();
} catch (error) {
  if (error.response && error.response.status === 401) {
    // Re-authenticate
    await KeycloakManager.auth({
      baseUrl: 'https://keycloak.example.com',
      realmName: 'master',
      username: 'admin',
      password: 'admin',
      grantType: 'password',
      clientId: 'admin-cli'
    });
    
    // Retry operation
    const users = await KeycloakManager.users.find();
  }
}
```

### Notes

- `auth()` stops the existing token refresh timer and starts a new one (if `tokenLifeSpan` is configured).
- Use `auth()` instead of `configure()` when you need to change credentials without reinitializing handlers.

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
    // 1. Configure and authenticate
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
    
    // 2. Work in master realm
    const masterRealms = await KeycloakManager.realms.find();
    console.log(`✓ Found ${masterRealms.length} realms`);
    
    // 3. Switch to application realm
    KeycloakManager.setConfig({ realmName: 'my-app' });
    console.log('✓ Switched to my-app realm');
    
    // 4. Perform operations
    const users = await KeycloakManager.users.find({ max: 100 });
    console.log(`✓ Found ${users.length} users in my-app`);
    
    // 5. Get current token for debugging
    const token = await KeycloakManager.getToken();
    console.log('✓ Current token:', token.substring(0, 50) + '...');
    
    // 6. Cleanup
    KeycloakManager.stop();
    console.log('✓ Stopped token refresh');
    
  } catch (error) {
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
