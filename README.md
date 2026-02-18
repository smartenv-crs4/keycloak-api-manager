# 🔐 Keycloak Adapter API for Node.js (Express)
Keycloak-api-manager is a comprehensive **Node.js library** that wraps the official 
Keycloak Admin REST API, providing a clean and consistent functional interface for 
programmatic management of Keycloak resources.  With this package, you can easily interact with Keycloak just like through its Admin 
Console — creating and managing realms, clients, users, roles, groups, 
permissions, and authentication policies — all via simple JavaScript functions.
The library simplifies integration of Keycloak into custom applications, automation 
scripts, and backend services by handling authentication, 
API calls, and error management internally. Designed for developers who want full control over Keycloak’s administrative capabilities 
without manually invoking REST endpoints, keycloak-api-manager enables fast, reliable, 
and type-safe operations across multiple realms and environments.
it is a wrapper based on '@keycloak/keycloak-admin-client'


---
## 📦 Features

🔐 ***Full Keycloak API Coverage*** 
- Complete wrapper for Keycloak Admin REST API 
- Manage realms, clients, users, roles, groups, and permissions 
- Support for both public and confidential clients 
- Built-in token acquisition and refresh using admin credentials. For the refresh token, it is necessary to correctly set the tokenLifeSpan parameter during configuration

⚙️ ***Administration & Automation***
- Create, update, and delete users, clients, and roles programmatically 
- Assign and revoke realm and client roles 
- Manage user credentials, including password resets and temporary logins 
- Automate realm and client configuration in CI/CD pipelines 
- Support for bulk operations (e.g., multiple user imports/updates)

🧩 ***Functional and Developer-Friendly API***
- Simple function-based interface instead of raw REST calls 
- Consistent, predictable naming (e.g., createUser(), assignRole(), getClients())
- Promise-based async functions with proper error handling 
- Works seamlessly with TypeScript (type definitions included)

🛡️ ***Security & Authentication***
- Built-in admin login flow (client credentials or username/password)
- Automatic token refresh and reuse 
- -Supports custom Keycloak base URLs, ports, and SSL setups 
- -Optional logging and debug mode for request tracing

🌍 ***Integration & Extensibility***
- Easy integration into Express.js, NestJS, or custom Node.js services 
- Works with multiple Keycloak instances or environments 
- Configurable HTTP client, allowing custom interceptors or headers 
- Can be used as a standalone CLI helper or within applications

🧠 ***Developer Experience***
- Lightweight, dependency-minimal package 
- Intuitive method structure mirroring Keycloak’s admin console 
- Clear error messages and optional verbose logging 
- Fully documented with code examples and usage guides
---

## 🚀 Installation

```bash
npm install keycloak-api-manager
```

Or, if using Yarn:

```bash
yarn add keycloak-api-manager
```

---

## 🛠️ Get Keycloak Configuration
Copy or Download from keycloak admin page your client configuration `keycloak.json` by visiting 
the Keycloak Admin Console → clients (left sidebar) → choose your client → Installation → Format Option → Keycloak OIDC JSON → Download
```json
{
  "realm": "your-realm",
  "auth-server-url": "https://your-keycloak-domain/auth",
  "ssl-required": "external",
  "resource": "your-client-id",
  "credentials": {
    "secret": "your-client-secret"
  },
  "confidential-port": 0
}
```
---

## 📄 Usage Example

```js
const KeycloakManager = require('keycloak-api-manager');
const express = require('express');
// Import the Keycloak API Manager

// Configure and Initialize Keycloak manager api
// Initialize the manager with Keycloak credentials
await KeycloakManager.configure({
    baseUrl: 'http://localhost:8080',   // Keycloak base URL
    realmName: 'master',                // Realm where the admin user belongs (alias: realm)
    clientId: 'admin-cli',              // Keycloak admin client
    username: 'admin',                  // Admin username
    password: 'admin',                  // Admin password
    grantType: 'password',              // Type of authentication
    tokenLifeSpan: 120                  // access_token Lifetime in seconds 
});


// Create a new user in the target realm
const newUser = await KeycloakManager.users.create({
    username: 'john.doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    enabled: true,
});

// List first page of users
const users = await KeycloakManager.users.find({ first: 0, max: 10 });

// find users by attributes
users = await KeycloakManager.users.find({ q: "phone:123" });

// Override client configuration for all further requests:
KeycloakManager.setConfig({
    realmName: 'another-realm',
});

// This operation will now be performed in 'another-realm' if the user has access.
const groups = await KeycloakManager.groups.find();

// Set a `realm` property to override the realm for only a single operation.
// For example, creating a user in another realm:
await KeycloakManager.users.create({
    realm: 'a-third-realm',
    username: 'username',
    email: 'user@third-realm.com',
});


// create a new realm, If id omitted, Keycloak uses the realm name as the ID.
const realm = await KeycloakManager.realms.create({
    id: "123456",
    realm: "new-realm",
});


// Get realm Info
realm = await KeycloakManager.realms.findOne({
    realm: "new-realm"
});

console.log("realm info:", realm);

```

---

## 🧩 Configuration

In your Express application:

```js
const KeycloakManager = require('keycloak-api-manager');

// Configure and Initialize Keycloak manager api
// Initialize the manager with Keycloak credentials
await KeycloakManager.configure({
    baseUrl: 'http://localhost:8080',   // Keycloak base URL
    realmName: 'master',                // Realm where the admin user belongs (alias: realm)
    clientId: 'admin-cli',              // Keycloak admin client
    username: 'admin',                  // Admin username
    password: 'admin',                  // Admin password
    grantType: 'password',              // Type of authentication
    tokenLifeSpan: 120                  // access_token Lifetime in seconds 
});
```

Configure is a configuration function for the Keycloak-api-manager.
It must be called at app startup, before to use the administrative
functions exposed by this library

Parameters:
- adminClientCredentials: [required] Advanced configuration for setting up the realm-admin user or client,
  which will be used as the administrator to manage Keycloak via API.
  This is required in order to use the administrative functions exposed by this library.
  If this parameter is not provided, it will not be possible to use the administrative functions of Keycloak
  exposed by this adapter, so any attempt to call KeycloakManager.{function} will result in a runtime error due to access on an undefined object
  Main supported options:
  - baseUrl: [required] Keycloak base Url
    - realmName: [required] A String that specifies the realm to authenticate against, if different from the "keyCloakConfig.realm" parameter.  If you intend to use Keycloak administrator credentials, this should be set to 'master'.
    - realm: [optional] Alias of realmName for backward compatibility.
  - grantType: [required] The OAuth2 grant type used for authentication. example "password". Possible values: 'password', 'client_credentials', 'refresh_token', etc.
  - clientId: [required] string containing the client ID configured in Keycloak. Required for all grant types.
  - tokenLifeSpan: [required] Numeric Lifetime of an access token expressed in seconds. It indicates how often the access token should be renewed. If set incorrectly and the Keycloak token expires before the renewal interval defined by this parameter, errors and exceptions may occur
  - username: [optional] string username. Required when using the password grant type. 
  - password: [optional] string password. Required when using the password grant type.
  - scope: [Optional] A string that specifies The OAuth2 scope requested during authentication (optional). Typically, not required for administrative clients. example:openid profile
  - requestOptions: [Optional] JSON parameters to configure HTTP requests (such as custom headers, timeouts, etc.). It is compatible with the Fetch API standard. Fetch request options https://developer.mozilla.org/en-US/docs/Web/API/fetch#options
  - clientSecret: [Optional] string containing the client secret of the client. Required for client_credentials or confidential clients.
  - totp: string for Time-based One-Time Password (TOTP) for multifactor authentication (MFA), if enabled for the user.
  - offlineToken: [Optional] boolean value. If true, requests an offline token (used for long-lived refresh tokens). Default is false.
  - refreshToken: [Optional] string containing a valid refresh token to request a new access token when using the refresh_token grant type.
---

## 📚 Documentation Structure

This project maintains comprehensive documentation across multiple files. Here's a guide to find what you need:

### 🚀 Getting Started
- **This file (README.md)** - Overview, installation, quick start, API reference
- **[DEPLOYMENT_GUIDE.md](./test/docker-keycloak/DEPLOYMENT_GUIDE.md)** - Deploy Keycloak locally or remotely with HTTP/HTTPS
  - Interactive setup wizard (`npm run setup-keycloak`)
  - Local vs remote deployments
  - Certificate configuration
  - Troubleshooting guide

### 🧪 Testing & Development
- **[test/TESTING.md](./test/TESTING.md)** - Complete test suite documentation
  - Test architecture (shared realm strategy)
  - How to run tests
  - Test file structure and components
  - Writing new tests
  - Performance metrics
  - Troubleshooting test issues

- **[test/config/CONFIGURATION.md](./test/config/CONFIGURATION.md)** - Test configuration details
  - Configuration file hierarchy (default.json → secrets.json → local.json)
  - How to set up test environment
  - Configuration schema
  - Sensitive data management

### 📋 Quick Reference

| Need | Location |
|------|----------|
| Install and basic usage | [README.md](./README.md#-installation) (this file) |
| Deploy Keycloak | [DEPLOYMENT_GUIDE.md](./test/docker-keycloak/DEPLOYMENT_GUIDE.md#quick-start) |
| Run tests locally | [test/TESTING.md](./test/TESTING.md#running-tests) |
| Configure tests | [test/config/CONFIGURATION.md](./test/config/CONFIGURATION.md) |
| API reference | [README.md](./README.md#-available-helper-functions) (below) |
| Test architecture | [test/TESTING.md](./test/TESTING.md#architecture) |

---

## 🧪 Testing Reminder

When running the test suite, two fields must always be resolvable from configuration (default/local/secrets/env/CLI):

- `keycloak.baseUrl`: target Keycloak URL used by admin client authentication
- `keycloak.realm`: realm used for authentication/context (usually `master`)

Notes:
- For **pre-deployed Keycloak** (`USE_REMOTE_KEYCLOAK=true`), these values must be set explicitly in test config.
- For **remote Docker via SSH**, `baseUrl` may be auto-overridden at runtime (for example via SSH tunnel), but defaults are still required as fallback.
- Keep this reminder in sync with `test/TESTING.md`.

Configuration file roles for tests:
- `test/config/default.json`: committed safe defaults
- `test/config/local.json`: git-ignored machine/environment overrides
- `test/config/secrets.json`: git-ignored sensitive values only

For full test configuration guidance see `test/config/CONFIGURATION.md`.

---

## 🧰 Available Helper Functions

### `function setConfig(config)`
This function updates the runtime configuration of the Keycloak-api-manager Admin Client instance.
It allows switching the target realm, base URL, or HTTP request options without reinitializing the client or re-authenticating.
It’s useful when you need to interact with multiple realms or environments dynamically using the same admin client instance.

**` -- @parameters -- `**
- config: is a JSON object that accepts the following parameters:
  - realmName: [optional] The name of the target realm for subsequent API requests. 
  - baseUrl: [optional] The base URL of the Keycloak server (e.g., https://auth.example.com). 
  - requestOptions: [optional] Custom HTTP options (headers, timeout, etc.) applied to API calls. 
  - realmPath: [optional] A custom realm path if your Keycloak instance uses a non-standard realm route.
  - other fields

**` -- @notes -- `**
Calling setConfig does not perform authentication 

---

## 🧪 Test Workspace (Self-Contained)

The test environment is intentionally isolated inside the `test/` folder and uses a shared test realm approach for optimal performance.

### Deploying Keycloak

There are two main approaches to deploy Keycloak for testing:

**1. Quick Start (Recommended)**

Use the interactive setup wizard:

```bash
npm run setup-keycloak
```

This script handles everything:
- ✅ Choose local or remote deployment
- ✅ Configure HTTP or HTTPS
- ✅ Auto-detect certificates in `test/docker-keycloak/certs/` (or prompt for custom path)
- ✅ Automatic certificate mounting (if HTTPS)
- ✅ Auto health checks and startup verification

**Note**: For HTTPS, place your certificates in `test/docker-keycloak/certs/` (named `keycloak.crt` and `keycloak.key`) to use them automatically without prompting.

**2. Manual Docker Compose**

Start Keycloak directly:

```bash
docker-compose up -d       # HTTP mode
npm test                   # Run tests
docker-compose down        # Cleanup
```

**For comprehensive deployment documentation** (cert generation, HTTPS setup, remote SSH deployments, troubleshooting):

👉 See **[DEPLOYMENT_GUIDE.md](./test/docker-keycloak/DEPLOYMENT_GUIDE.md)**

### Directory Structure

- `test/specs/` - All test suites (e.g., users.test.js, roles.test.js)
- `test/config/` - Configuration files managed by propertiesmanager
  - See [test/config/CONFIGURATION.md](./test/config/CONFIGURATION.md) for details
- `test/node_modules/` - Test dependencies (isolated from package root)
- `test/setup.js` - Global Mocha hooks (runs before all tests)
- `test/enableServerFeatures.js` - Creates shared test realm infrastructure
- `test/testConfig.js` - Centralized configuration loader
- `test/diagnostic-protocol-mappers.js` - Manual protocol mapper diagnostic (not part of Mocha tests)
- `test/docker-keycloak/docker-compose.yml` - HTTP configuration
- `test/docker-keycloak/docker-compose-https.yml` - HTTPS configuration
- `test/docker-keycloak/setup-keycloak.js` - Interactive deployment script
- `test/docker-keycloak/certs/` - Default certificate location (keycloak.crt, keycloak.key)

For complete test architecture and structure details:

👉 See **[test/TESTING.md](./test/TESTING.md)**


Configuration files are merged in order: `default.json` → `secrets.json` → `local.json`

### Shared Test Realm

All tests use a **single shared realm** (`keycloak-api-manager-test-realm`) created once before any test runs. This approach:
- **Global Setup**: Runs once before all tests (via Mocha `before()` hook in `setup.js`)
- **Infrastructure Created**: Test realm, client, user, roles, groups, and client scopes
- **Performance**: Tests run ~5x faster than per-test realm creation approach
- **Isolation**: Each test creates unique resources to avoid conflicts across tests

### Running Tests

```bash
npm test                                    # Run all tests
npm --prefix test test -- --grep "Users"   # Run specific test suite
```

**For detailed test information:**

👉 See **[test/TESTING.md](./test/TESTING.md)** for:
- Test architecture and shared realm strategy
- Running tests with various configurations
- Writing new tests
- Troubleshooting and performance metrics

👉 See **[test/config/CONFIGURATION.md](./test/config/CONFIGURATION.md)** for:
- Configuration file setup and management
- Setting up credentials (`secrets.json`)
- Configuration schema and options

---

## 🛠️ Available Helper Functions

### `function setConfig(config)`
This function updates the runtime configuration of the Keycloak-api-manager Admin Client instance.
It allows switching the target realm, base URL, or HTTP request options without reinitializing the client or re-authenticating.
It's useful when you need to interact with multiple realms or environments dynamically using the same admin client instance.

**` -- @parameters -- `**
- config: is a JSON object that accepts the following parameters:
  - realmName: [optional] The name of the target realm for subsequent API requests. 
  - baseUrl: [optional] The base URL of the Keycloak server (e.g., https://auth.example.com). 
  - requestOptions: [optional] Custom HTTP options (headers, timeout, etc.) applied to API calls. 
  - realmPath: [optional] A custom realm path if your Keycloak instance uses a non-standard realm route.
  - other fields

**` -- @notes -- `**
Calling setConfig does not perform authentication 
- it only changes configuration values in memory.
- The authentication token already stored in the admin client remains active until it expires.
- Only the properties explicitly passed in the config object are updated; all others remain unchanged.

If the authenticated user does not have permissions in the new realmName, subsequent calls may fail with a 403 or 404.

Typically used in multi-realm or multi-environment management scripts.

```js
const KcAdminClient = require('keycloak-api-manager');


// Switch context to another realm dynamically
kcAdminClient.setConfig({
  realmName: 'customer-realm',
});

// All subsequent API calls will target "customer-realm"
const users = await kcAdminClient.users.find();
console.log(users);
```

### `function getToken()`
This function retrieves the current authentication tokens used by the Keycloak-api-manager Admin Client to communicate with the Keycloak REST API.
It returns both the access token (used for API authorization) and the refresh token (used to renew the session when the access token expires).

**` -- @returns -- `**
A JSON object containing:
- accessToken: The active access token string currently held by the Keycloak Admin Client. 
- refreshToken: The corresponding refresh token string, if available, used to request a new access token without re-authentication.

**` -- @notes -- `**
The tokens are managed internally by the Keycloak Admin Client after successful authentication via kcAdminClient.auth().
The accessToken typically expires after a short period (e.g., 60 seconds by default).
You can use these tokens to call Keycloak REST endpoints manually or to debug authorization issues.
If the client is not authenticated or the session has expired, both values may be undefined.

```js
const KcAdminClient = require('keycloak-api-manager');

// Example: retrieve and print current tokens
try {
  const tokens = KcAdminClient.getToken();
  console.log('Access Token:', tokens.accessToken);
  console.log('Refresh Token:', tokens.refreshToken);
} catch (error) {
  console.error('Failed to retrieve tokens:', error);
}

```
### `function auth(credentials)`
This function allows a user or client to authenticate against a Keycloak realm and obtain an access token (and optionally a refresh token).
It sends a direct HTTP POST request to the Keycloak OpenID Connect token endpoint using the provided credentials.

**` -- @parameters -- `**
credentials: a JSON object containing authentication details. Supported fields include:
- username: [optional] Username of the user (required for password grant). 
- password: [optional] Password of the user (required for password grant). 
- grant_type: [required] The OAuth2 grant type (e.g. "password", "client_credentials", "refresh_token"). 


```js
const KeycloakManager = require('keycloak-api-manager');

// Example: authenticate a user via password grant
try {
  const tokenResponse = await KeycloakManager.auth({
    username: "demo",
    password: "demo123",
    grant_type: "password",
  });

  console.log("Access Token:", tokenResponse.access_token);
} catch (error) {
  console.error("Authentication failed:", error);
}

```

### `function stop()`
This function cleanly stops the Keycloak Admin Client by clearing the automatic token refresh interval.
When the admin client is configured with `tokenLifeSpan`, it automatically refreshes the access token at regular intervals to maintain the session.
Calling `stop()` clears this interval, allowing your Node.js process to exit gracefully without hanging.

**` -- @returns -- `**
void

**` -- @notes -- `**
- This method should be called when you're done using the Keycloak Admin Client and want to terminate your application.
- It's particularly important in test environments or CLI scripts where the process needs to exit cleanly.
- If you don't call `stop()`, the token refresh interval may prevent the Node.js process from terminating.
- The method is safe to call multiple times; subsequent calls have no effect.

**` -- @example -- `**
```js
const KeycloakManager = require('keycloak-api-manager');

// Configure and use the admin client
await KeycloakManager.configure({
  baseUrl: 'http://localhost:8080',
  realmName: 'master',
  username: 'admin',
  password: 'admin',
  grantType: 'password',
  tokenLifeSpan: 60
});

// Perform admin operations
const users = await KeycloakManager.users.find();

// Clean up and allow process to exit
KeycloakManager.stop();
```

## 🔧 Available Admin Functions
All administrative functions that rely on Keycloak's Admin API must be invoked using the
KeycloakManager.{entity}.{function} pattern. 
 - {entyty} represents the type of resource you want to manage (e.g., users, roles, groups, clients).
 - {function} is the specific operation you want to perform on that resource (e.g., find, create, update, del).
For example:
```js
const KeycloakManager = require('keycloak-api-manager');
// get all users of this client
// users is the entity you want to administer.
// find is the method used to retrieve the list of users.
KeycloakManager.users.find();
 ```
Credits to @keycloak/keycloak-admin-client. 
This admin function is built on top of it. For more details, please refer to the official repository.

### `entity realm`
The realms property provides access to all administrative operations related to Keycloak realms. 
A realm in Keycloak is a fundamental concept that acts as an isolated tenant: 
each realm manages its own set of users, roles, groups, and clients independently.
#### `entity realm functions`

##### `function create(realm-dictionary)`
create is a method used to create a new realm.
This method accepts a realm representation object containing details such as is, name

**` -- @parameters -- `**
- realm-dictionary: is a JSON object that accepts filter parameters
  - id:[required] The internal ID of the realm. If omitted, Keycloak uses the realm name as the ID.
  - realm:[required] The name of the realm to create.
  - { other fields }Additional optional properties can be passed to configure the realm (e.g., enabled, displayName, etc.).

```js
const KeycloakManager = require('keycloak-api-manager');
 // create a new realm
 const realm = await KeycloakManager.realms.create({
     id: "realm-id",
     realm: "realmName",
 });
 ```

##### `function update(filter,realm-dictionary)`
Updates the configuration of an existing realm. 
You can use this method to modify settings such as login behavior, themes, token lifespans, and more.

**` -- @parameters -- `**
- filter:is a JSON object that accepts filter parameters
  - realm:[required] The identifier of the realm you want to update.
- realm-dictionary: An object containing the updated realm configuration. Only the fields you want to change need to be included.
  - realm properties that can be passed to update the realm (e.g., enabled, displayName, etc.).

```js
const KeycloakManager = require('keycloak-api-manager');
 // update a realm
 await KeycloakManager.realms.update(
     { realm: 'realm-name' },
     {
         displayName: "test",
     }
 );
 ```


##### `function del(filter)`
Deletes a specific realm from the Keycloak server. 
This operation is irreversible and removes all users, clients, roles, groups, and settings associated with the realm.

**` -- @parameters -- `**
- filter: is a JSON object that accepts filter parameters
  - realm:[required] The name of the realm to delete.

```js
const KeycloakManager = require('keycloak-api-manager');
 // delete 'realmeName' realm
 const realm = await KeycloakManager.realms.del({
     realm: "realmName",
 });
 ```

##### `function find()`
Retrieves a list of all realms configured in the Keycloak server. 
This includes basic metadata for each realm such as ID and display name, but not the full configuration details.
This method does not take any parameters.
```js
const KeycloakManager = require('keycloak-api-manager');
 // delete 'realmeName' realm
const realms = await KeycloakManager.realms.find();
console.log("Retrieved realms:",realms);
 ```

##### `function findOne(filter)`
Retrieves the full configuration and metadata of a specific realm by its name (realm ID). 
This includes settings like login policies, themes, password policies, etc.

**` -- @parameters -- `**
- filter: is a JSON object that accepts filter parameters
  - realm:[required] The name (ID) of the realm you want to retrieve.

```js
const KeycloakManager = require('keycloak-api-manager');
 // delete 'realmeName' realm
const realmConfig = await KeycloakManager.realms.findOne({
     realm: "realmName",
 });
console.log("Retrieved realm:",realmConfig);
 ```


##### `function partialImport(configuration)`
Performs a partial import of realm configuration into a Keycloak realm. 
This allows you to import users, roles, groups, clients, and other components without replacing the entire realm.
It’s useful for incremental updates or merging configuration pieces.

**` -- @parameters -- `**
- configuration: is a JSON object that accepts filter parameters
  - realm:[required] The name of the realm where the data should be imported.
  - rep:[required] A JSON object representing part of the realm configuration to be imported(can include users, roles, groups, clients, etc.).
    - ifResourceExists:[required] Defines the behavior when an imported resource already exists in the target realm.
        Options are:
      - 'FAIL' – the operation fails if a resource already exists.
      - 'SKIP' – existing resources are skipped.
      - 'OVERWRITE' – existing resources are overwritten.
    - {other fields} other configuration to be imported like users, roles, groups ...

```js
const KeycloakManager = require('keycloak-api-manager');
 // import configuration
const roleToImport: PartialImportRealmRepresentation = {
    ifResourceExists: "FAIL",
    roles: {
        realm: [
            {
                id: "9d2638c8-4c62-4c42-90ea-5f3c836d0cc8",
                name: "myRole",
                scopeParamRequired: false,
                composite: false,
            },
        ],
    },
};
// partial realm import 
const result = await KeycloakManager.realms.partialImport({
    realm: 'my-realm',
    rep: roleToImport,
});
```

##### `function export(configuration)`
Exports the configuration of a specific realm. 
This method returns the full realm representation in JSON format, including roles, users, clients, groups, and other components depending on the provided options.

**` -- @parameters -- `**
- configuration: is a JSON object that accepts filter parameters
  - realm:[required] The name of the realm to export.
  - exportClients: [optional] boolean, Whether to include clients in the export. Default: true. 
  - exportGroupsAndRoles: [optional] boolean,  Whether to include groups and roles in the export. Default: true.

```js
const KeycloakManager = require('keycloak-api-manager');
 
//  realm export 
const exportedRealm = await KeycloakManager.realms.export({
    realm: 'my-realm',
    exportClients: true,      // optional
    exportGroupsAndRoles: true, // optional
});
// print exportedRealm
console.log(JSON.stringify(exportedRealm, null, 2));
```

##### `function getClientRegistrationPolicyProviders(configuration)`
Fetches the list of available client registration policy providers for the specified realm.
These providers define how new clients can be registered and what rules or validations apply (e.g., allowed scopes, required attributes).

**` -- @parameters -- `**
- configuration: is a JSON object that accepts filter parameters
  - realm:[required] The name of the realm where you want to list client registration policy providers.

```js
const KeycloakManager = require('keycloak-api-manager');
 
//  get Client Registration Policy Providers
await KeycloakManager.realms.getClientRegistrationPolicyProviders({
    realm: currentRealmName,
});
```


##### `function createClientsInitialAccess(realmFilter,options)`
Creates a new Initial Access Token for dynamic client registration. 
This token allows clients to register themselves with the realm using the Dynamic Client Registration API. Useful when you want to allow programmatic client creation in a controlled way.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
  - realm:[required] The name of the realm where the initial access token should be created.
- options: is a JSON object that accepts filter parameters
  - count [required]  Number of times this token can be used to register new clients. 
  - expiration [required] Time (in seconds) after which the token expires. 0 is unlimited

 
@return - Returns an object containing:
- id: internal ID of the token 
- token: the actual token string to be used during dynamic registration 
- timestamp: Creation timestamp 
- expiration: Expiration time in seconds 
- count: Maximum allowed uses 
- remainingCount: How many uses are left
```js
const KeycloakManager = require('keycloak-api-manager');
//  get Client Registration Policy Providers with oount=1 and unlimited expiration time
const initialAccess= await KeycloakManager.realms.realms.createClientsInitialAccess(
    { realm: currentRealmName },
    { count: 1, expiration: 0 },
);

console.log("Initial Access Token:", initialAccess.token);
```

##### `function getClientsInitialAccess(realmFilter)`
Retrieves all existing Initial Access Tokens for dynamic client registration in a given realm. 
These tokens are used to allow programmatic or automated registration of clients via the Dynamic Client Registration API.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
  - realm:[required] The name of the realm from which to list all initial access tokens.
 
@return - An array of objects representing each initial access token. Each object contains:
- id: internal ID of the token 
- token: the actual token string to be used during dynamic registration 
- timestamp: Creation timestamp
- expiration: Expiration time in seconds
- count: Maximum allowed uses
- remainingCount: How many uses are left
```js
const KeycloakManager = require('keycloak-api-manager');
//  get get Clients Initial Access list
const tokens= await KeycloakManager.realms.getClientsInitialAccess({ realm:'realm-id'});
console.log("Initial Access Tokens:", tokens);
```



##### `function delClientsInitialAccess(realmFilter)`
Deletes a specific Initial Access Token used for dynamic client registration in a given realm.
This revokes the token, preventing any future use.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
  - realm:[required] The name of the realm where the token was created.
  - id:[required] The ID of the initial access token you want to delete.
```js
const KeycloakManager = require('keycloak-api-manager');
//  delete Clients Initial Access
await KeycloakManager.realms.delClientsInitialAccess({
    realm: 'realm-id',
    id: 'initial-access-token-id',
});
```


##### `function addDefaultGroup(realmFilter)`
Adds an existing group to the list of default groups for a given realm.
Users created in this realm will automatically be added to all default groups.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
  - realm:[required] The name of the realm where the default group will be set.
  - id:[required] The ID of the group to be added as a default group
```js
const KeycloakManager = require('keycloak-api-manager');
//  get get Clients Initial Access list
await KeycloakManager.realms.addDefaultGroup({
    realm: 'realm-id',
    id: 'default-group-id',
});
```

##### `function removeDefaultGroup(realmFilter)`
Removes a group from the list of default groups in a realm. 
Default groups are automatically assigned to new users when they are created.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
  - realm:[required] The name of the realm from which to remove the default group.
  - id:[required] The ID of the group you want to remove from the default list.
```js
const KeycloakManager = require('keycloak-api-manager');
//  remove from 'realm-id' the group 'default-group-id'
await KeycloakManager.realms.removeDefaultGroup({
    realm: 'realm-id',
    id: 'default-group-id',
});
```


##### `function getDefaultGroups(realmFilter)`
Retrieves a list of all default groups for a specified realm.
These are the groups that new users will automatically be added to upon creation.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
  - realm:[required] The name of the realm from which to retrieve default groups.
  
```js
const KeycloakManager = require('keycloak-api-manager');
//  get 'realm-id' default groups
const defaultGroups = await KeycloakManager.realms.getDefaultGroups({
    realm: 'realm-id',
});
console.log(defaultGroups);
```


##### `function getGroupByPath(realmFilter)`
Retrieves a group object by specifying its hierarchical path in a realm. 
This is useful when you know the group’s full path (e.g., /parent/child) but not its ID.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
  - realm:[required] The name of the realm where the group is located.
  - path:[required] TThe full hierarchical path to the group, starting with a slash (/). For example: /developers/frontend.
  
  
```js
const KeycloakManager = require('keycloak-api-manager');
//  get 'realm-id' group by Path
const defaultGroups = await KeycloakManager.realms.getGroupByPath({
    realm: 'realm-id',
    path: 'realm-name-path'
});
console.log(defaultGroups);
```



##### `function getConfigEvents(realmFilter)`
Retrieves the event configuration settings for a specific realm.
This includes settings related to the event listeners, enabled event types, admin events, and more.
Useful for auditing and tracking activities inside Keycloak.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
    - realm:[required] The name of the realm from which to retrieve the event configuration.
```js
const KeycloakManager = require('keycloak-api-manager');
//  get Config Events
const config= await KeycloakManager.realms.getConfigEvents({
    realm: 'realm-id',
});
console.log(config);
/* config example:
{
  eventsEnabled: true,
  eventsListeners: ['jboss-logging'],
  enabledEventTypes: ['LOGIN', 'LOGOUT', 'REGISTER'],
  adminEventsEnabled: true,
  adminEventsDetailsEnabled: false
}
*/
```



##### `function updateConfigEvents(realmFilter,configurationEvents)`
Updates the event configuration for a given realm.
This includes enabling/disabling events, setting specific event types to track,
enabling admin event logging, and choosing which event listeners to use.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
    - realm:[required] The name of the realm where the configuration will be updated.
- configurationEvents:is a config events JSON object dictionary like this:
    - eventsEnabled: Enables or disables event logging.
    - eventsListeners: List of event listener IDs to use (e.g., ["jboss-logging"]).
    - enabledEventTypes: List of event types to track (e.g., ["LOGIN", "LOGOUT", "REGISTER"]).
    - adminEventsEnabled: Enables logging for admin events.
    - adminEventsDetailsEnabled: Includes full details in admin event logs if set to true.
```js
const KeycloakManager = require('keycloak-api-manager');
//  Update Config Events
const config= await KeycloakManager.realms.updateConfigEvents(
    { realm: 'realm-id'},
    {
        eventsEnabled: true,
        eventsListeners: ['jboss-logging'],
        enabledEventTypes: ['LOGIN', 'LOGOUT', 'UPDATE_PASSWORD'],
        adminEventsEnabled: true,
        adminEventsDetailsEnabled: true,
    });
```



##### `function findEvents(realmFilter)`
Retrieves a list of events that occurred in a specified realm. 
You can filter the results by event type, user, date range, and other criteria. 
Useful for auditing login, logout, and other user-related activities.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
    - realm: [required] The name of the realm to fetch events from. 
    - client: [optional] Client ID to filter events for a specific client. 
    - type: [optional] Event type to filter (e.g., LOGIN, REGISTER). 
    - user: [optional]  User ID to filter events related to a specific user. 
    - dateFrom: [optional] Start date in ISO 8601 format to filter events. 
    - dateTo: [optional] End date in ISO 8601 format to filter events. 
    - first: [optional] Pagination offset. 
    - max: [optional] Maximum number of events to return.
```js
const KeycloakManager = require('keycloak-api-manager');

//  find 10 realm-id events with a type=LOGIN and dateFrom and dateTo. 
const config= await KeycloakManager.realms.findEvents({ 
    realm: 'realm-id',
    type: 'LOGIN',
    dateFrom: '2025-08-01T00:00:00Z',
    dateTo: '2025-08-06T23:59:59Z',
    max: 10
});
```

##### `function findAdminEvents(realmFilter)`
Retrieves administrative events that occurred in a specific realm. 
Admin events are triggered by actions such as creating users, updating roles, or modifying realm settings. 
This is useful for auditing changes made via the admin API or admin console.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
    - realm: [required] The name of the realm to retrieve admin events from. 
    - authClient: [optional] Client ID used to perform the action. 
    - authIpAddress: [optional] IP address of the actor who triggered the event. 
    - authRealm: [optional] Realm of the actor. 
    - authUser: [optional] User ID of the admin who performed the action. 
    - dateFrom: [optional] Start date in ISO 8601 format. 
    - dateTo: [optional] End date in ISO 8601 format. 
    - first: [optional] Pagination offset. 
    - max: [optional] Maximum number of events to retrieve. 
    - operationTypes: [optional] Filter by operation type (e.g., CREATE, UPDATE, DELETE). 
    - resourcePath: [optional] Filter events by resource path. 
    - resourceTypes: [optional] Filter events by resource type (e.g., USER, REALM_ROLE, CLIENT).
```js
const KeycloakManager = require('keycloak-api-manager');

//  find 10 realm-id admin events with a type=CREATE|DELETE and dateFrom and dateTo. 
const config= await KeycloakManager.realms.findAdminEvents({ 
    realm: 'realm-id',
    operationTypes: ['CREATE', 'DELETE'],
    dateFrom: '2025-08-01T00:00:00Z',
    dateTo: '2025-08-06T23:59:59Z',
    max: 10
});
```



##### `function clearEvents(realmFilter)`
Deletes all user events (not admin events) from the event store of a specific realm. 
Useful for resetting or cleaning up event logs related to user actions such as logins, logouts, failed login attempts, etc.
This does not clear administrative events. To remove those, use realms.clearAdminEvents().

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
    - realm: [required] The name of the realm from which to clear user events.
```js
const KeycloakManager = require('keycloak-api-manager');

//  clear realm-id events 
const config= await KeycloakManager.realms.clearEvents({ 
    realm: 'realm-id',
});
```


##### `function clearAdminEvents(realmFilter)`
Deletes all admin events from the event store of a specific realm. 
Admin events include actions such as creating users, updating roles, changing client settings, etc., 
performed by administrators via the Admin Console or Admin REST API.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
    - realm: [required] The name of the realm from which to clear administrative events.
```js
const KeycloakManager = require('keycloak-api-manager');

//  clear realm-id admin events 
const config= await KeycloakManager.realms.clearAdminEvents({ 
    realm: 'realm-id',
});
```



##### `function getUsersManagementPermissions(realmFilter)`
Retrieves the status and configuration of user management permissions (also known as fine-grained permissions) in a specific realm. 
This allows you to check whether user management operations (like creating, updating, or deleting users) are protected by specific roles or policies.

**` -- @parameters -- `**
- realmFilter: is a JSON object that accepts filter parameters
    - realm: [required] The name of the realm for which you want to retrieve the user management permission settings.

Returns an object with information such as:      
```js
const KeycloakManager = require('keycloak-api-manager');
{
    enabled: boolean;
    resource: string;
    scopePermissions: {
          
    }
}
```
if enabled is false, user management operations are not restricted by fine-grained permissions.
You can enable or configure these permissions using updateUsersManagementPermissions()

```js
const KeycloakManager = require('keycloak-api-manager');

//  Get Permissions 
const permissions= await KeycloakManager.realms.getUsersManagementPermissions({ 
    realm: 'realm-id',
});
console.log(permissions.enabled); // true or false
```



##### `function updateUsersManagementPermissions(update-parameters)`
Enables or disables fine-grained user management permissions in a specified realm. 
This controls whether operations on users (such as creating, editing, or deleting users)
are protected using Keycloak's authorization services.

**` -- @parameters -- `**
- update-parameters: is a JSON object that accepts this parameters
    - realm: [required] The name of the realm for which you want to update the user management permission settings.
    - enabled: [required] boolean value to enable or disable permission
      - true: Activates fine-grained permissions for user management. 
      - false: Disables fine-grained permissions and falls back to standard admin roles.
    

Returns an object with information such as:      
```js
const KeycloakManager = require('keycloak-api-manager');
{
    enabled: boolean;
    resource: string;
    scopePermissions: {
          
    }
}
```

```js
const KeycloakManager = require('keycloak-api-manager');
//  Update Permissions 
const permissions= await KeycloakManager.realms.updateUsersManagementPermissions({ 
    realm: 'realm-id',
});

console.log(permissions.enabled); // true
```




##### `function getKeys(filter)`
Retrieves the realm keys metadata, including public keys, certificates, and active key information 
used for token signing, encryption, and other cryptographic operations in the specified realm.

**` -- @parameters -- `**
- filter: is a JSON object that accepts this parameters
    - realm: [required] The name of the realm for which you want to retrieve key metadata.

Returns a list of keys and related information:
```
{
    keys: [
            {
                kid: string;          // Key ID
                type: string;         // Key type (e.g., RSA, AES)
                providerId: string;   // Key provider ID
                providerPriority:     //number;
                publicKey?: string;   // Base64-encoded public key (if applicable)
                certificate?: string; // X.509 certificate (if available)
                algorithm: string;    // Signing algorithm (e.g., RS256)
                status: string;       // Status (e.g., ACTIVE, PASSIVE)
                use: string;          // Intended use (e.g., sig for signature, enc for encryption)
            },
            ...
    ]
}
```

```js
const KeycloakManager = require('keycloak-api-manager');
//  Get Keys 
const Keys= await KeycloakManager.realms.getKeys({ 
    realm: 'realm-id',
});

console.log(Keys);
```




##### `function getClientSessionStats(filter)`
Retrieves statistics about active client sessions in the specified realm. This includes the number of active sessions per client.

**` -- @parameters -- `**
- filter: is a JSON object that accepts this parameters
    - realm: [required]  The name of the realm for which you want to retrieve client session statistics.

Returns an array of objects, each representing a client with active sessions

```js
const KeycloakManager = require('keycloak-api-manager');
//  Get Client Session Stats 
const stats= await KeycloakManager.realms.getClientSessionStats({ 
    realm: 'realm-id',
});

console.log(stats);
/*
[
  { clientId: 'frontend-app', active: 5 },
  { clientId: 'admin-cli', active: 1 },
  ...
]
*/
```



##### `function pushRevocation(filter)`
Immediately pushes a revocation policy to all clients in the specified realm. 
This forces clients to revalidate tokens, effectively revoking cached access tokens and enforcing updated policies.

**` -- @parameters -- `**
- filter: is a JSON object that accepts this parameters
    - realm: [required]  The name of the realm where the revocation should be pushed.

```js
const KeycloakManager = require('keycloak-api-manager');
// push revocaiton to realm realm-id  
const pushR= await KeycloakManager.realms.pushRevocation({ 
    realm: 'realm-id',
});

console.log(pushR);
```



##### `function logoutAll(filter)`
Logs out all active sessions for all users in the specified realm. 
This invalidates all user sessions, forcing every user to re-authenticate.

**` -- @parameters -- `**
- filter: is a JSON object that accepts this parameters
    - realm: [required] The name of the realm from which to log out all users.

```js
const KeycloakManager = require('keycloak-api-manager');
// force all users logout in realm realm-id  
const logout= await KeycloakManager.realms.logoutAll({ 
    realm: 'realm-id',
});

console.log('logout results:',logout);
```



##### `function testLDAPConnection(filter,options)`
Tests the connection to an LDAP server using the provided configuration parameters. 
This is useful to verify that Keycloak can reach and authenticate with the LDAP server before 
fully integrating it into the realm configuration.

**` -- @parameters -- `**
- filter: is a JSON object that accepts this filter parameters
    - realm: [required] Name of the realm where the LDAP provider is being tested.
- options: is a JSON object that accepts this parameters
  - action: [required] Specifies the test type. Use "testConnection" to verify the connection, or "testAuthentication" to verify bind credentials. 
  - connectionUrl: [required] URL of the LDAP server (e.g., ldap://ldap.example.com:389). 
  - bindDn: [required] Distinguished Name (DN) used to bind to the LDAP server. 
  - bindCredential: [required] Password or secret associated with the bind DN. 
  - useTruststoreSpi: [optional] Whether to use the truststore ("ldapsOnly", "always", etc.). 
  - connectionTimeout: [optional] Timeout value for the connection (in milliseconds). 
  - authType: [optional] Type of authentication; usually "simple" or "none".

```js
const KeycloakManager = require('keycloak-api-manager');
//should fail with invalid ldap settings
    try {
        await KeycloakManager.realms.testLDAPConnection(
            { realm: "realm-name" },
            {
                action: "testConnection",
                authType: "simple",
                bindCredential: "1",
                bindDn: "1",
                connectionTimeout: "",
                connectionUrl: "1",
                startTls: "",
                useTruststoreSpi: "always",
            },
        );
        fail("exception should have been thrown");
    } catch (error) {
        console.log(error); // exception should have been thrown
    }
```



##### `function ldapServerCapabilities(filter,options)`
This function queries the LDAP server configured for a specific realm to retrieve and display its supported capabilities.
It helps validate the connection and understand which LDAP features are available,
such as supported controls, extensions, authentication mechanisms, and more.

**` -- @parameters -- `**
- filter: is a JSON object that accepts this filter parameters
    - realm: [required] Name of the realm where the LDAP provider is being tested.
- options: is a JSON object that accepts this parameters
  - action: [required] Specifies the test type. Use "testConnection" to verify the connection, or "testAuthentication" to verify bind credentials. 
  - connectionUrl: [required] URL of the LDAP server (e.g., ldap://ldap.example.com:389). 
  - bindDn: [required] Distinguished Name (DN) used to bind to the LDAP server. 
  - bindCredential: [required] Password or secret associated with the bind DN. 
  - useTruststoreSpi: [optional] Whether to use the truststore ("ldapsOnly", "always", etc.). 
  - connectionTimeout: [optional] Timeout value for the connection (in milliseconds). 
  - authType: [optional] Type of authentication; usually "simple" or "none".

```js
const KeycloakManager = require('keycloak-api-manager');
// should fail with invalid ldap server capabilities
    try {
        await KeycloakManager.realms.ldapServerCapabilities(
            { realm: "realm-name" },
            {
                action: "testConnection",
                authType: "simple",
                bindCredential: "1",
                bindDn: "1",
                connectionTimeout: "",
                connectionUrl: "1",
                startTls: "",
                useTruststoreSpi: "always",
            },
        );
        fail("exception should have been thrown");
    } catch (error) {
        console.log(error); // exception should have been thrown
    }
```



##### `function testSMTPConnection(filter,config)`
Tests the SMTP connection using the provided configuration. 
This allows you to verify that Keycloak can connect and send emails through the configured 
SMTP server before applying the settings to the realm.

**` -- @parameters -- `**
- filter: is a JSON object that accepts this filter parameters
    - realm: [required] The name of the realm where the SMTP server will be tested.
- config: An object containing the SMTP server configuration:
  - from: [required] The sender email address. 
  - host: [required] The SMTP server host (e.g., smtp.example.com). 
  - port: [required] The SMTP server port (usually 587, 465, or 25). 
  - auth: [optional] Whether authentication is required ("true" or "false"). 
  - user [optional] The username for SMTP authentication. 
  - password [optional] The password for SMTP authentication. 
  - replyTo [optional] The reply-to email address. 
  - starttls [optional] Enable STARTTLS ("true" or "false"). 
  - ssl [optional] Enable SSL ("true" or "false"). 
  - envelopeFrom [optional] Envelope sender address.

```js
const KeycloakManager = require('keycloak-api-manager');
// should fail with invalid smtp settings
    try {
        await KeycloakManager.realms.testSMTPConnection(
            { realm: "master" },
            {
                from: "test@test.com",
                host: "localhost",
                port: 3025,
            },
        );
        fail("exception should have been thrown");
    } catch (error) {
        console.log(error); // exception should have been thrown
    }
```




##### `function getRealmLocalizationTexts(filter)`
Retrieves all localization texts (custom messages and labels) defined for a specific realm and locale. 
Localization texts are used to override default Keycloak UI messages for login forms, error pages, and other user-facing content

**` -- @parameters -- `**
- filter: is a JSON object that accepts this filter parameters
    - realm: [required] The name of the realm from which to fetch localization texts.
    - selectedLocale: [required] The locale code (e.g., 'en', 'it', 'fr', etc.) for which you want to retrieve the translations.
```js
const KeycloakManager = require('keycloak-api-manager');
// Realm localization
const texts= await KeycloakManager.realms.getRealmLocalizationTexts({ 
        realm: "realm-id",
        selectedLocale:'it'
});
console.log(texts); 
```




##### `function addLocalization(filter,value)`
Adds or updates a localization text (custom UI message or label) for a specific realm and locale in Keycloak. 
This allows you to override default messages in the login screens and other UI components with custom translations.

**` -- @parameters -- `**
- filter: is a JSON object that accepts this filter parameters
    - realm: [required] The name of the realm where the localization should be applied.
    - selectedLocale: [required] The locale code (e.g., 'en', 'fr', 'it') for which the translation is being added.
    - key: [required] The message key or identifier to override (e.g., loginAccountTitle, errorInvalidUsername).
- value: [required]  The actual translated text to associate with the key for the given locale.
```js
const KeycloakManager = require('keycloak-api-manager');
// should add localization
await KeycloakManager.realms.addLocalization({ 
        realm: "realm-id",
        selectedLocale:'it',
        key:"theKey"
},"new Value String for key:theKey");

```



##### `function getRealmSpecificLocales(filter)`
Retrieves the list of locales (language codes) for which custom localization texts have been defined in a specific realm. 
This function is useful to determine which locales have at least one overridden message.

**` -- @parameters -- `**
- filter: is a JSON object that accepts this filter parameters
    - realm: [required] The name of the realm for which to fetch the list of custom locales.
    - selectedLocale: [optional] The locale code (e.g., 'en', 'fr', 'it').

Return An array of locale codes (e.g., ["en", "it", "fr"]) representing the languages that have at least 
one customized localization entry in the given realm.
```js
const KeycloakManager = require('keycloak-api-manager');
// should add localization
await KeycloakManager.realms.addLocalization({
    realm: "realm-id",
    selectedLocale:'it',
    key:"theKey"
},"new Value String for key:theKey");

// should get localization for specified locale
const specificLocales= await KeycloakManager.realms.getRealmSpecificLocales({ 
        realm: "realm-id",
        selectedLocale: "it",
});

console.log(specificLocales.thekey); // new Value String for key:theKey

```


##### `function deleteRealmLocalizationTexts(filter)`
Deletes a specific custom localization text entry for a given locale and key within a realm. 
This is useful when you want to remove a previously added or overridden message from the realm's custom localization.

**` -- @parameters -- `**
- filter: is a JSON object that accepts this filter parameters
    - realm: [required] The name of the realm where the localization entry exists.
    - selectedLocale: [required] The locale code (e.g., 'en', 'fr', 'it').
    - key: [optional] The key identifying the message you want to remove.
      If no key is specified, all keys will be removed

Returns void if the deletion is successful. Will throw an error if the entry does not exist or if parameters are invalid.

```js
const KeycloakManager = require('keycloak-api-manager');
// should delete localization for specified locale key 'theKey'
await KeycloakManager.realms.deleteRealmLocalizationTexts({ 
        realm: "realm-id",
        selectedLocale: "it",
        key:'theKey'
});
```



### `entity users`
The roles users refers to Keycloak's users management functionality, part of the Admin REST API.
It allows you to create, update, inspect, and delete both realm-level and client-level users.

#### `entity roles functions`

##### `function create(userRepresentation)`
create is a method used to create a new user in the specified realm. 
This method accepts a user representation object containing details such as username, email, enabled status, 
credentials, and other user attributes that can be get by getProfile function. 
It is typically used when you want to programmatically add new users to your Keycloak realm via the Admin API.

**` -- @parameters -- `**
- userRepresentation: An object containing the user fields to be updated.
```js
const KeycloakManager = require('keycloak-api-manager');
 // create a new user
 const userProfile = await KeycloakManager.users.create({
     username:"username",
     email: "test@keycloak.org",
     // enabled required to be true in order to send actions email
     emailVerified: true,
     enabled: true,
     attributes: {
         key: "value",
     },
 });
 ```

##### `function del(filter)`
Deletes a user from the specified realm. Once removed, the user and all associated data (such as credentials, 
sessions, and group/role memberships) are permanently deleted.

**` -- @parameters -- `**
- id: [Required] the user ID to delete
- realm [Optional] the realm name (defaults to current realm)
```js
const KeycloakManager = require('keycloak-api-manager');
 // delete a user
 const userProfile = await KeycloakManager.users.del({ 
     id: 'user-Id' 
 });
 ```
##### `function find(filter)`
find method is used to retrieve a list of users in a specific realm. 
It supports optional filtering parameters such as username, email, first name, last name, and more. 
Searching by attributes is only available from Keycloak > 15

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - q: A string containing a query filter by custom attributes, such as 'username:admin'. 
  - {builtin attribute}: To find users by builtin attributes such as email, surname... example {email:"admin@admin.com"}
  - max: A pagination parameter used to define the maximum number of users to return (limit).
  - first: A pagination parameter used to define the number of users to skip before starting to return results (offset/limit).
```js
const KeycloakManager = require('keycloak-api-manager');
 // find a user with 'key:value'
const user = await KeycloakManager.users.find({ q: "key:value" });;
if(user) console.log('User found:', user);
else console.log('User not found');

// find a user by name = John
user = await KeycloakManager.users.find({ name: "John" });;
if(user) console.log('User found:', user);
else console.log('User not found');

// find a user with 'name:john', skip 10 users and limt to 5
const user = await KeycloakManager.users.find({ q: "name:john", first:11, max:5});;
if(user) console.log('User found:', user);
else console.log('User not found');
 ```

##### `function findOne(filter)`
findOne is method used to retrieve a specific user's details by their unique identifier (id) within a given realm. 
It returns the full user representation if the user exists.
```js
const KeycloakManager = require('keycloak-api-manager');
 // find a user with id:'user-id'
const user = await KeycloakManager.users.findOne({ id: 'user-id' });
if(user) console.log('User found:', user);
else console.log('User not found');
 ```

##### `function count(filter)`
count method returns the total number of users in a given realm. 
It optionally accepts filtering parameters similar to those in users.find() such 
as username, email, firstName, lastName and so on to count only users that match specific criteria.
Searching by attributes is only available from Keycloak > 15

**` -- @parameters -- `**
 - filter is a JSON object that accepts filter parameters, such as { email: 'test@keycloak.org' }
```js
const KeycloakManager = require('keycloak-api-manager');
 // Return the total number of registered users
const user_count = await KeycloakManager.users.count();
console.log('User found:', user_count);

// Return the number of users with the name "John" 
user_count = await KeycloakManager.users.count({name:'Jhon'});
console.log('User found:', user_count);
 ```


##### `function update(searchParams,userRepresentation)`
update method is used to update the details of a specific user in a Keycloak realm.
It requires at least the user’s ID(searchParams) and the updated data(userRepresentation). 
You can modify fields like firstName, lastName, email, enabled, and more.

**` -- @parameters -- `**
 - searchParams: is a JSON object that accepts filter parameters
   - id: [Required] the user ID to update
   - realm [Optional] the realm name (defaults to current realm)
 - userRepresentation: An object containing the user fields to be updated.
```js
const KeycloakManager = require('keycloak-api-manager');
 // Update user with id:'user-id'
const user_count = await KeycloakManager.users.update({ id: 'user-Id' }, {
    firstName: 'John',
    lastName: 'Updated',
    enabled: true,
});
 ```

##### `function resetPassword(newCredentialsParameters)`
resetPassword method is used to set a new password for a specific user. 
This action replaces the user's existing credentials. You can also set whether the user is required to 
change the password on next login.

**` -- @parameters -- `**
 - newCredentialsParameters: is a JSON object that accepts filter parameters
   - id: [Required] the user ID to update
   - realm [Optional] the realm name (defaults to current realm)
   - credential: An object containing the new user credentials
     - temporary: true or false. Whether the new password is temporary (forces user to reset at next login). 
     - type: a String value set to "password"
     - value: a String containing new password to be set

```js
const KeycloakManager = require('keycloak-api-manager');
 // Update user with id:'user-id'
const user = await KeycloakManager.users.resetPassword({ 
    id: userId,
    credential:{
        temporary: false,
        type: "password",
        value: "test"  
    } 
    });
 ```
##### `function getCredentials(filter)`
getCredentials() method retrieves the list of credentials (e.g., passwords, OTPs, WebAuthn, etc.) 
currently associated with a given user in a specific realm.
This is useful for auditing, checking what types of credentials a user has set up, 
or managing credentials such as password reset, WebAuthn deletion, etc.

**` -- @parameters -- `**
 - getCredentials: is a JSON object that accepts filter parameters
   - id: [Required] the user ID to update
   - realm [Optional] the realm name (defaults to current realm)
```js
const KeycloakManager = require('keycloak-api-manager');
 // get credentials info for user whose id is 'user-id'
const ressult = await KeycloakManager.users.getCredentials({id: 'user-id'});
console.log(ressult);
 ```


##### `function deleteCredential(accountInfo)`
deleteCredential method allows you to delete a specific credential (e.g., password, OTP, WebAuthn, etc.) from a user. 
This is useful when you want to invalidate or remove a credential, forcing the user to reconfigure or reset it.

**` -- @parameters -- `**
 - accountInfo: is a JSON object that accepts this parameters
   - id: [Required] the user ID to update
   - credentialId [Required] the credentils identifier
```js
const KeycloakManager = require('keycloak-api-manager');
 // delete credentials info for user whose id is 'user-id'
const ressult = await KeycloakManager.users.deleteCredential({
    id: 'user-id',
    credentialId: credential.id
});
 ```

##### `function getProfile()`
It is a method  that retrieves the user profile dictionary information. 
This includes basic user details such as username, email, first name,  last name, 
and other attributes associated with the user profile in the Keycloak realm.
```js
const KeycloakManager = require('keycloak-api-manager');
 // Get user profile
 const userProfile = await KeycloakManager.users.getProfile();
 console.log('User profile dicionary:', userProfile);
 ```

##### `function addToGroup(parameters)`
Adds a user to a specific group within the realm.

**` -- @parameters -- `**
- parameters: is a JSON object that accepts this parameters 
  - id [required]: The user ID of the user you want to add to the group. 
  - groupId [required]: The group ID of the group the user should be added to.
```js
const KeycloakManager = require('keycloak-api-manager');
 // create a role name called my-role
 const userGroup = await KeycloakManager.users.addToGroup({
     groupId: 'group-id',
     id: 'user-id',
});
 console.log('User group info:', userGroup);
 ```
##### `function delFromGroup(parameters)`
Removes a user from a specific group in Keycloak.

**` -- @parameters -- `**
- parameters: is a JSON object that accepts this parameters 
  - id [required]: The user ID of the user you want to remove to the group. 
  - groupId [required]: The group ID of the group the user should be removed to.
```js
const KeycloakManager = require('keycloak-api-manager');
 // create a role name called my-role
 const userGroup = await KeycloakManager.users.delFromGroup({
     groupId: 'group-id',
     id: 'user-id',
});
 console.log('User group info:', userGroup);
 ```

##### `function countGroups(filter)`
Retrieves the number of groups that a given user is a member of.

Compatibility note: this method now always returns a number. If the underlying API returns an object with a `count` field, it is normalized internally.

**` -- @parameters -- `**
- filter is a JSON object that accepts filter parameters, such as { id: '' }
  - id: [required] The user ID of the user whose group membership count you want to retrieve.
  - search: [optional] a String containing group name such "cool-group",
```js
const KeycloakManager = require('keycloak-api-manager');
 // Return the total number of user groups
const user_count = await KeycloakManager.users.countGroups({id:'user-id'});
console.log('Groups found:', user_count);

 ```
##### `function listGroups(filter)`
Returns the list of groups that a given user is a member of.

**` -- @parameters -- `**
- filter is a JSON object that accepts filter parameters, such as { id: '' }
  - id: [required] The user ID of the user whose group membership you want to retrieve.
  - search: [optional] a String containing group name such "cool-group",
```js
const KeycloakManager = require('keycloak-api-manager');
 // Return the total number of user groups
const user_count = await KeycloakManager.users.listGroups({id:'user-id'});
console.log('Groups found:', user_count);

 ```


##### `function addRealmRoleMappings(roleMapping)`
Assigns one or more realm-level roles to a user.    
Returns a promise that resolves when the roles are successfully assigned. No return value on success.

**` -- @parameters -- `**
- roleMapping is a JSON object that accepts this parameters:
  - id: [required] The ID of the user to whom the roles will be assigned..
  - roles: [required] An array of role representations to assign. Each role object should contain at least:
    - id: [required] The role Id
    - name: [required] The role Name
```js
const KeycloakManager = require('keycloak-api-manager');
 // Assigns one realm-level role to a user whose ID is 'user-id'.
const user_count = await KeycloakManager.users.addRealmRoleMappings({
    id: 'user-id',
    // at least id and name should appear
    roles: [
        {
            id: 'role-id',
            name: 'role-name'
        },
    ],
});
console.log(`Assigned realm role role-name to user user-id`);
 ```

##### `function delRealmRoleMappings(roleMapping)`
Removes one or more realm-level roles from a specific user.
Only roles that were directly assigned to the user can be removed with this method.
This method does not affect composite roles. It only removes directly assigned realm roles.

**` -- @parameters -- `**
- roleMapping is a JSON object that accepts this parameters:
    - id: [required] The ID of the user to whom the roles will be removed..
    - roles: [required] An array of role representations to remove. Each role object should contain at least:
        - id: [required] The role Id
        - name: [required] The role Name
```js
const KeycloakManager = require('keycloak-api-manager');
 // remove one realm-level role to a user whose ID is 'user-id'.
const roles_remove = await KeycloakManager.users.delRealmRoleMappings({
    id: 'user-id',
    // at least id and name should appear
    roles: [
        {
            id: 'role-id',
            name: 'role-name'
        },
    ],
});
console.log(`realm role role-name to user user-id removed`);
 ```



##### `function listAvailableRealmRoleMappings(filter)`
Retrieves all available realm-level roles that can still be assigned to a specific user.
These are the roles that exist in the realm but have not yet been mapped to the user.

**` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
  - id: [required] The ID of the user for whom to list assignable realm roles.
```js
const KeycloakManager = require('keycloak-api-manager');
 // Get assignable realm-level roles for user 'user-id'.
const available_roles = await KeycloakManager.users.listAvailableRealmRoleMappings({
    id: 'user-id',
});
console.log('Assignable realm-level roles for user user-id',available_roles);
 ```

##### `function listRoleMappings(filter)`
Retrieves all realm-level and client-level roles that are currently assigned to a specific user.

 **` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
  - id: [required] The user ID for which you want to fetch the assigned role mappings.

@return a promise resolving to an object with two main properties:
- realmMappings: array of realm-level roles assigned to the user.
- clientMappings: object containing client roles grouped by client.

```js
const KeycloakManager = require('keycloak-api-manager');
 // Get assigned roles for user 'user-id'.
const roleMappings = await KeycloakManager.users.listRoleMappings({
    id: 'user-id',
});
console.log(`Realm Roles assigned to user-id:`);
roleMappings.realmMappings?.forEach((role) => {
    console.log(`- ${role.name}`);
});

console.log("Client Role Mappings:");
for (const [clientId, mapping] of Object.entries(roleMappings.clientMappings || {})) {
    console.log(`Client: ${clientId}`);
    mapping.mappings.forEach((role) => {
        console.log(`  - ${role.name}`);
    });
}
 ```



##### `function listRealmRoleMappings(filter)`
Retrieves the realm-level roles that are currently assigned to a specific user.
Unlike listRoleMappings, this method focuses only on realm roles and excludes client roles.

 **` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
  - id: [required] The user ID for which you want to fetch the assigned role mappings.

@return a promise resolving to an array of role objects (realm roles)


```js
const KeycloakManager = require('keycloak-api-manager');
 // Get assigned roles for user 'user-id'.
const roleMappings = await KeycloakManager.users.listRealmRoleMappings({
    id: 'user-id',
});
console.log(`Realm roles assigned to user user-id:`);
roleMappings.forEach((role) => {
    console.log(`- ${role.name}`);
});
 ```


##### `function listCompositeRealmRoleMappings(filter)`
Retrieves the list of composite realm-level roles that are effectively assigned to a user.
Composite roles include both directly assigned realm roles and any roles inherited through composite role structures.

 **` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
  - id: [required] The user ID for which you want to fetch the assigned role mappings.

@return a promise resolving to an array of role objects (realm roles)


```js
const KeycloakManager = require('keycloak-api-manager');
 // Get assigned roles for user 'user-id'.
const roleMappings = await KeycloakManager.users.listCompositeRealmRoleMappings({
    id: 'user-id',
});
console.log(`Composite realm roles assigned to user user-id:`);
roleMappings.forEach((role) => {
    console.log(`- ${role.name}`);
});
 ```


##### `function addClientRoleMappings(role_mapping)`
Assigns one or more client-level roles to a user. 
This method adds role mappings from a specific client to the given user,
allowing the user to have permissions defined by those client roles.

 **` -- @parameters -- `**
- role_mapping is a JSON object that accepts this parameters:
  - id: [required] The ID of the user to whom roles will be assigned. 
  - clientUniqueId:[required] The internal ID of the client that owns the roles.
  - roles: [required] Array of role objects representing the client roles to assign, at least id and name should appear:
    - id:[required]: role identifier
    - name:[required]: role name
    - [optional] Other fields

```js
const KeycloakManager = require('keycloak-api-manager');
 // Add client roles for user 'user-id'.
const roleMappings = await KeycloakManager.users.addClientRoleMappings({
    id: 'user-id',
    clientUniqueId: 'internal-client-id',
    
    // at least id and name should appear
    roles: [{
            id: 'role-id',
            name: 'role-name',
    }]
});
 ```

##### `function listAvailableClientRoleMappings(filter)`
Retrieves a list of client roles that are available to be assigned to a specific user,
meaning roles defined in a client that the user does not yet have assigned. 
This is useful for determining which roles can still be mapped to the user.

 **` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
  - id: [required] The ID of the user
  - clientUniqueId:[required] The internal ID of the client (not the clientId string)
```js
const KeycloakManager = require('keycloak-api-manager');

// Get all user 'user-id' available roles for client 'internal-client-id'
const availableRoles = await KeycloakManager.users.listAvailableClientRoleMappings({
    id: 'user-id',
    clientUniqueId: 'internal-client-id'
 });
 console.log('Available roles for assignment:', availableRoles.map(r => r.name));
 ```



##### `function listCompositeClientRoleMappings(filter)`
Retrieves all composite roles assigned to a specific user for a given client. 
Composite roles are roles that include other roles. 
This method returns not only directly assigned roles, but also roles inherited through composite definitions for that client.

 **` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
  - id: [required] The ID of the user
  - clientUniqueId:[required] The internal ID of the client (not the clientId string)
```js
const KeycloakManager = require('keycloak-api-manager');

 // Get all composite roles assigned to a  user 'user-id' for client 'internal-client-id'
const availableRoles = await KeycloakManager.users.listCompositeClientRoleMappings({
    id: 'user-id',
    clientUniqueId: 'internal-client-id'
 });
 console.log('Available composite roles:', availableRoles.map(r => r.name));
 ```



##### `function listClientRoleMappings(filter)`
Retrieves all client-level roles directly assigned to a user for a specific client.
Unlike composite role mappings, this method only returns the roles that were explicitly 
assigned to the user from the client, without including roles inherited via composite definitions.

 **` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
  - id: [required] The ID of the user
  - clientUniqueId:[required] The internal ID of the client (not the clientId string)
```js
const KeycloakManager = require('keycloak-api-manager');

 // Get all roles assigned to a  user 'user-id' for client 'internal-client-id'
const availableRoles = await KeycloakManager.users.listClientRoleMappings({
    id: 'user-id',
    clientUniqueId: 'internal-client-id'
 });
 console.log('Available roles:', availableRoles.map(r => r.name));
 ```


##### `function delClientRoleMappings(filter)`
Removes one or more client-level roles previously assigned to a specific user. 
This operation unlinks the direct association between the user and the specified roles within the given client.

 **` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
  - id: [required] The ID of the user to whom roles will be removed.
  - clientUniqueId:[required] The internal ID of the client that owns the roles.
  - roles: [required] Array of role objects representing the client roles to assign, at least id and name should appear:
      - id:[required]: role identifier
      - name:[required]: role name
      - [optional] Other fields
```js
const KeycloakManager = require('keycloak-api-manager');

 // Get all roles assigned to a  user 'user-id' for client 'internal-client-id'
await KeycloakManager.users.delClientRoleMappings({
    id: 'user-id',
     clientUniqueId: 'internal-client-id',
     roles: [{
         id: 'role-id',
        name: 'role-name',
     }],
 });
 console.log('Roles successfully removed from user.');
 ```



##### `function listSessions(filter)`
Retrieves a list of active user sessions for the specified user. 
Each session represents a login session associated with that user across different clients or devices.

 **` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
  - id: [required] The ID of the user whose sessions will be listed.
  - clientId: [optional] The internal ID of the client that owns the roles.
```js
const KeycloakManager = require('keycloak-api-manager');

 // Get all the user 'user-id' sessions.
const sessions=await KeycloakManager.users.listSessions({
    id: 'user-id',
 });
 console.log("User 'user-id' sessions:",sessions);
 ```



##### `function listOfflineSessions(filter)`
Retrieves a list of offline sessions for the specified user. 
Offline sessions represent long-lived refresh tokens that allow clients to obtain new access tokens 
without requiring the user to be actively logged in.

Compatibility note: when `clientId` is provided as the public client identifier, the library resolves it to the internal client UUID before querying offline sessions.

 **` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
  - id: [required] The ID of the user whose sessions will be listeds
  - clientId: [optional] The client ID whose sessions are being checked
```js
const KeycloakManager = require('keycloak-api-manager');

 // Get all the user 'user-id' sessions.
const sessions=await KeycloakManager.users.listOfflineSessions({ 
    id: 'user-id', 
    clientId: 'client-id' 
});
 console.log("User 'user-id' offline sessions:",sessions);
 ```



##### `function logout(filter)`
Forces logout of the specified user from all active sessions, both online and offline. 
This invalidates the user’s active sessions and tokens, effectively logging them out from all clients

 **` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
  - id: [required] The ID of the user whose sessions will be closed
```js
const KeycloakManager = require('keycloak-api-manager');

 // Get all the user 'user-id' sessions.
const sessions=await KeycloakManager.users.logout({ 
    id: 'user-id',
});
 console.log('All User session closed');
 ```


##### `function listConsents(filter)`
Retrieves the list of OAuth2 client consents that the specified user has granted.
Each consent represents a client application that the user has authorized to access their data with specific scopes.

 **` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
  - id: [required] The ID of the user whose client consents can be retrieved.
```js
const KeycloakManager = require('keycloak-api-manager');

 // Retrieves the list of OAuth2 client consents that the specified user has granted.
const listConsents=await KeycloakManager.users.listConsents({ 
    id: 'user-id',
});
 console.log('All User consents:',listConsents);
 ```



##### `function revokeConsent(filter)`
Revokes a previously granted OAuth2 client consent for a specific user. 
This operation removes the authorization a user has given to a client, 
effectively disconnecting the client from the user's account and invalidating associated tokens.

**` -- @parameters -- `**

- filter is a JSON object that accepts this parameters:
    - id: [required] The ID of the user whose consent should be revoked
    - clientId: TThe client ID for which the consent should be revoked
```js
const KeycloakManager = require('keycloak-api-manager');

 // Retrieves the list of OAuth2 client consents that the specified user has granted.
await KeycloakManager.users.revokeConsent({
    id: 'user-id',
    clientId: 'client-id',
 });
 ```



##### `function impersonation(filter)`
Initiates an impersonation session for a specific user.
This allows an administrator to act on behalf of the user, gaining access as if they were logged in as that user. 
This is typically used for debugging or support purposes.
Returns an object containing a redirect URL or token used to impersonate the user.

**` -- @parameters -- `**

- filter is a JSON object that accepts this parameters:
    - id: [required] The ID of the user to impersonate.
```js
const KeycloakManager = require('keycloak-api-manager');

 // Impersonate a user whose id is 'user-id'
await KeycloakManager.users.impersonation({id: 'user-id'},{
        user: 'user-id', 
        realm: 'realmeName' 
});
 ```


##### `function listFederatedIdentities(filter)`
Retrieves a list of federated identities (external identity providers) associated with a specific user. 
This is useful if the user has linked their account with external providers like Google, Facebook, etc.

**` -- @parameters -- `**

- filter is a JSON object that accepts this parameters:
    - id: [required] The unique ID of the user for whom you want to fetch the federated identities.
```js
const KeycloakManager = require('keycloak-api-manager');

 // This will return a list of all identity providers that the user has linked to their Keycloak account.
const federatedIdentities= await KeycloakManager.users.listFederatedIdentities({id: 'user-id'});
console.log("Federated Identities:", federatedIdentities);
 ```


##### `function addToFederatedIdentity(options)`
Adds (links) an external identity provider to a specific Keycloak user.
This is typically used to associate a federated identity (such as a Google or Facebook account) with an existing Keycloak user.

**` -- @parameters -- `**

- options is a JSON object that accepts this parameters:
    - id: [required] The ID of the Keycloak user to whom the federated identity should be added.
    - federatedIdentityId: [required] The alias of the identity provider (e.g., "google" or "facebook"). 
    - federatedIdentity [required] An object with the following fields:
      - identityProvider:[required] The alias of the identity provider. 
      - userId: [required] The ID of the user in the external identity provider. 
      - userName: [required] The username in the external identity provider.
```js
const KeycloakManager = require('keycloak-api-manager');

 // Add user whose id is 'user-id' to a deferated 'federatedIdentity-Id' 
 const federatedIdentity = {
     identityProvider: "federatedIdentity-Id",
     userId: "user-id",
     userName: "username",
 };
await KeycloakManager.users.addToFederatedIdentity({
    id: 'user-id',
    federatedIdentityId: "federatedIdentity-Id",
    federatedIdentity:federatedIdentity,
 });
 ```


##### `function delFromFederatedIdentity(options)`
Removes (unlinks) a federated identity provider from a specific Keycloak user. 
This operation dissociates the external identity (e.g., a Google or Facebook account) previously linked to the user.

**` -- @parameters -- `**

- options is a JSON object that accepts this parameters:
    - id: [required] The ID of the Keycloak user from whom the federated identity should be removed.
    - federatedIdentityId: [required] The alias of the identity provider (e.g., "google" or "facebook").
```js
const KeycloakManager = require('keycloak-api-manager');

 // Remove a user whose id is 'user-id' from federated 'federatedIdentity-Id'
 await KeycloakManager.users.delFromFederatedIdentity({
    id: 'user-id',
    federatedIdentityId: "federatedIdentity-Id",
 });
 ```


##### `function getUserStorageCredentialTypes(filter)`
Retrieves configured user-storage credential types for a specific user.

**` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
        - id: [required] The unique ID of the user.
        - realm: [optional] The realm name.

```js
const KeycloakManager = require('keycloak-api-manager');

const types = await KeycloakManager.users.getUserStorageCredentialTypes({
    id: 'user-id',
});
console.log('Configured credential types:', types);
```

##### `function updateCredentialLabel(filter,label)`
Updates the label of a specific credential for a user.

**` -- @parameters -- `**
- filter is a JSON object that accepts this parameters:
        - id: [required] The unique ID of the user.
        - credentialId: [required] The unique ID of the credential.
        - realm: [optional] The realm name.
- label: [required] String label to assign to the credential.

```js
const KeycloakManager = require('keycloak-api-manager');

await KeycloakManager.users.updateCredentialLabel(
    { id: 'user-id', credentialId: 'credential-id' },
    'My Credential Label'
);
```



### `entity clients`
Clients entity provides a set of methods to manage clients (i.e., applications or services) within a realm. 
Clients represent entities that want to interact with Keycloak for authentication or authorization (e.g., web apps, APIs).


#### `entity clients functions`

##### `function create(client_dictionary)`
Creates a new client with the provided configuration

**` -- @parameters -- `**
- client_dictionary:  An object(JSON) of type ClientRepresentation, containing the configuration for the new client.
    - clientId: [required] string	The unique identifier for the client (required). 
    - name:	[required] string	A human-readable name for the client. 
    - enabled: [optional]	boolean	Whether the client is enabled. Default is true. 
    - publicClient:	[optional] boolean	Whether the client is public (no secret). 
    - secret:	[optional] string	Client secret (if not a public client). 
    - redirectUris:	[optional] string[]	List of allowed redirect URIs (for browser-based clients). 
    - baseUrl:	[optional] string	Base URL of the client. 
    - protocol:	[optional] string	Protocol to use (openid-connect, saml, etc.). 
    - standardFlowEnabled:	[optional] boolean	Enables standard OAuth2 Authorization Code Flow. 
    - ....[optional] Other client fields 

```js
const KeycloakManager = require('keycloak-api-manager');
 // create a client called my-client
 const client= await KeycloakManager.clients.create({
    name: "my-client",
    clientId:"client-id"
 });
console.log("New Client Created:", client);
 ```


##### `function find(filter)`
Retrieves a list of all clients in the current realm, optionally filtered by query parameters. 
This method is useful for listing all registered applications or services in Keycloak or searching 
for a specific one using filters like clientId.

**` -- @parameters -- `**
- filter: A JSON structure used to filter results based on specific fields:
  - clientId: [optional] string filter to search clients by their clientId. 
  - viewableOnly: [optional] boolean value.	If true, returns only clients that the current user is allowed to view. 
  - first:[optional] Pagination: index of the first result to return. 
  - max:[optional]	Pagination: maximum number of results to return.
```js
const KeycloakManager = require('keycloak-api-manager');
 // Get client by ID: 'client-id'
const clients= await KeycloakManager.clients.find({ clientId:"client-id"});
console.log("Clients:", clients);
 ```

##### `function findOne(filter)`
Retrieves detailed information about a specific client within a realm by its unique client ID. 
This method fetches the client’s configuration, including its settings, roles, protocols, and other metadata.

**` -- @parameters -- `**
- filter: A JSON structure used to filter results based on specific fields:
  - id: [optional] 	The unique identifier of the client to retrieve
```js
const KeycloakManager = require('keycloak-api-manager');
 // Get client by ID: 'client-id'
const clients= await KeycloakManager.clients.findOne({ id:"client-id"});
console.log("Clients:", clients);
 ```


##### `function del(filter)`
Deletes a client from the realm using its internal ID. 
This operation is irreversible and will remove the client and all its associated roles, permissions, and configurations.

**` -- @parameters -- `**
- filter: A JSON structure used to filter results based on specific fields:
  - id: [required] The internal ID of the client to delete (not clientId)
```js
const KeycloakManager = require('keycloak-api-manager');
 // delete client by ID: 'internal-client-id'
const clients= await KeycloakManager.clients.del({ id:"internal-client-id"});
console.log(`Client successfully deleted.`);
 ```


##### `function update(filter,clientRepresentation)`
Updates the configuration of an existing client in the realm. 
You can modify various attributes such as the client name, redirect URIs, protocol, access type, and more.

**` -- @parameters -- `**
- filter: A JSON structure used to filter results based on specific fields:
  - id: [required] The unique ID of the client you want to update
- clientRepresentation: [required] The new configuration for the client
```js
const KeycloakManager = require('keycloak-api-manager');
 // update single client
await KeycloakManager.clients.update(
    { id:"internal-client-id"},
    {
        // clientId is required in client update
        clientId:'client-id',
        description: "test",
    }
);
console.log(`Client successfully updated.`);
 ```




##### `function createRole(role_parameters)`
Creates a new client role under a specific client. 
Client roles are roles associated with a specific client (application), and are useful 
for fine-grained access control within that client.

**` -- @parameters -- `**
- role_parameters: JSON structure that defines the role like:
    - id: [required] The internal ID of the client where the role will be created. 
    - name: [required] Name of the new role. 
    - description: [optional] Optional description of the role.
    - [optional] Other role fields
```js
const KeycloakManager = require('keycloak-api-manager');
 // Creates a new client role under a specific client.
const role= await KeycloakManager.clients.createRole({
    id: 'client-id',
    name: 'roleName'
});
console.log("Client role:", role);
 ```




##### `function findRole(filter)`
Retrieves a specific client role by name from a given client. 
This is useful when you want to inspect or verify the properties of a role defined within a particular client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not the clientId string) where the role is defined.
    - roleName: [required] The name of the client role you want to find.

```js
const KeycloakManager = require('keycloak-api-manager');
 // Get client role by ID: 'internal-client-id'
const role= await KeycloakManager.clients.findRole({
    id: 'internal-client-id',
    roleName:'roleName'
});
console.log("Client role:", role);
 ```


##### `function updateRole(filter,roleRepresentation)`
Updates the attributes of a specific client role in Keycloak. 
This includes changing the role's name, description, or any associated metadata.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not the clientId string) where the role is defined.
    - roleName: [required] The name of the client role you want to update
- roleRepresentation: [required] An object with the updated properties of the role
```js
const KeycloakManager = require('keycloak-api-manager');
 // update the client role
await KeycloakManager.clients.updateRole(
    { id: 'internal-client-id',  roleName:'roleName'},
    {
        name: 'newName',
        description: "test",
    }
);
```



##### `function delRole(filter)`
Deletes a client role by its name for a specific client.
This permanently removes the role from the specified client in Keycloak.
A promise that resolves to void if the deletion is successful. 
If the role does not exist or the operation fails, an error will be thrown.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not the clientId string) where the role is defined.
    - roleName: [required] The name of the client role you want to delete.

```js
const KeycloakManager = require('keycloak-api-manager');
 // delere client role by ID: 'internal-client-id'
const role= await KeycloakManager.clients.delRole({
    id: 'internal-client-id',
    roleName:'roleName'
});
 ```


##### `function listRoles(filter)`
Retrieves all roles defined for a specific client within the realm. 
These roles can be used to assign permissions to users or groups for the specific client application.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not clientId)

```js
const KeycloakManager = require('keycloak-api-manager');
 // list the client role
const roles= await KeycloakManager.clients.listRoles({
    id: 'internal-client-id'
});
console.log("Client roles:", roles);
 ```


##### `function getClientSecret(filter)`
Retrieves the client secret associated with a confidential client in Keycloak. 
This is typically used for clients using client_credentials or authorization_code flows where the secret is required to authenticate the client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not clientId)

```js
const KeycloakManager = require('keycloak-api-manager');
 // get client secret
const secret= await KeycloakManager.clients.getClientSecret({
    id: 'internal-client-id'
});
console.log("Client secret:", secret);
 ```



##### `function generateNewClientSecret(filter)`
Generates a new client secret for a confidential client in Keycloak. This will overwrite the existing secret and return the newly generated one. 
It is useful when rotating credentials or recovering access.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not clientId)

```js
const KeycloakManager = require('keycloak-api-manager');
 // generate new client secret
const secret= await KeycloakManager.clients.generateNewClientSecret({
    id: 'internal-client-id'
});

console.log("New client secret:", secret.value);
 ```


##### `function generateRegistrationAccessToken(filter)`
Generates a new registration access token for a client. This token allows the client to make authorized requests to the client registration REST API. 
It’s particularly useful in dynamic client registration workflows or when automating client updates via external systems.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not clientId)

```js
const KeycloakManager = require('keycloak-api-manager');
 // generate new registration access token
const result= await KeycloakManager.clients.generateRegistrationAccessToken({
    id: 'internal-client-id'
});

console.log("New registration access token:", result.registrationAccessToken);
 ```


##### `function invalidateSecret(filter)`
Invalidates (revokes) the current client secret, making it no longer valid. 
After invalidation, the client will no longer be able to authenticate using the old secret and a new secret should be generated.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not clientId)

```js
const KeycloakManager = require('keycloak-api-manager');
 // invalidate rotation token
await KeycloakManager.clients.invalidateSecret({
    id: 'internal-client-id'
});
console.log("Client secret invalidated successfully.");
```



##### `function getInstallationProviders(filter)`
Retrieves a list of available installation providers for a specific client. 
Installation providers define how client configuration can be exported or installed, 
for example as a JSON file, Keycloak XML adapter config, or other formats supported by Keycloak.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not clientId)

Return an array of installation provider objects, each representing a supported installation format for the client.
```js
const KeycloakManager = require('keycloak-api-manager');
 // get installation providers
const providers = await KeycloakManager.clients.getInstallationProviders({
    id: 'internal-client-id'
});
console.log("Available installation providers:", providers);
```


##### `function listPolicyProviders(filter)`
The method retrieves the list of available policy providers for a client’s resource server.
Policy providers define the logic used to evaluate authorization decisions (e.g., role-based, group-based, time-based, JavaScript rules).
This method allows you to see which policy types are supported and available to be created for a given client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client (resource server) for which to list available policy providers.

```js
const KeycloakManager = require('keycloak-api-manager');
 // get installation providers
const providers = await KeycloakManager.clients.listPolicyProviders({
    id: 'internal-client-id'
});
console.log("Available policy providers:", providers);
```



##### `function getServiceAccountUser(filter)`
Retrieves the service account user associated with a specific client. 
In Keycloak, clients configured as service accounts have a corresponding user representing them, 
which can be used for token-based access and permissions management.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not clientId)

Return an object representing the user linked to the client's service account, 
including details such as user ID, username, email, and other user attributes.
```js
const KeycloakManager = require('keycloak-api-manager');
 // get service account user
const serviceAccountUser = await KeycloakManager.clients.getServiceAccountUser({
    id: 'internal-client-id'
});
console.log("Service Account User:", serviceAccountUser);
```


##### `function addDefaultClientScope(filter)`
The method is used to associate a client scope as a default scope for a specific client. 
Default scopes are automatically included in tokens issued to the client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not clientId) 
    - clientScopeId: [required] The ID of the client scope you want to add as a default scope.

```js
const KeycloakManager = require('keycloak-api-manager');
 // add default client scope
 await KeycloakManager.clients.addDefaultClientScope({
    id: 'internal-client-id',
    clientScopeId:'client-scope-id'
});
```


##### `function delDefaultClientScope(filter)`
This function detaches a default client scope (either default or optional) from a client. 
Default scopes are automatically assigned to tokens issued for the client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not clientId) 
    - clientScopeId: [required]  The ID of the client scope to be removed.

```js
const KeycloakManager = require('keycloak-api-manager');
 // cleanup default scopes
 await KeycloakManager.clients.delDefaultClientScope({
    id: 'internal-client-id',
    clientScopeId:'client-scope-id'
});
```

##### `function delOptionalClientScope(filter)`
The method is used to remove an optional client scope from a specific client. 
Optional client scopes are those that are not automatically assigned to clients but can be requested during authentication.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client (not clientId) 
    - clientScopeId: [required]  The ID of the client scope you want to unlink from the client.

```js
const KeycloakManager = require('keycloak-api-manager');
 // cleanup default scopes
 await KeycloakManager.clients.delOptionalClientScope({
    id: 'internal-client-id',
    clientScopeId:'client-scope-id'
});
```


##### `function listDefaultClientScopes(filter)`
This method lists those default scopes for a given client.
Default client scopes are automatically assigned to a client during token requests (e.g., openid, profile).

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client whose default client scopes you want to list.

```js
const KeycloakManager = require('keycloak-api-manager');
 // list default client scopes
const defaultScopes = await KeycloakManager.clients.listDefaultClientScopes({
    id: 'internal-client-id',
});
console.log("Default Clients Scopes:",defaultScopes);
```




##### `function listOptionalClientScopes(filter)`
The method is used to retrieve all optional client scopes currently assigned to a specific client. 
Optional scopes are those that a client can request explicitly but are not automatically applied.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client whose optional client scopes you want to list.

```js
const KeycloakManager = require('keycloak-api-manager');
 // list optional client scopes
const optionalScopes = await KeycloakManager.clients.listOptionalClientScopes({
    id: 'internal-client-id',
});
console.log("Optional Clients Scopes:",optionalScopes);
```


##### `function addOptionalClientScope(filter)`
The method is used to assign an optional client scope to a specific client. 
Optional scopes are not automatically applied during login unless explicitly requested by the client in the scope parameter.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal client ID of the client
    - clientScopeId: [required] The ID of the client scope you want to assign as optional.

```js
const KeycloakManager = require('keycloak-api-manager');
 // add optional client scope
await KeycloakManager.clients.addOptionalClientScope({
    id: 'internal-client-id',
    clientScopeId: 'scope-id',
});
```


##### `function clients.listScopeMappings(filter)`
This method is used to list all scope mappings (roles assigned via scopes) for a given client in Keycloak.
This includes realm-level roles and client-level roles that are mapped to the client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client whose scope mappings you want to list.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// get 'internal-client-id' scope mapping
const scopeMappings = await KeycloakManager.clients.listScopeMappings({
    id: 'internal-client-id'
});

console.log("Scope mappings:", scopeMappings);

```



##### `function clients.listAvailableClientScopeMappings(filter)`
The method is used to list the client roles that are available to be mapped (but not yet assigned) to a specific client in Keycloak.
This helps you discover which client roles you can still add as scope mappings.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the target client (the one receiving the scope mappings). 
    - client: [required] The client ID of the source client (the one that owns the roles to be mapped).

```js
const KeycloakManager = require('keycloak-api-manager');
 
// get 'internal-client-id' available roles to be mapped
const availableRoles = await KeycloakManager.clients.listAvailableClientScopeMappings({
    id: 'internal-client-id',
    client: 'internal-client-id',
});

console.log("Available roles to be mapped:", availableRoles);

```

##### `function clients.addClientScopeMappings(filter)`
The method is used to assign client roles (from a source client) to another client as scope mappings.
This means the target client will inherit these roles when requesting tokens.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the target client (the one receiving the scope mappings). 
    - client: [required] The client ID of the source client (the one that owns the roles to be mapped).
- roles: [required] An array of role representations(RoleRepresentation) to be mapped. At minimum, each role needs its id and name.
  - id: [required] The role ID
  - name: [required] The role name
  - ... other RoleRepresentation fields 


```js
const KeycloakManager = require('keycloak-api-manager');
 
// map available roles
await KeycloakManager.clients.addClientScopeMappings({
    id: 'internal-client-id',        // Target client
    client: "my-source-client-id",   // Source client
    },
    [
        {
            id: "role-1234",
            name: "manage-users",
        },
        {
            id: "role-5678",
            name: "view-reports",
        },
    ]
);

console.log("Roles successfully mapped to client!");

```


##### `function clients.listClientScopeMappings(filter)`
The method is used to list all client role mappings assigned to a client.
It shows which roles from another client (source) are already mapped to the target client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the target client (where roles are mapped)
    - client: [required] The ID of the source client (the one that owns the roles being mapped)


```js
const KeycloakManager = require('keycloak-api-manager');
 
// list assigned role mappings
const assignedRoles = await KeycloakManager.clients.listClientScopeMappings({
    id: 'internal-client-id',    // Target client
    client: "my-source-client",  // Source client
});

console.log("Mapped roles:", assignedRoles);

```

##### `function clients.listCompositeClientScopeMappings(filter)`
The method is used to list both direct and composite (inherited) client role mappings that are assigned to a target client.
It differs from listClientScopeMappings because it expands composite roles and shows all roles that are effectively available to the client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the target client (the one receiving the mappings)
    - client: [required] The ID of the source client (the one that owns the roles)

```js
const KeycloakManager = require('keycloak-api-manager');
 
// list effective (composite) role mappings
const effectiveRoles = await KeycloakManager.clients.listCompositeClientScopeMappings({
    id: 'internal-client-id',    // Target client
    client: "my-source-client",  // Source client
});

console.log("Effective (composite) role mappings:", effectiveRoles);

```


##### `function clients.delClientScopeMappings(filter)`
The method is used to remove one or more client role mappings from a target client.
It is the reverse of clients.addClientScopeMappings

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] ID of the target client (the client losing the roles)
    - client: [required] ID of the source client (the client where the roles are defined)
    - roles: [required] array of RoleRepresentation roles to remove. Each role needs at least id or name
      - id: [required] The role ID 
      - name: [required] The role name 
      - ... other RoleRepresentation fields


```js
const KeycloakManager = require('keycloak-api-manager');
 
// Rremove roles from client mappings
await KeycloakManager.clients.delClientScopeMappings({
    id: 'internal-client-id',     // Target client
    client: "my-source-client",   // Source client
    roles: [
        { name: "custom-role" },
        { name: "viewer-role" },
    ],
});

console.log("Roles removed from client mappings");


```


##### `function clients.listAvailableRealmScopeMappings(filter)`
The method is used to retrieve all realm-level roles that are available to be assigned to a specific client. 
These are roles defined at the realm level that the client does not yet have mapped, allowing you to see what can be added.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client for which you want to list available realm-level role mappings.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// Get available realm roles for client
const availableRealmRoles = await KeycloakManager.clients.listAvailableRealmScopeMappings({
    id: 'internal-client-id',
});

console.log("Available realm roles for client:", availableRealmRoles);

```

##### `function clients.listAvailableRealmScopeMappings(filter)`
The method is used to retrieve all realm-level roles that are available to be assigned to a specific client. 
These are roles defined at the realm level that the client does not yet have mapped, allowing you to see what can be added.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client for which you want to list available realm-level role mappings.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// Get available realm roles for client
const availableRealmRoles = await KeycloakManager.clients.listAvailableRealmScopeMappings({
    id: 'internal-client-id',
});

console.log("Available realm roles for client:", availableRealmRoles);

```


##### `function clients.listRealmScopeMappings(filter)`
The method retrieves the realm-level roles currently assigned to a client as part of its scope mappings.
This shows which realm roles the client is allowed to request on behalf of users.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The client ID whose realm-level scope mappings you want to list

```js
const KeycloakManager = require('keycloak-api-manager');
 
// Get mapped realm roles for client
const roles = await KeycloakManager.clients.listRealmScopeMappings({
    id: 'internal-client-id',
});

console.log("Realm roles mapped to client:", roles.map(r => r.name));

```

##### `function clients.listCompositeRealmScopeMappings(filter)`
The method retrieves all composite realm-level roles associated with a client through its scope mappings.
This includes not only the roles directly mapped to the client, but also roles inherited through composite roles.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The client ID whose composite realm scope mappings you want to list

```js
const KeycloakManager = require('keycloak-api-manager');
 
// Get mapped realm composite roles for client
const roles = await KeycloakManager.clients.listCompositeRealmScopeMappings({
    id: 'internal-client-id',
});

console.log("Realm composite roles mapped to client:", roles.map(r => r.name));

```


##### `function clients.addRealmScopeMappings(filter,roles)`
The method is used to assign realm-level role mappings to a specific client.
This effectively grants the client access to the specified realm roles.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The client ID that will receive the new realm-level role mappings.
- roles: [required] An array of realm roles to be mapped to the client. Each role object typically contains at least id and name 
  
```js
const KeycloakManager = require('keycloak-api-manager');
 
// Add Realm scope mappings
await KeycloakManager.clients.addRealmScopeMappings(
    {id:'internal-client-id'},
    [{id:'role1_id'},{id:'role1_id'}]
);

```

##### `function clients.delRealmScopeMappings(filter,roles)`
The method removes realm-level roles from a client’s scope mappings.
This is the opposite of clients.addRealmScopeMappings.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The client ID whose realm role mapping must be removed.
- roles: [required] An array of role objects you want to remove. Each role object must at least contain the id or name field.
  
```js
const KeycloakManager = require('keycloak-api-manager');
 
// remove Realm scope mappings
await KeycloakManager.clients.delRealmScopeMappings(
    {id:'internal-client-id'},
    [{id:'role1_id'},{id:'role1_id'}]
);

```

##### `function clients.listSessions(filter)`
The method retrieves active user sessions for a specific client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The client ID whose session must be retrieved 
    - first:[optional] pagination field. First result index for pagination. 
    - max: [optional] pagination field. Maximum number of results.
  
```js
const KeycloakManager = require('keycloak-api-manager');
 
// get client sessions
const sessions = await KeycloakManager.clients.listSessions({
    id: 'internal-client-id',
    first: 0,
    max: 20,
});

console.log(`Found ${sessions.length} active sessions for client`);
sessions.forEach(s =>
    console.log(`User: ${s.username}, IP: ${s.ipAddress}, Started: ${new Date(s.start)}`)
);

```


##### `function clients.listOfflineSessions(filter)`
The method retrieves offline sessions associated with a given client.
Offline sessions are created when a client uses offline tokens (refresh tokens with offline_access scope)

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The client ID whose session must be retrieved 
    - first:[optional] pagination field. First result index for pagination. 
    - max: [optional] pagination field. Maximum number of results.
  
```js
const KeycloakManager = require('keycloak-api-manager');
 
// get offline sessions
const sessions = await KeycloakManager.clients.listOfflineSessions({
    id: 'internal-client-id',
    first: 0,
    max: 20,
});

console.log(`Found ${sessions.length} active sessions for client`);
sessions.forEach(s =>
    console.log(`User: ${s.username}, IP: ${s.ipAddress}, Started: ${new Date(s.start)}`)
);

```

##### `function clients.getSessionCount(filter)`
The method retrieves the number of active user sessions for a given client.
This includes online sessions, not offline sessions (those are retrieved with listOfflineSessions).

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The client ID whose session must be retrieved

**` -- @returns -- `**
A number representing the count of active sessions for the specified client.

**` -- @notes -- `**
The return value is automatically normalized to a number. In some Keycloak versions, the API may return an object with a `count` property, but this method handles that internally and always returns the numeric count directly.
  
```js
const KeycloakManager = require('keycloak-api-manager');
 
// count active sessions
const sessionCount = await KeycloakManager.clients.getSessionCount({
    id: 'internal-client-id'
});

console.log(`Client internal-client-id has ${sessionCount} active sessions`);

```

##### `function clients.getOfflineSessionCount(filter)`
The method retrieves the number of offline sessions associated with a given client. 
Offline sessions represent sessions where the user has a valid offline token, typically used for long-lived access 
without requiring active login.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client for which you want to count offline sessions.

**` -- @returns -- `**
A number representing the count of offline sessions for the specified client.

**` -- @notes -- `**
The return value is automatically normalized to a number. In some Keycloak versions, the API may return an object with a `count` property, but this method handles that internally and always returns the numeric count directly.
  
```js
const KeycloakManager = require('keycloak-api-manager');
 
// count offline sessions
const offlineSessionCount = await KeycloakManager.clients.getOfflineSessionCount({
    id: 'internal-client-id'
});

console.log(`Client internal-client-id has ${offlineSessionCount} offline sessions`);

```

##### `function clients.addClusterNode(filter)`
The method is used to register a cluster node for a specific Keycloak client. 
This is relevant in scenarios where you are running Keycloak in a clustered environment and want to synchronize 
client sessions and node information across multiple instances.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client for which you want to add a cluster node. 
    - node: [required] The name or identifier of the cluster node to register.
```js
const KeycloakManager = require('keycloak-api-manager');
 
// Add Cluster Node
await KeycloakManager.clients.addClusterNode({
    id: 'internal-client-id',
    node:'127.0.0.1'
});

```



##### `function clients.deleteClusterNode(filter)`
The method in Keycloak Admin Client is used to remove a previously registered cluster node for a specific client. 
This is useful in clustered environments when a node is no longer active or should be deregistered from the
client session synchronization.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client for which you want to remove a cluster node.
    - node: [required] The name or identifier of the cluster node to remove.
```js
const KeycloakManager = require('keycloak-api-manager');
 
// Add Cluster Node
await KeycloakManager.clients.deleteClusterNode({
    id: 'internal-client-id',
    node:'127.0.0.1'
});

```


##### `function clients.generateAndDownloadKey(filter,config)`
The method is used to generate a new cryptographic key for a client and download it. 
This is typically used for clients that require client credentials, JWT signing, or encryption.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client for which you want to generate the key
    - attr: [required] The name of the client attribute where the generated key will be saved
- config: JSON structure that defines the configuration parameters
  - format: [required] Keystore format. Must be "JKS" or "PKCS12" 
  - keyAlias: [required] Alias of the key in the keystore
  - keyPassword: [required] Password of the key in the keystore
  - storePassword: [required] keystore password
  - realmAlias: [optional] Alias of the realm
  - realmCertificate: [optional] Indicates whether the realm certificate should be added to the keystore. Set to true to include it 
  
```js
const KeycloakManager = require('keycloak-api-manager');
 
// set Configuration
const keystoreConfig = {
    format: "JKS",
    keyAlias: "new",
    keyPassword: "password",
    realmAlias: "master",
    realmCertificate: false,
    storePassword: "password",
};
const attr = "jwt.credential";

// Generate and download Key
const result = await KeycloakManager.clients.generateAndDownloadKey(
    { id: internal-client-id, attr },
    keystoreConfig,
);

// save to file 
fs.writeFileSync('client-keystore.jks', Buffer.from(result));
console.log('Keystore saved ad client-keystore.jks');


```


##### `function clients.generateKey(filter)`
The method is used to generate a new cryptographic key for a client without automatically downloading it. 
This is useful for creating new signing or encryption keys associated with a client directly within Keycloak.
Unlike clients.generateAndDownloadKey, this method only generates the key and stores it in Keycloak. It does not return the key material to the caller

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client for which you want to generate the key
    - attr: [required] The name of the client attribute where the generated key will be saved

```js
const KeycloakManager = require('keycloak-api-manager');
 
const attr = "jwt.credential";

// Generate a Key
const result = await KeycloakManager.clients.generateKey(
    { id: internal-client-id, attr }
);

console.log('New RSA key successfully generated for client');


```



##### `function clients.getKeyInfo(filter)`
The method is used to retrieve metadata about the keys associated with a specific client.
It does not return the actual key material but provides information such as the key type, provider, algorithm, and status.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client whose key information should be retrieved
    - attr: [optional] The name of the client attribute to get

```js
const KeycloakManager = require('keycloak-api-manager');
 
const attr = "jwt.credential";

// Get Key Info
const keyInfo = await KeycloakManager.clients.getKeyInfo(
    { id: internal-client-id, attr }
);


console.log("Client key info:", keyInfo);


```


##### `function clients.downloadKey(filter,config)`
The method Downloads a client’s cryptographic key (certificate) from Keycloak. 
This is typically used when you need to retrieve the public certificate of a client for token validation, signing, or encryption purposes.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client whose key information should be downloaded
    - attr: [optional] Specifies which key/certificate to download. Common values include:
      - "jwt.credential": default JWT signing key.
      - "saml.signing": SAML signing certificate.
      - "rsa-generated": generated RSA key pair. 
- config: JSON structure that defines the configuration parameters
  - format: [required] Keystore format. Must be "JKS" or "PKCS12"
  - keyAlias: [required] Alias of the key in the keystore
  - keyPassword: [required] Password of the key in the keystore
  - storePassword: [required] keystore password
  - realmAlias: [optional] Alias of the realm
  - realmCertificate: [optional] Indicates whether the realm certificate should be added to the keystore. Set to true to include it


```js
const KeycloakManager = require('keycloak-api-manager');

// set Configuration
const keystoreConfig = {
    format: "JKS",
    keyAlias: "new",
    keyPassword: "password",
    realmAlias: "master",
    realmCertificate: false,
    storePassword: "password",
};

const attr = "jwt.credential";

// Generate and Key
const cert = await KeycloakManager.clients.downloadKey(
    { id: internal-client-id, attr },
    keystoreConfig
);


// cert will contain the PEM-encoded certificate or key
console.log(cert);


```



##### `function clients.createAuthorizationScope(filter,scopeRepresentation)`
The method in the Keycloak Admin Client is used to create a new authorization scope for a specific client.
Authorization scopes are part of Keycloak’s Authorization Services and represent fine-grained permissions 
that can later be linked to resources and policies.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] TThe ID of the client for which the scope will be created 
    - scopeRepresentation:[required] The details of the new authorization scope as:
      - name: [required] The unique name of the scope. 
      - displayName: [optional] A human-friendly name for UI purposes 
      - iconUri [optional] A URI pointing to an icon representing the scope
      - ... other scope representation fields

```js
const KeycloakManager = require('keycloak-api-manager');

// createAuthorizationScope
await KeycloakManager.clients.createAuthorizationScope(
    { id: 'internal-client-id' },
    {
        name: "manage-orders",
        displayName: "Manage Orders",
        iconUri: "https://example.com/icons/orders.png"
    });

```


##### `function clients.listAllScopes(filter)`
The method is used to retrieve all available scopes for a specific client.
This includes both default scopes and optional scopes that can be assigned to the client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client whose scopes you want to list
    

```js
const KeycloakManager = require('keycloak-api-manager');

// Get scopes
const scopes= await KeycloakManager.clients.listAllScopes({
    id: 'internal-client-id' 
});

console.log(scopes);

```

##### `function clients.updateAuthorizationScope(filter,AuthorizationScopeRepresentation)`
The method is used to update an existing authorization scope for a specific client. 
Authorization scopes define permissions that can be used in policies and permissions for the client’s resources.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client to which the scope belongs 
    - scopeId [required] The ID of the authorization scope to update
- AuthorizationScopeRepresentation [required]: JSON structure that defines the authorization scope representation update
  - name: The new name of the scope
  - displayName The human-readable name of the scope
  - iconUri Optional URI for an icon representing the scope
  - .. other attributes: Additional attributes for the scope.

```js
const KeycloakManager = require('keycloak-api-manager');

// Update the scope-id authorization scope
const scopes= await KeycloakManager.clients.updateAuthorizationScope(
    {
        id: 'internal-client-id',
        scopeId: 'scope-id'
    },
    {
        name: 'updated-scope-name',
        displayName: 'Updated Scope',
        iconUri: 'https://example.com/icon.png',
    }
);

console.log('Authorization scope updated successfully');

```


##### `function clients.getAuthorizationScope(filter)`
The method is used to retrieve the details of a specific authorization scope associated with a client. 
Authorization scopes define permissions that can be applied to resources and policies in Keycloak.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client to which the scope belongs 
    - scopeId [required] The ID of the authorization scope to retrieve

```js
const KeycloakManager = require('keycloak-api-manager');

// get scope-id authorization scope
const scope= await KeycloakManager.clients.getAuthorizationScope({
    id: 'internal-client-id',
    scopeId: 'scope-id'
});

console.log('Authorization scope details:', scope);

```

##### `function clients.listAllResourcesByScope(filter)`
The method is used to retrieve all resources associated with a specific authorization scope for a given client. 
This allows you to see which resources are governed by a particular scope in the client’s authorization settings.

Compatibility note: this method uses a direct Keycloak Admin REST API call internally to avoid known normalization issues from `@keycloak/keycloak-admin-client` in some environments.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client to which the scope belongs 
    - scopeId [required] The ID of the authorization scope whose associated resources you want to list.

```js
const KeycloakManager = require('keycloak-api-manager');

// List all resources by scope
const resources= await KeycloakManager.clients.listAllResourcesByScope({
    id: 'internal-client-id',
    scopeId: 'scope-id'
});

console.log('Resources associated with this scope:', resources);

```


##### `function clients.listAllPermissionsByScope(filter)`
The method is used to retrieve all permissions associated with a specific authorization scope for a given client. 
This is helpful for understanding which permissions (policies and rules) are applied when a particular scope is used.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client to query 
    - scopeId [required] The ID of the authorization scope whose associated permissions you want to list

```js
const KeycloakManager = require('keycloak-api-manager');

// list all permissions by scope
const permissions= await KeycloakManager.clients.listAllPermissionsByScope({
    id: 'internal-client-id',
    scopeId: 'scope-id'
});


console.log('Permissions associated with this scope:', permissions);

```



##### `function clients.listPermissionScope(filter)`
The method is used to retrieve all scopes associated with a specific permission for a given client. 
This allows you to see which scopes a permission controls, helping you manage fine-grained access rules 
in Keycloak’s Authorization Services (UMA 2.0) framework.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client whose permission scopes you want to list
    - permissionId [optional] The ID of the permission whose scopes should be retrieved
    - name: [optional] The name of the permission whose scopes should be retrieved

```js
const KeycloakManager = require('keycloak-api-manager');

// List permission scope
const permissionScopes= await KeycloakManager.clients.listPermissionScope({
        id: 'internal-client-id',
        name: "scope",
});


console.log('Permission Scopes:', permissionScopes);

```



##### `function clients.importResource(filter,resource)`
The method is used to import a resource into a client. 
This is part of Keycloak’s Authorization Services (UMA 2.0) and allows you to programmatically define 
resources that a client can protect with policies and permissions.

Compatibility note: this method uses a direct Keycloak Admin REST API call internally to avoid inconsistent responses observed with `@keycloak/keycloak-admin-client` in some environments.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client to which the resource should be imported 
- resource [required]  The resource representation object. This typically includes attributes like name, uris, type, scopes, and other Keycloak resource configuration options.

```js
const KeycloakManager = require('keycloak-api-manager');

// import resource
await KeycloakManager.clients.importResource(
    {
        id: 'internal-client-id'
    },
    {
        allowRemoteResourceManagement: true,
        policyEnforcementMode: "ENFORCING",
        resources: [],
        policies: [],
        scopes: ['view','edit'],
        decisionStrategy: "UNANIMOUS",
    }
);


console.log('Resource imported successfully');

```


##### `function clients.exportResource(filter)`
The method is used to export a resource from a client. 
This allows you to retrieve the full configuration of a resource, including its URIs, scopes, 
and associated permissions, which can then be backed up, replicated, or modified externally.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client from which to export the resource 
    - resourceId: [optional] The ID of the resource you want to export
  
```js
const KeycloakManager = require('keycloak-api-manager');

// resource export
const exportedResource = await KeycloakManager.clients.exportResource({
        id: 'internal-client-id'
});

console.log('Exported Resource:', exportedResource);

```


##### `function clients.createResource(filter,resourceRepresentation)`
The method is used to create a new resource under a specific client. 
A resource represents a protected entity in Keycloak’s authorization services, such as a REST endpoint,
a document, or any application-specific asset. This allows you to manage fine-grained access control via policies and permissions.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client where the resource will be created
- resourceRepresentation: [required] An object representing the resource configuration. Typical fields defined in https://www.keycloak.org/docs-api/latest/rest-api/index.html#ResourceRepresentation include:
  - name: [required] The human-readable name of the resource. 
  - uris: [optional] Array of URI patterns or paths representing the resource. 
  - scopes: [optional] Array of scopes associated with the resource. 
  - type: [optional] Type/category of the resource. 
  - owner: [optional] Defines the owner of the resource.
  
```js
const KeycloakManager = require('keycloak-api-manager');

// define a resource
const newResource = {
    name: 'Document Service',
    uris: ['/documents/*'],
    scopes: ['read', 'write'],
    type: 'REST',
};
// create resource
const createdResource = await KeycloakManager.clients.createResource(
    {id: 'internal-client-id'},
    newResource
);

console.log('Created Resource:', createdResource);

```

##### `function clients.getResource(filter)`
The method is used to retrieve a specific resource of a client by its ID. 
Resources in Keycloak represent protected entities, such as APIs, documents, or any application-specific assets, 
that can have associated scopes, policies, and permissions for fine-grained access control.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client that owns the resource 
    - resourceId: [required] The ID of the resource you want to retrieve.
```js
const KeycloakManager = require('keycloak-api-manager');

// get resource
const createdResource = await KeycloakManager.clients.getResource({
    id: 'internal-client-id',
    resourceId: '12345-abcde',
});

console.log('Retrieved Resource:', resource);

```

##### `function clients.getResourceServer(filter)`
The method is used to retrieve the resource server settings of a client. 
A resource server in Keycloak represents a client that is enabled with Authorization Services, 
meaning it can define resources, scopes, permissions, and policies for fine-grained access control.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client whose resource server configuration you want to retrieve

```js
const KeycloakManager = require('keycloak-api-manager');

// get resource Server
const resourceServer = await KeycloakManager.clients.getResourceServer({
    id: 'internal-client-id'
});

console.log('Resource Server:', resourceServer);

```

##### `function clients.updateResourceServer(filter,resourceServerRepresentation)`
The method is used to update the configuration of a client’s resource server. 
A resource server defines authorization settings such as resources, scopes, permissions, 
and policies that control fine-grained access to protected assets.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client whose resource server configuration should be updated
- resourceServerRepresentation: [required] An object representing the resource server configuration such as:
  - policyEnforcementMode: [optional] Defines how authorization policies are enforced (ENFORCING, PERMISSIVE, or DISABLED) 
  - decisionStrategy: [optional] The decision strategy for policies (UNANIMOUS, AFFIRMATIVE, or CONSENSUS)
  - Other resource server settings depending on your authorization model (resources, scopes, and permissions)

```js
const KeycloakManager = require('keycloak-api-manager');

//define resource Server
const resourceServerRepresentation={
    policyEnforcementMode: "ENFORCING",
    decisionStrategy: "UNANIMOUS",
}

// update resource Server
await KeycloakManager.clients.updateResourceServer(
    { id: 'internal-client-id' },
    resourceServerRepresentation   
);

console.log("Resource server updated successfully");

```

##### `function clients.listPermissionsByResource(filter)`
The method is used to retrieve all permissions associated with a specific resource within a client’s resource server. 
This is part of the Keycloak Authorization Services API and helps administrators inspect which permissions are linked to a given protected resource.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
  - id: [required] The ID of the client (the resource server). 
  - resourceId: [required] The ID of the resource for which to list permissions.

```js
const KeycloakManager = require('keycloak-api-manager');


// List permissions by resource
const permissions= await KeycloakManager.clients.listPermissionsByResource({ 
    id: 'internal-client-id',
    resourceId: 'resource-id'
});

console.log("Permissions for resource:", permissions);

```

##### `function clients.createPermission(filter,permissionRepresentation)`
The method is used to create a new permission for a client.
Permissions define which users or roles can access specific resources or scopes within the client,
based on policies you configure. This is part of Keycloak’s Authorization Services (UMA 2.0) framework.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client for which the permission will be created
    - type: [required] Type of the permission (resource or scope)
- permissionRepresentation:[required] An object describing the permission. Common fields include:
    - name: [required]  The name of the permission
    - resources: [optional] Array of resource IDs this permission applies to (for resource type)
    - scopes: [optional] Array of scope IDs this permission applies to (for scope type)
    - policies [required] Array of policy IDs associated with this permission

```js
const KeycloakManager = require('keycloak-api-manager');

// create a permission
await KeycloakManager.clients.createPermission({
        id: 'internal-client-id',
        type: "scope",
    },
    {
        name: 'permission.name',
        // @ts-ignore
        resources: ['resource-id'],
        policies: ['policy-id'],
        scopes: ['scope-id1','scope-id2'],
    }
);


console.log('Permission created');

```


##### `function clients.findPermissions(filter)`
The method is used to search for permissions within a client’s resource server.
Permissions in Keycloak represent rules that define how policies are applied to resources or scopes,
and this method allows you to list and filter them based on specific criteria.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client (the resource server) where permissions are defined 
    - name: [optional] Filter permissions by name
    - type: [optional] Filter by permission type (e.g., "resource" or "scope") 
    - resource: [optional] Filter by the resource ID
    - scope: [optional] Filter by scope ID
    - first: [optional] Index of the first result for pagination 
    - max: [optional] Maximum number of results to return
```js
const KeycloakManager = require('keycloak-api-manager');

// search permission
const permissions= await KeycloakManager.clients.findPermissions({
    id: 'internal-client-id',
    name: "View Orders",
    type: "resource",
});

console.log("Permissions found:", permissions);

```


##### `function clients.updateFineGrainPermission(filter,status)`
The method updates the fine-grained admin permissions configuration for a specific client.
Fine-grained permissions allow you to control which users/roles can manage different aspects of a client 
(e.g., who can manage roles, protocol mappers, or scope assignments).

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client (the resource server) where permissions are defined 
- status: JSON structure that defines the fine grain permission
  - enabled: [required] Whether fine-grained permissions should be enabled or disabled.
```js
const KeycloakManager = require('keycloak-api-manager');

// enable fine-grained permissions for this client
await KeycloakManager.clients.updateFineGrainPermission(
    { id: 'internal-client-id'},
    { enabled: true }  
);
console.log("Fine-grained permissions updated successfully");

```

##### `function clients.listFineGrainPermissions(filter)`
The method retrieves the current fine-grained admin permission settings for a given client.
This is useful for checking which permissions are configured (e.g., managing roles, protocol mappers, or client scopes).

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client (the resource server) where permissions are defined
```js
const KeycloakManager = require('keycloak-api-manager');

// enable fine-grained permissions for this client
const permissions=  await KeycloakManager.clients.listFineGrainPermissions(
    { id: 'internal-client-id'},
    { enabled: true }  
);
console.log("Fine-grained permissions for client:", permissions);

```


##### `function clients.getAssociatedScopes(filter)`
The method is used to retrieve all scopes associated with a specific permission within a client’s resource server.
In Keycloak’s Authorization Services, permissions can be linked to one or more scopes to define the contexts in which they apply. This method allows you to query those associations.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client whose permission scopes you want to list
    - permissionId: [required] The ID of the permission whose associated scopes you want to retrieve.

```js
const KeycloakManager = require('keycloak-api-manager');

// List associated scope
const scopes= await KeycloakManager.clients.getAssociatedScopes({
    id: 'internal-client-id',
    permissionId: "123e4567-e89b-12d3-a456-426614174000",
});

console.log("Associated scopes:", scopes);
```

##### `function clients.getAssociatedPolicies(filter)`
The method is used to retrieve all policies associated with a specific permission within a client’s resource server.
n Keycloak Authorization Services, permissions can be tied to one or more policies that define the conditions under which access is granted. This method lets you fetch those policy associations

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client whose permission policies you want to list
    - permissionId: [required] The ID of the permission whose associated policies you want to retrieve.

```js
const KeycloakManager = require('keycloak-api-manager');

// List associated policies
const policies= await KeycloakManager.clients.getAssociatedPolicies({
        id: 'internal-client-id',
    permissionId: "123e4567-e89b-12d3-a456-426614174000",
});

console.log("Associated policies:", policies);
```



##### `function clients.getAssociatedResources(filter)`
The method is used to retrieve all resources linked to a specific permission in a client’s resource server.
In Keycloak Authorization Services, permissions can be scoped to one or more resources (such as APIs, endpoints, or domain-specific entities). This method allows you to query those resource associations.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client whose permission resource you want to list
    - permissionId: [required] The ID of the permission for which you want to fetch associated resources.

```js
const KeycloakManager = require('keycloak-api-manager');

// List associated resources
const resources= await KeycloakManager.clients.getAssociatedResources({
    id: 'internal-client-id',
    permissionId: "123e4567-e89b-12d3-a456-426614174000",
});

console.log("Associated resources:", resources);

```


##### `function clients.listScopesByResource(filter)`
The method is used to list all authorization scopes associated with a specific resource in a client’s resource server. 
This allows administrators to understand which scopes are directly linked to a protected resource and therefore which permissions can be applied to it.

Compatibility note: this method uses a direct Keycloak Admin REST API call internally to avoid known normalization issues from `@keycloak/keycloak-admin-client` in some environments.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
  - id: [required] The ID of the client (the resource server). 
  - resourceId: [required] The ID of the resource for which to list scopes.

```js
const KeycloakManager = require('keycloak-api-manager');


// List permissions by resource
const scopes= await KeycloakManager.clients.listScopesByResource({ 
    id: 'internal-client-id',
    resourceId: 'resource-id'
});

console.log("Scopes for resource:", scopes);

```


##### `function clients.listResources(filter)`
The method is used to retrieve all resources defined in a client’s resource server. 
Resources represent protected entities (such as APIs, files, or services) that can be associated with scopes and permissions in Keycloak’s authorization services.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
  - id: [required] The ID of the client (the resource server) 
  - deep: [optional] If true, returns detailed information about each resource 
  - first: [optional] Index of the first resource to return (for pagination)
  - max: [optional] Maximum number of resources to return (for pagination)
  - name: [optional] Filters resources by name
  - uri: [optional] Filters resources by URI
  - owner: [optional] Filters resources by owner

```js
const KeycloakManager = require('keycloak-api-manager');


// List resources
const resources= await KeycloakManager.clients.listResources({ 
    id: 'internal-client-id'
});

console.log("Resources:", resources);

```


##### `function clients.updateResource(filter,resourceRepresentation)`
The method is used to update an existing resource in a client’s resource server. 
Resources represent protected entities (APIs, files, services, etc.) that can be secured with scopes and permissions under Keycloak’s Authorization Services

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
  - id: [required] The ID of the client (the resource server)
  - resourceId: [required] The ID of the resource you want to update.
- resourceRepresentation: JSON structure that defines the resource representation to update 
  - name: [optional] The updated name of the resource
  - displayName: [optional] A human-readable name for the resource
  - uris: [optional] Updated list of URIs associated with the resource 
  - scopes: [optional] Updated list of scopes linked to the resource
  - ownerManagedAccess: [optional] Indicates whether the resource is managed by its owner 
  - attributes : [optional] Custom attributes for the resource
  

```js
const KeycloakManager = require('keycloak-api-manager');


// Update resource
await KeycloakManager.clients.updateResource( 
    {  
        id: 'internal-client-id',
        resourceId: 'resource-id' 
    },
    {
        name: "updated-api-resource",
        displayName: "Updated API Resource",
        uris: ["/api/updated/*"],
        scopes: [{ name: "view" }, { name: "edit" }],
        ownerManagedAccess: true,
    }
);

console.log("Resource updated successfully");

```


##### `function clients.createPolicy(filter,policyRepresentation)`
The method is used to create a new policy for a client’s resource server under Keycloak’s Authorization Services.
Policies define the rules that determine whether access should be granted or denied to a given resource, scope, or permission. 
They can be based on users, roles, groups, conditions, or custom logic.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
  - id: [required] The ID of the client (the resource server) where the policy will be created.
  - type: [required] The policy type. Examples include:
    - "role" – grants access based on roles.    
    - "user" – grants access based on users.
    - "group" – grants access based on groups.
    - "js" – uses custom JavaScript logic.
    - "time" – defines time-based conditions.
- policyRepresentation: JSON structure that defines the policy:
  - name: [required] The name of the policy. 
  - description: [optional] A human-readable description of the policy. 
  - logic: [optional] Either "POSITIVE" (default, grants access if the condition is met) or "NEGATIVE" (denies access if the condition is met). 
  - decisionStrategy: [optional] Defines how multiple policies are evaluated: "AFFIRMATIVE", "UNANIMOUS", or "CONSENSUS". 
  - Other Config...: [optional]  Configuration object depending on  the chosen policy type. For example, a role policy requires role details.
  

```js
const KeycloakManager = require('keycloak-api-manager');


// create new policy
await KeycloakManager.clients.createPolicy( 
    {  
        id: 'internal-client-id',
        type: "role",   
    },
    
    {
        name: "role-based-policy",
        description: "Grants access only to users with the admin role",
        logic: "POSITIVE", 
        decisionStrategy: "UNANIMOUS",
        users: [user.id],
        config: {
            roles: JSON.stringify([{ id: "admin-role-id", required: true }]),
        },
    }
);

console.log("Policy created successfully");

```



##### `function clients.listDependentPolicies(filter)`
The method is used to list all policies that depend on a given policy within a client’s resource server.
This is useful when you want to understand how a policy is referenced by other policies, permissions, or configurations, helping you manage complex authorization structures.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
  - id: [required] The ID of the client (the resource server) where the policy exists. 
  - policyId: [required] The ID of the policy for which you want to list dependent policies.

```js
const KeycloakManager = require('keycloak-api-manager');


// create new policy
const dependentPolicies= await KeycloakManager.clients.listDependentPolicies( 
    {  
        id: 'internal-client-id',
        policyId: "1234-abcd-policy-id",
    });

console.log("Dependent policies:", dependentPolicies);

```




##### `function clients.evaluateGenerateAccessToken(filter)`
The method is used to generate or simulate an access token for a specific client, typically for testing or evaluating the token
contents without performing a full user login. This can help you verify client roles, scopes, and protocol mappers included in the token

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] ID of the client for which you want to generate or evaluate the access token
  
```js
const KeycloakManager = require('keycloak-api-manager');
// generate accesstoken
const token = await KeycloakManager.clients.evaluateGenerateAccessToken({
    id: 'internal-client-id'
});

console.log("Generated access token:", token); 

// should be printed:
        // "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        //  "expires_in": 300,
        //  "refresh_expires_in": 1800,
        //  "token_type": "Bearer",
        //  "scope": "openid profile email"

```


##### `function clients.evaluateGenerateIdToken(filter)`
The method is used to generate or simulate an ID token for a specific client, usually for testing or evaluating the token without
performing a full user login. This allows you to verify which claims, scopes, and protocol mappers are included in the ID 
token for the client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] ID of the client for which you want to generate or evaluate the ID token
  
```js
const KeycloakManager = require('keycloak-api-manager');
// generate id token
const token = await KeycloakManager.clients.evaluateGenerateIdToken({
    id: 'internal-client-id',
});

console.log("Generated ID token:", token);

// should printed:
        // "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        //  "expires_in": 300,
        //  "refresh_expires_in": 1800,
        //  "token_type": "Bearer",
        //  "scope": "openid profile email"

```

##### `function clients.evaluateGenerateUserInfo(filter)`
The method is used to generate or simulate a UserInfo response for a specific client, typically for testing or evaluating what 
user information would be returned by the UserInfo endpoint for that client. This helps verify which claims are included in the 
UserInfo response without performing a full login flow.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The ID of the client for which you want to generate the UserInfo response
  
```js
const KeycloakManager = require('keycloak-api-manager');
// generate toke user info
const userInfo = await KeycloakManager.clients.evaluateGenerateUserInfo({
    id: 'internal-client-id',
});

console.log("Generated UserInfo response:", userInfo);

/*
  should be printed:
    {
        "sub": "1234-5678-90ab-cdef",
        "preferred_username": "johndoe",
        "email": "johndoe@example.com",
        "given_name": "John",
        "family_name": "Doe"
    }
 */

```


##### `function evaluateListProtocolMapper(filter)`
The method is used to retrieve or evaluate the protocol mappers associated with a specific client. 
Protocol mappers define how user information (claims) is mapped into tokens (like ID tokens or access tokens) for a client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] ID of the client for which you want to list or evaluate protocol mappers.

```js
const KeycloakManager = require('keycloak-api-manager');
 // List protocol mappers for client
const protocolMappers = await KeycloakManager.clients.evaluateListProtocolMapper({
    id: 'internal-client-id',
});

console.log("Protocol mappers for client:", protocolMappers);

```




##### `function addProtocolMapper(filter,protocolMapperRepresentation)`
The method allows you to add a single protocol mapper to a specific client. 
Protocol mappers define how data from user/client models is added to tokens (e.g., access token, ID token, or SAML assertion)..

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal client ID of the client
- protocolMapperRepresentation: The protocol mapper definition, typically matching this structure:
    - name
    - protocol (e.g., "openid-connect" or "saml")
    - protocolMapper (e.g., "oidc-usermodel-property-mapper")
    - consentRequired
    - config (object)
        -  user.attribute
        -  claim.name
        -  jsonType.label
        -  id.token.claim
        -  access.token.claim
        - .....
    - ....

```js
const KeycloakManager = require('keycloak-api-manager');
 // add single protocol mapper
await KeycloakManager.clients.addProtocolMapper(
    {id: 'internal-client-id'},
    {
        name: "become-a-farmer",
        protocol: "openid-connect",
        protocolMapper: "oidc-role-name-mapper",
        config: {
            role: "admin",
            "new.role.name": "farmer",
        }
    }
);



```




##### `function updateProtocolMapper(filter,protocolMapperRepresentation)`
The method is used to update an existing protocol mapper for a specific client in Keycloak.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal client ID of the client
    - mapperId: [required] The ID of the protocol mapper to be updated.
- protocolMapperRepresentation: The protocol mapper definition, typically matching this structure:
    - name
    - protocol (e.g., "openid-connect" or "saml")
    - protocolMapper (e.g., "oidc-usermodel-property-mapper")
    - consentRequired
    - config (object)
        -  user.attribute
        -  claim.name
        -  jsonType.label
        -  id.token.claim
        -  access.token.claim
        - .....
    - ....

```js
const KeycloakManager = require('keycloak-api-manager');
 // update protocol mappe
await KeycloakManager.clients.updateProtocolMapper(
    {id: 'internal-client-id', mapperId:'mapper-id'},
    {
        name: "become-a-farmer",
        protocol: "openid-connect",
        protocolMapper: "oidc-role-name-mapper",
        config: {
            role: "admin",
            "new.role.name": "farmer",
        }
    }
);
```


##### `function addMultipleProtocolMappers(filter,protocolMapperRepresentation)`
The method allows you to add several protocol mappers at once to a specific client. 
Protocol mappers define how data from the user or client model is transformed and included in tokens 
issued by Keycloak (e.g., access tokens, ID tokens, SAML assertions). 
This batch operation is efficient when you want to configure multiple mappings without multiple API calls.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal client ID of the client
- protocolMapperRepresentation: An array of protocol mapper objects. Each object must conform to the ProtocolMapperRepresentation structure, which typically includes:
  - name 
  - protocol (e.g., "openid-connect" or "saml")
  - protocolMapper (e.g., "oidc-usermodel-property-mapper")
  - consentRequired 
  - config (object)
    -  user.attribute
    -  claim.name 
    -  jsonType.label 
    -  id.token.claim 
    -  access.token.claim
    - .....
  - ....

```js
const KeycloakManager = require('keycloak-api-manager');
 // add multiple protocol mappers
await KeycloakManager.clients.addMultipleProtocolMappers(
    {id: 'internal-client-id'},
    [
        {
            name: "become-a-farmer",
            protocol: "openid-connect",
            protocolMapper: "oidc-role-name-mapper",
            config: {
                role: "admin",
                "new.role.name": "farmer",
            },
        },
        {
            name: "email",
            protocol: "openid-connect",
            protocolMapper: "oidc-usermodel-property-mapper",
            consentRequired: false,
            config: {
                "user.attribute": "email",
                "claim.name": "email",
                "jsonType.label": "String",
                "id.token.claim": "true",
                "access.token.claim": "true",
            },
        },
        {
            name: "username",
            protocol: "openid-connect",
            protocolMapper: "oidc-usermodel-property-mapper",
            consentRequired: false,
            config: {
                "user.attribute": "username",
                "claim.name": "preferred_username",
                "jsonType.label": "String",
                "id.token.claim": "true",
                "access.token.claim": "true",
            },
        }
    ]);
```

##### `function findProtocolMapperByName(filter)`
This method helps locate a protocol mapper within a specific client based on its protocol type (e.g. openid-connect) and the mapper name. 
It is particularly useful when you want to verify if a mapper exists or fetch its full configuration.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal client ID of the client
    - name: [required] The name of the protocol mapper to look up. (usually "openid-connect" or "saml").

```js
const KeycloakManager = require('keycloak-api-manager');
 // find Protocol Mapper ByName
await KeycloakManager.clients.findProtocolMapperByName({
    id: 'internal-client-id',
    name: 'protocol-name',
});
```


##### `function findProtocolMappersByProtocol(filter)`
The method returns all protocol mappers associated with a client, filtered by a specific protocol (e.g., "openid-connect" or "saml").

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal client ID of the client
    - protocol: [required] The protocol for which you want to fetch mappers. Common values:
      - "openid-connect"
      - "saml"

```js
const KeycloakManager = require('keycloak-api-manager');
 // find protocol mappers by protocol
const mappers = await KeycloakManager.clients.findProtocolMappersByProtocol({
    id: 'internal-client-id',
    protocol: 'openid-connect',
});

console.log(mappers);
```



##### `function findProtocolMapperById(filter)`
The method retrieves the details of a specific protocol mapper by its ID for a given client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal client ID of the client
    - mapperId: [required] The ID of the protocol mapper you want to fetch.

```js
const KeycloakManager = require('keycloak-api-manager');
 // find Protocol Mapper By Id
const mapper = await KeycloakManager.clients.findProtocolMapperById({
    id: 'internal-client-id',
    mapperId: 'protocol-id',
});
console.log(mapper);
```


##### `function listProtocolMappers(filter)`
The method is used to retrieve all protocol mappers associated with a specific client. 
Protocol mappers define how user and role information is included in tokens such as access tokens, ID tokens, or SAML assertions. 
This method is useful for inspecting or managing the token contents of a client.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal ID of the client whose protocol mappers you want to list.

```js
const KeycloakManager = require('keycloak-api-manager');
 // list protocol mappers
const protocolMappers = await KeycloakManager.clients.listProtocolMappers({
    id: 'internal-client-id',
});
console.log("Protocol Mappers:", protocolMappers);
```


##### `function delProtocolMapper(filter)`
The method is used to delete a specific protocol mapper from a client.
Protocol mappers are used to include specific user or role information in tokens (e.g. access tokens, ID tokens). 
This method is useful when you want to remove an existing mapper from a client configuration.

**` -- @parameters -- `**
- filter: JSON structure that defines the filter parameters:
    - id: [required] The internal client ID of the client
    - mapperId: [required] The ID of the protocol mapper to delete

```js
const KeycloakManager = require('keycloak-api-manager');
 // Del Protocol Mapper
await KeycloakManager.clients.delProtocolMapper({
    id: 'internal-client-id',
    mapperId: 'mapper-id',
});
```




### `entity clientScopes`
The clientScopes resource allows you to manage client scopes in Keycloak. 
Client scopes are reusable sets of protocol mappers and role scope mappings which
can be assigned to clients to define what information about the user is included in tokens and what roles are available.

#### `entity clientScopes functions`
##### `function create(scopeRepresentation)`
method is used to create a new client scope in a Keycloak realm.
A client scope defines a set of protocol mappers and roles that can be applied to clients,
such as during login or token generation.
```js
const KeycloakManager = require('keycloak-api-manager');
 // create a group called my-group
 await KeycloakManager.clientScopes.create({
     name: "scope-name",
     description: "scope-description",
     protocol: "openid-connect",
 });
 ```


##### `function update(filter,scopeRepresentation)`
The method updates the configuration of an existing client scope in a realm.
You can modify properties such as the scope’s name, description, attributes, or protocol mappers.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The unique ID of the client scope to update.
    - realm: [optional] The realm where the client scope exists. 
- scopeRepresentation: The updated client scope object. for example:
  - name: [optional] The name of the scope
  - description: [optional] The scope description
  - other scope fields....
  
```js
const KeycloakManager = require('keycloak-api-manager');
 // update a scope called my-scope-id
 await KeycloakManager.clientScopes.update(
     {id:'my-scope-id'},
     {
        name: "scope-name",
        description: "scope-description",
        protocol: "openid-connect",
     }
 );
 ```
 

##### `function del(filter)`
The method deletes a client scope from a realm in Keycloak.
Once deleted, the client scope will no longer be available for assignment to clients (either as default, optional, or manually).

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The unique ID of the client scope to delete.
    - realm: [optional] The realm where the client scope is defined.
```js
const KeycloakManager = require('keycloak-api-manager');
 // delete client scope
 await KeycloakManager.clientScopes.del({
     id: "scope-id",
 });
 ``` 


##### `function delByName(filter)`
This method removes a client scope from the realm using its unique name. 
It's an alternative to deleting by ID when the scope's name is known.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - name: [required] The name of the client scope to delete. This must match exactly with the registered name in the realm.
```js
const KeycloakManager = require('keycloak-api-manager');
 // cleanup client scopes
 await KeycloakManager.clientScopes.delByName({
     name: "scope-name",
 });
 ```


##### `function find(filter)`
The method retrieves the list of client scopes defined in a realm.
Client scopes represent a set of protocol mappers and roles that can be assigned to clients, either as default, optional, or manually added.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - realm: [optional] The realm where client scopes are defined. 
    - search: [optional] A search string to filter client scopes by name. 
    - first: [optional] Index of the first result (for pagination). 
    - max: [optional] Maximum number of results to return.
```js
const KeycloakManager = require('keycloak-api-manager');
 // Find client Scope
const scope = await KeycloakManager.clientScopes.find({
     max: 10
 });
console.log("Search Result:",scope);
 ```

##### `function findOne(filter)`
The method retrieves the details of a specific client scope in a realm by its unique identifier (ID).
It’s useful when you need the full configuration of a particular client scope, including protocol mappers and assigned roles.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The unique ID of the client scope.
    - realm: [optional] The realm where the client scope is defined. 
    
```js
const KeycloakManager = require('keycloak-api-manager');
 // Find one client Scope
const scope = await KeycloakManager.clientScopes.findOne({
     id: 'my-scope-id'
 });
console.log("Search Result:",scope);
 ```

##### `function findOneByName(filter)`
The method is used to retrieve a specific client scope by its name. 
This is useful when you know the name of a client scope and want to fetch its full details, 
including its ID, protocol, and other settings.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - name: [required] The name of the client scope you're searching for.
```js
const KeycloakManager = require('keycloak-api-manager');
 // Find client Scope by name
const scope = await KeycloakManager.clientScopes.findOneByName({
     name: "scope-name",
 });
console.log("Search Result:",scope);
 ```


##### `function listDefaultClientScopes(filter)`
The method retrieves the list of default client scopes configured in a realm.
Default client scopes are automatically assigned to newly created clients in that realm (for example, profile, email, roles).

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - realm: [optional] The realm where the client scopes are defined.
    - first: [optional] Index of the first result (for pagination).
    - max: [optional] Maximum number of results to return.
```js
const KeycloakManager = require('keycloak-api-manager');
 // list default client scopes
const scopes = await KeycloakManager.clientScopes.listDefaultClientScopes({
     realm: "realm-name",
 });
console.log("Search Result:",scopes);
 ```


##### `function addDefaultClientScope(filter)`
The method adds a client scope to the list of default client scopes of a realm in Keycloak.
Default client scopes are automatically assigned to all newly created clients within the realm.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the client scope to add as a default.
    - realm: [optional] The realm where the client scopes are defined.
```js
const KeycloakManager = require('keycloak-api-manager');
 // add default client scope
await KeycloakManager.clientScopes.addDefaultClientScope({
     id: "client-scope-id",
 });

 ```


##### `function delDefaultClientScope(filter)`
The method removes a client scope from the list of default client scopes of a realm in Keycloak.
Default client scopes are automatically assigned to newly created clients in that realm. 
Removing one prevents it from being included by default.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the client scope to remove from the default list.
    - realm:: [optional] The realm where the client scope is defined. 
    
```js
const KeycloakManager = require('keycloak-api-manager');
 // delete default client Scope
await KeycloakManager.clientScopes.delDefaultClientScope({
    realm: "myrealm-name",
    id: "default-profile-scope-id",
});

console.log("Client scope removed from defaults");
 ```


##### `function listDefaultOptionalClientScopes(filter)`
The method retrieves the list of default optional client scopes in a realm.
Optional client scopes are available for clients to select but are not automatically applied when a new client is created.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - realm:: [optional] The realm where the client scope is defined. 
    
```js
const KeycloakManager = require('keycloak-api-manager');
 // list default optional client scopes
const optionalScopes= await KeycloakManager.clientScopes.listDefaultOptionalClientScopes({
    realm: "myrealm-name",
    id: "default-profile-scope-id",
});


console.log("Default optional client scopes:", optionalScopes);
 ```

##### `function addDefaultOptionalClientScope(filter)`
The method adds a client scope to the list of default optional client scopes in a realm.
Optional client scopes are available to clients for selection but are not automatically applied when a new client is created.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the client scope to add as a default optional scope. 
  - realm:: [optional] The realm where the client scope is defined. 
    
```js
const KeycloakManager = require('keycloak-api-manager');
 // add default optional client scope
await KeycloakManager.clientScopes.addDefaultOptionalClientScope({
    realm: "myrealm-name",
    id: "default-profile-scope-id",
});


console.log("Client scope added to default optional scopes");
 ```

##### `function delDefaultOptionalClientScope(filter)`
The method removes a client scope from the list of default optional client scopes of a realm in Keycloak.
Optional client scopes are scopes that can be assigned to clients on demand. 
By default, they are available to clients but not automatically applied unless explicitly selected. 
Removing one prevents it from being listed as optional for new clients.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the client scope to remove from the optional list.
    - realm:: [optional] The realm where the client scope is defined. 
    
```js
const KeycloakManager = require('keycloak-api-manager');
 // delete optional client Scope
await KeycloakManager.clientScopes.delDefaultOptionalClientScope({
    realm: "myrealm-name",
    id: "default-profile-scope-id",
});

console.log("Client scope removed from default optional scopes");
 ```


##### `function findProtocolMapperByName(filter)`
The method retrieves a protocol mapper from a specific client scope by its name.
Protocol mappers define how user attributes, roles, or other data are mapped into tokens (ID token, access token, or user info) in Keycloak.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the client scope to search within.
  - realm: [optional] The realm where the client scope is defined. 
  - name: [optional] The name of the protocol mapper to find.
    
```js
const KeycloakManager = require('keycloak-api-manager');
 // find protocol mapper by name
const mapper= await KeycloakManager.clientScopes.findProtocolMapperByName({
    realm: "myrealm-name",
    id: "mapper-id-protocol",
    name: "username",
});

if (mapper) {
    console.log("Found protocol mapper:", mapper);
} else {
    console.log("Protocol mapper not found");
}
```

##### `function findProtocolMapper(filter)`
The method retrieves a specific protocol mapper from a client scope in a realm, using its mapper ID.
Protocol mappers define how user attributes, roles, or other information are mapped into tokens (ID token, access token, or user info) in Keycloak.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the client scope containing the protocol mapper.
  - mapperId: [required] The ID of the protocol mapper to retrieve.
  - realm: [optional] The realm where the client scope is defined. 
   
```js
const KeycloakManager = require('keycloak-api-manager');
 // find protocol mapper by name
const mapper= await KeycloakManager.clientScopes.findProtocolMapper({
    realm: "myrealm-name",
    id: "client-scope-id",
    mapperId: "mapper-id-123",
});

if (mapper) {
    console.log("Found protocol mapper:", mapper);
} else {
    console.log("Protocol mapper not found");
}
```


##### `function findProtocolMappersByProtocol(filter)`
The method retrieves all protocol mappers of a given protocol (e.g., openid-connect or saml) for a specific client scope in a realm.
This is useful when you want to filter protocol mappers by the authentication protocol they are associated with.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the client scope to search within.
  - protocol: [required] The protocol to filter by (e.g., "openid-connect", "saml").
  - realm: [optional] The realm where the client scope is defined.
   
```js
const KeycloakManager = require('keycloak-api-manager');
 // find protocol mapper by protocol
const mapper= await KeycloakManager.clientScopes.findProtocolMappersByProtocol({
    realm: "myrealm-name",
    id: "client-scope-id",
    protocol: "openid-connect",
});

if (mapper) {
    console.log("Found protocol mapper:", mapper);
} else {
    console.log("Protocol mapper not found");
}
```


##### `function delProtocolMapper(filter)`
The method deletes a protocol mapper from a specific client scope in a realm.
Protocol mappers define how user attributes, roles, or other information are mapped into tokens (ID token, access token, or user info) in Keycloak. 
Deleting a mapper removes its configuration from the client scope.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the client scope containing the protocol mapper.
  - mapperId: [required] The ID of the protocol mapper to delete.
  - realm: [optional] The realm where the client scope is defined.
  
```js
const KeycloakManager = require('keycloak-api-manager');
 
// Del Protocol Mapper
await KeycloakManager.clientScopes.delProtocolMapper({
    realm: "my-realm-id",
    id: "client-id",
    mapperId: "mapper-id-123",
});

console.log("Protocol mapper deleted successfully");
```


##### `function listProtocolMappers(filter)`
The method retrieves all protocol mappers associated with a specific client scope in a realm.
Protocol mappers define how user attributes, roles, or other data are mapped into tokens (ID token, access token, or user info) in Keycloak.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the client scope to list protocol mappers from.
  - realm: [optional] The realm where the client scope is defined.
  
```js
const KeycloakManager = require('keycloak-api-manager');
 
// list protocol mapper
const mappers= await KeycloakManager.clientScopes.listProtocolMappers({
    realm: "myrealm-name",
    id: "mapper-id",
});

console.log("Protocol mappers for client scope:", mappers);
```


##### `function addMultipleProtocolMappers(filter,protocolMappers)`
The method adds multiple protocol mappers to a specific client scope in a realm.
Protocol mappers define how user attributes, roles, or other data are mapped into tokens (ID token, access token, or user info) in Keycloak. 
With this method, you can configure several mappers in a single request.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the client scope where the protocol mappers should be added.
  - realm: [optional] The realm where the client scope is defined. 
- protocolMappers: An array of protocol mapper definitions to add. 
  - Each ProtocolMapperRepresentation typically includes:
    - name: [required] The mapper’s name. 
    - protocol: [required] Usually "openid-connect" or "saml". 
    - protocolMapper: [required] The mapper type, e.g., "oidc-usermodel-property-mapper".
    - config: [optional] Mapper-specific configuration (e.g., user attribute, claim name, JSON type).
    - consentRequired: [optional] Whether user consent is required. 

```js
const KeycloakManager = require('keycloak-api-manager');
 
// add multiple protocol mappers
await KeycloakManager.clientScopes.addMultipleProtocolMappers(
    { id: 'client-scope-id' }, 
    [
        {
            name: "mapping-maps-mapper",
            protocol: "openid-connect",
            protocolMapper: "oidc-audience-mapper",
        },
        {
            name: "email",
            protocol: "openid-connect",
            protocolMapper: "oidc-usermodel-property-mapper",
            consentRequired: false,
            config: {
                "user.attribute": "email",
                "claim.name": "email",
                "jsonType.label": "String"
            }
        }
    ]
);

console.log("Multiple protocol mappers added successfully");
```




##### `function addProtocolMapper(filter,protocolMapper)`
The method adds a single protocol mapper to a specific client scope in a realm.
Protocol mappers define how user attributes, roles, or other information are mapped into tokens (ID token, access token, or user info) in Keycloak.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the client scope where the protocol mapper should be added.
  - realm: [optional] The realm where the client scope is defined. 
- protocolMapper: A protocol mapper definitions to add. 
  - name: [required] The mapper’s name. 
  - protocol: [required] Usually "openid-connect" or "saml". 
  - protocolMapper: [required] The mapper type, e.g., "oidc-usermodel-property-mapper".
  - config: [optional] Mapper-specific configuration (e.g., user attribute, claim name, JSON type).
  - consentRequired: [optional] Whether user consent is required. 

```js
const KeycloakManager = require('keycloak-api-manager');
 
// add protocol mapper
await KeycloakManager.clientScopes.addProtocolMapper(
    { id: 'client-scope-id' }, 
   
    {
        name: "mapping-maps-mapper",
        protocol: "openid-connect",
        protocolMapper: "oidc-audience-mapper",
        consentRequired: false,
        config: {
            "user.attribute": "email",
            "claim.name": "email",
            "jsonType.label": "String"
        }
    }
   
);

console.log("Protocol mapper added successfully");
```



##### `function updateProtocolMapper(filter,protocolMapper)`
The method updates an existing protocol mapper in a specific client scope of a realm.
Protocol mappers define how user attributes, roles, or other information are mapped into tokens (ID token, access token, or user info). 
With this method, you can modify an existing mapper’s configuration.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the client scope where the protocol mapper should be updated.
  - mapperId: [required] The ID of the protocol mapper to update.
  - realm: [optional] The realm where the client scope is defined. 
- protocolMapper: The updated definition of the protocol mapper. 
  - name: [required] The mapper’s name. 
  - protocol: [required] Usually "openid-connect" or "saml". 
  - protocolMapper: [required] The mapper type, e.g., "oidc-usermodel-property-mapper".
  - config: [optional] Mapper-specific configuration (e.g., user attribute, claim name, JSON type).
  - consentRequired: [optional] Whether user consent is required. 

```js
const KeycloakManager = require('keycloak-api-manager');
 
// add protocol mapper
await KeycloakManager.clientScopes.updateProtocolMapper(
    { id: 'client-scope-id' ,  mapperId: "mapper-id-123",}, 
   
    {
        name: "mapping-maps-mapper",
        protocol: "openid-connect",
        protocolMapper: "oidc-audience-mapper",
        consentRequired: false,
        config: {
            "user.attribute": "email",
            "claim.name": "email",
            "jsonType.label": "String"
        }
    }
   
);

console.log("Protocol mapper updated successfully");
```



##### `function listScopeMappings(filter)`
The method retrieves all scope mappings for a given client scope in a realm. 
Scope mappings define which roles (from realm roles or client roles) are granted to a client scope. 
These roles determine the permissions and access tokens issued for clients using this scope.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the client scope to list scope mapping.
    - realm: [optional] The realm where the client scope is defined.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// list scope mapping
const scopeMappings= await KeycloakManager.clientScopes.listScopeMappings({
    realm: "myrealm-name",
    id: "client-scope-id",
});


console.log("Scope mappings:", scopeMappings);
```


##### `function listAvailableClientScopeMappings(filter)`
The method retrieves the list of available client roles that can be mapped to a given client scope but are not yet assigned.
This helps identify which roles from a specific client are still available to be added to the client scope.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the client scope to list available scope mapping.
    - client: [required] The client ID (client UUID or client identifier) from which to list available roles
    - realm: [optional] The realm where the client scope is defined.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// list available client scope mapping
const availableRoles= await KeycloakManager.clientScopes.listAvailableClientScopeMappings({
    realm: "myrealm-name",
    id: "client-scope-id",
    client:'client-id'
});



console.log("Available client scope mappings:", availableRoles);
```


##### `function addClientScopeMappings(filter,roleRepresentation)`
The method adds one or more client roles from a specific client to a given client scope in a realm.
This means the client scope will include the selected roles, and any client using this scope will inherit these permissions in its tokens.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:    
  - id: [required] ID of the client scope. 
  - client: [required] The client ID (client UUID or client identifier) whose roles are being mapped.
  - realm : [optional] The realm where the client scope is defined.
- RoleRepresentation: An array of role definitions to add. Each RoleRepresentation typically includes(or at least their id and/or name):
  - id : [optional] The role ID. 
  - name : [optional] The role name. 
  - description: [optional] A description of the role. 
  - clientRole: [optional]: Whether this role belongs to a client. 
  - containerId: [optional] The ID of the client containing the role.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// add client scope mapping
const availableRoles= await KeycloakManager.clientScopes.addClientScopeMappings(
    {
        realm: "myrealm-name",
        id: "client-scope-id",
        client: "client-id"
    },
    
    [
        {
            id: "role-id-101",
            name: "view-profile",
            clientRole: true,
            containerId: "account"
        },
        {
            id: "role-id-102",
            name: "manage-account",
            clientRole: true,
            containerId: "account"
        }
    ]
);

console.log("Client roles mapped to client scope successfully");
```


##### `function delClientScopeMappings(filter,roleRepresentation)`
The method removes one or more client role mappings from a given client scope in a realm.
This allows you to revoke previously assigned client roles so they are no longer included in the client scope.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:    
  - id: [required] ID of the client scope. 
  - client: [required] The client ID (client UUID or client identifier) from which the roles are being removed.
  - realm : [optional] The realm where the client scope is defined.
- RoleRepresentation: An array of role objects (or at least their id and/or name) to be removed from the client scope.
  - id : [optional] The role ID. 
  - name : [optional] The role name. 
  - description: [optional] A description of the role. 
  - clientRole: [optional]: Whether this role belongs to a client. 
  - containerId: [optional] The ID of the client containing the role.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// add client scope mapping
const availableRoles= await KeycloakManager.clientScopes.delClientScopeMappings( 
    {
        realm: "myrealm-name",
        id: "client-scope-id",
        client: "client-id"
    },
    
    [
        {
            id: "role-id-101",
            name: "view-profile",
            clientRole: true,
            containerId: "account"
        },
        {
            id: "role-id-102",
            name: "manage-account",
            clientRole: true,
            containerId: "account"
        }
    ]
);

console.log("Roles removed from client scope mappings.");
```


##### `function listClientScopeMappings(filter)`
The method retrieves all client roles from a specific client that are currently mapped to a given client scope in a realm.
This allows you to check which roles from a particular client are already included in the client scope.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter: 
  - id: [required] The ID of the client scope. 
  - client: [required]: The client ID (client UUID or client identifier) whose mapped roles you want to list.
  - realm: [optional] The realm where the client scope is defined.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// list client scope mapping
const mappedRoles= await KeycloakManager.clientScopes.listClientScopeMappings({
    realm: "myrealm-name",
    id: "client-scope-id",
    client: "client-id",
});

console.log("Mapped client roles:", mappedRoles);
```



##### `function listCompositeClientScopeMappings(filter)`
The method retrieves all effective client roles mapped to a given client scope, including both directly assigned roles and those inherited via composite roles.
This is useful when you want to see the final set of roles available in a client scope, not just the ones explicitly mapped.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter: 
  - id: [required] The ID of the client scope. 
  - client: [required]: The client ID (client UUID or client identifier) whose mapped roles you want to list.
  - realm: [optional] The realm where the client scope is defined.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// list client scope mapping
const mappedRoles= await KeycloakManager.clientScopes.listCompositeClientScopeMappings({
    realm: "myrealm-name",
    id: "client-scope-id",
    client: "client-id",
});

console.log("Mapped client roles:", mappedRoles);
```



##### `function listAvailableRealmScopeMappings(filter)`
The method retrieves the list of realm roles that are available to be mapped to a given client scope but are not yet assigned.
This helps you determine which realm-level roles can still be added to the client scope.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter: 
  - id: [required] The ID of the client scope.
  - realm: [optional] The realm where the client scope is defined.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// list available realm scope mappings
const availableRealmRoles= await KeycloakManager.clientScopes.listAvailableRealmScopeMappings({
    realm: "myrealm-name",
    id: "client-scope-id",
});

console.log("Available realm scope mappings:", availableRealmRoles);
```



##### `function addRealmScopeMappings(filter,RoleRepresentation)`
The method adds one or more realm roles to a given client scope in a realm.
This means that any client using this client scope will inherit the specified realm-level roles in its tokens.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter: 
  - id: [required] The ID of the client scope.
  - realm: [optional] The realm where the client scope is defined.
- RoleRepresentation: An array of realm role objects to add. Each RoleRepresentation typically includes:
  - id: [required] The role ID. 
  - name: [required] The role name. 
  - description: [optional] Description of the role. 
  - clientRole: [optional] Should be false for realm roles. 
  - containerId: [optional] The ID of the realm containing the role.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// add realm scope mappings
const availableRealmRoles= await KeycloakManager.clientScopes.addRealmScopeMappings(
    {
        realm: "myrealm-name",
        id: "client-scope-idb"
    },
    [
        { id: "role-id-301", name: "offline_access", clientRole: false, containerId: "myrealm" },
        { id: "role-id-302", name: "uma_authorization", clientRole: false, containerId: "myrealm" }
    ]
);

console.log("Realm roles added to client scope successfully");
```



##### `function delRealmScopeMappings(filter,RoleRepresentation)`
The method removes one or more realm role mappings from a given client scope in a realm.
This revokes previously assigned realm roles, so clients using this scope will no longer inherit these permissions.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter: 
  - id: [required] The ID of the client scope.
  - realm: [optional] The realm where the client scope is defined.
- RoleRepresentation: Each role should include at least its id and/or name
  - id: [required] The role ID. 
  - name: [required] The role name. 
  - description: [optional] Description of the role. 
  - clientRole: [optional] Should be false for realm roles. 
  - containerId: [optional] The ID of the realm containing the role.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// del realm scope mappings
const availableRealmRoles= await KeycloakManager.clientScopes.delRealmScopeMappings(
    {
        realm: "myrealm-name",
        id: "client-scope-id"
    },
    [
        { id: "role-id-301"},
        { id: "role-id-302"}
    ]
);

console.log("Realm roles added to client scope successfully");
```



##### `function listRealmScopeMappings(filter)`
The method retrieves all realm roles that are currently mapped to a given client scope in a realm.
This allows you to see which realm-level permissions are already assigned to the client scope.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter: 
  - id: [required] The ID of the client scope.
  - realm: [optional] The realm where the client scope is defined.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// list realm scope mappings
const mappedRealmRoles= await KeycloakManager.clientScopes.listRealmScopeMappings({
    realm: "myrealm-name",
    id: "client-id-scope",
});

console.log("Mapped realm roles:", mappedRealmRoles);
```


##### `function listCompositeRealmScopeMappings(filter)`
The method retrieves all effective realm roles mapped to a given client scope, including both directly assigned roles and those inherited via composite roles.
This is useful to see the complete set of realm-level permissions a client scope provides.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter: 
  - id: [required] The ID of the client scope.
  - realm: [optional] The realm where the client scope is defined.

```js
const KeycloakManager = require('keycloak-api-manager');
 
// list composite realm scope mappings
const mappedRealmRoles= await KeycloakManager.clientScopes.listCompositeRealmScopeMappings({
    realm: "myrealm-name",
    id: "client-id-scope",
});

console.log("Mapped realm roles:", mappedRealmRoles);
```




### `entity identityProviders`
identityProviders lets you manage Identity Providers (IdPs) configured in a realm.
These are providers like Google, Facebook, GitHub, SAML, OIDC, etc.

#### `entity identityProviders functions`

##### `function identityProviders.create(identityProvidersRepresentation)`
The method is used to create a new Identity Provider (IdP) in a Keycloak realm. 
An IdP allows users to authenticate via external providers such as Google, Facebook, GitHub, 
or another SAML/OIDC provider. 
This method requires specifying an alias, the provider type, and configuration settings such as client ID, client secret, and any other provider-specific options.

**` -- @parameters -- `**
- identityProvidersRepresentation: parameter provided as a JSON object containing the configuration of the Identity Provider
    - alias: [required] Unique name for the IdP within the realm. 
    - providerId: [required] Type of provider (google, facebook, oidc, saml, etc.). 
    - enabled: [optional] Whether the IdP is enabled. Default is true. 
    - displayName: [optional] Display name for the login page. 
    - trustEmail: [optional] Whether to trust the email from the IdP. 
    - storeToken: [optional] Whether to store the token from the IdP. 
    - linkOnly: [optional] If true, the IdP can only link accounts. 
    - firstBrokerLoginFlowAlias: [optional] Flow to use on first login. 
    - config : [optional] Provider-specific configuration, e.g., client ID, client secret, endpoints, etc.
```js
const KeycloakManager = require('keycloak-api-manager');
 // create a gidentity provider
 KeycloakManager.identityProviders.create({
    alias: "google",
    providerId: "google",
    enabled: true,
    displayName: "Google Login",
    trustEmail: true,
    storeToken: false,
    config: {
        clientId: "GOOGLE_CLIENT_ID",
        clientSecret: "GOOGLE_CLIENT_SECRET",
        defaultScope: "openid email profile",
    },
});

console.log("Created Identity Provider:", newIdP);
 ```


##### `function identityProviders.createMapper(mapperParams)`
The method creates a new mapper for an existing Identity Provider in the current realm. 
The mapper defines how attributes, roles, or claims from the Identity Provider are mapped to the Keycloak user model.

**` -- @parameters -- `**
- mapperParams: parameter provided as a JSON object containing the fields to create a new mapper
    - alias: [required] The alias of the Identity Provider to which the mapper will be attached. 
    - identityProviderMapper: [required] The mapper configuration object, which includes details like the mapper type, name, and configuration values
```js
const KeycloakManager = require('keycloak-api-manager');
 // create a mapper
 KeycloakManager.identityProviders.createMapper({
     alias: 'currentIdpAlias',
     identityProviderMapper: {
         name: "email-mapper",
         identityProviderMapper: "oidc-user-attribute-idp-mapper",
         config: {
             "user.attribute": "email",
             "claim": "email",
             "syncMode": "INHERIT",
         },
     },
 });

 ```



##### `function identityProviders.findMappers(filter)`
The method retrieves all mappers associated with a specific Identity Provider in the current realm. 
These mappers define how attributes, roles, or claims from the external Identity Provider are mapped to the Keycloak user model.

**` -- @parameters -- `**
- filter: pparameter provided as a JSON object that accepts the following filter:
    - alias: [required] TThe alias of the Identity Provider whose mappers you want to fetch.
```js
const KeycloakManager = require('keycloak-api-manager');
 // find a mapper
 const  mappers= await KeycloakManager.identityProviders.findMappers({
     alias: 'currentIdpAlias',
     
 });


console.log(mappers);

 ```


##### `function identityProviders.delMapper(filter)`
The method deletes a specific mapper associated with an Identity Provider in the current realm. 
This is useful when you need to remove a mapping rule that translates attributes, roles, or claims from the external Identity Provider into Keycloak.

**` -- @parameters -- `**
- filter: pparameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider that owns the mapper. 
    - id : [required] The unique ID of the mapper to be deleted.
```js
const KeycloakManager = require('keycloak-api-manager');
 // delete a mapper
 await KeycloakManager.identityProviders.delMapper({
     alias: 'currentIdpAlias',
     id: 'mapperId'
 });

console.log("Mapper deleted successfully");
```



##### `function identityProviders.findOneMapper(filter)`
The method retrieves the details of a specific mapper associated with an Identity Provider in the current realm. 
This allows you to inspect a mapper’s configuration, such as how attributes or claims from the external Identity Provider are mapped into Keycloak.

**` -- @parameters -- `**
- filter: pparameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider. 
    - id: [required] The unique ID of the mapper to retrieve.
```js
const KeycloakManager = require('keycloak-api-manager');
 // find a mapper
 const  mapper= await KeycloakManager.identityProviders.findOneMapper({
     alias: 'currentIdpAlias',
     id: 'mapperId'
 });

console.log("Mapper details:", mapper);
```


##### `function identityProviders.del(filter)`
The method removes an Identity Provider from the current realm. 
This action deletes the provider configuration, including all its associated mappers and settings. 
After deletion, users will no longer be able to authenticate using that Identity Provider.

**` -- @parameters -- `**
- filter: pparameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider you want to delete.
```js
const KeycloakManager = require('keycloak-api-manager');
 // delete 
 await KeycloakManager.identityProviders.del({
     alias: 'currentIdpAlias'
 });

console.log(`Identity Provider deleted successfully`);
```


##### `function identityProviders.findOne(filter)`
The method retrieves the configuration details of a specific Identity Provider in the current realm. 
It is useful when you need to inspect the provider’s settings, such as its alias, display name, authentication flow, or other configuration parameters.

**` -- @parameters -- `**
- filter: pparameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider you want to find.
```js
const KeycloakManager = require('keycloak-api-manager');
 // find one 
 const  idp= await KeycloakManager.identityProviders.findOne({
     alias: 'currentIdpAlias'
 });

if (idp) {
    console.log("Identity Provider details:", idp);
} else {
    console.log(`Identity Provider with alias currentIdpAlias not found`);
}
```


##### `function identityProviders.find()`
The method retrieves a list of all configured Identity Providers in the current realm. 
It allows you to see which providers (e.g., Google, GitHub, SAML, etc.) are available and get their basic configuration details.

```js
const KeycloakManager = require('keycloak-api-manager');
 // find 
 const  provider= await KeycloakManager.identityProviders.find();

console.log("Configured Identity Providers:");
providers.forEach((provider) => {
    console.log(`Alias: ${provider.alias}, Provider ID: ${provider.providerId}`);
});
```


##### `function identityProviders.update(filter,identityProviderRepresentation)`
The method updates the configuration of a specific Identity Provider in the current realm. 
It allows you to modify settings such as client ID, secret, authorization URLs, or any custom configuration fields exposed by the provider.

**` -- @parameters -- `**
- filter: pparameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider to update. 
- identityProviderRepresentation: An object containing the updated configuration fields:
  - alias: [required] The alias of the Identity Provider. 
  - providerId: [required] The provider type (e.g., "google", "saml"). 
  - Other optional fields like displayName, config object, etc.
```js
const KeycloakManager = require('keycloak-api-manager');
 // update one 
 await KeycloakManager.identityProviders.update(
     { alias: 'currentIdpAlias' },
     {
         // alias and providerId are required to update
        alias: 'idp.alias',
        providerId: 'idp.providerId',
        displayName: "test",
    }
);
```


##### `function identityProviders.findFactory(filter)`
The method retrieves information about a specific Identity Provider factory available in Keycloak. 
A factory represents a provider type (e.g., "oidc", "saml", "github") and contains metadata about how that provider can be configured. 
This is useful when you want to check what configuration options are supported before creating or updating an Identity Provider.

**` -- @parameters -- `**
- filter: pparameter provided as a JSON object that accepts the following filter:
  - providerId: [required] The ID of the Identity Provider factory to look up (e.g., "oidc", "saml", "google").
```js
const KeycloakManager = require('keycloak-api-manager');
 // find factory 
 const factory= await KeycloakManager.identityProviders.findFactory({
     providerId: "oidc",
 });

console.log("Factory details:", factory);
```




##### `function identityProviders.findMappers(filter)`
The method retrieves all mappers associated with a specific Identity Provider in Keycloak. 
Mappers define how information from the external Identity Provider (e.g., Google, SAML, GitHub) is mapped into Keycloak attributes, roles, or claims. 
This is useful to list all transformations and mappings applied to users authenticating via that provider.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - alias: [required] The alias of the Identity Provider (set when the provider was created).
```js
const KeycloakManager = require('keycloak-api-manager');
 // find one 
 const mappers= await KeycloakManager.identityProviders.findMappers({
     alias: "google",
 });

console.log("Mappers for Google IdP:", mappers);
```


##### `function identityProviders.findOneMapper(filter)`
The method retrieves a single mapper associated with a specific Identity Provider in Keycloak.
It’s useful when you need to inspect the configuration of a mapper before updating or deleting it.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - alias: [required] The alias of the Identity Provider. 
  - id: [required] The unique ID of the mapper to fetch.
```js
const KeycloakManager = require('keycloak-api-manager');
 // find one 
 const mapper= await KeycloakManager.identityProviders.findOneMapper({
     alias: "google",
     id: "1234-abcd-5678-efgh",
 });

if (mapper) {
    console.log("Mapper found:", mapper);
} else {
    console.log("Mapper not found");
}
```


##### `function identityProviders.updateMapper(filter,mapperRepresentation)`
The method updates an existing mapper for a given Identity Provider in Keycloak.
Mappers define how attributes, roles, or claims from an external Identity Provider (e.g., Google, GitHub, SAML) are mapped into Keycloak user attributes or tokens.
This method allows you to change the configuration of an existing mapper (e.g., modify the claim name, attribute name, or role assignment).

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider (set during IdP creation). 
    - id: [required] The ID of the mapper to update. 
- mapperRepresentation: parameter provided as a JSON object that represent the updated mapper configuration object. 
  - id : [optional] The mapper ID.
  - name: [optional] The mapper name. 
  - identityProviderAlias: [optional] The IdP alias. 
  - identityProviderMapper: [optional] The type of mapper (e.g., "oidc-user-attribute-idp-mapper"). 
  - config: [optional] The new mapping configuration.
```js
const KeycloakManager = require('keycloak-api-manager');
 // update one Mapper
 const mappers= await KeycloakManager.identityProviders.updateMapper(
     {
         alias: "google",
         id: "1234-abcd-5678-efgh", // Mapper ID
     },
     {
         id: "1234-abcd-5678-efgh",
         name: "Updated Google Mapper",
         identityProviderAlias: "google",
         identityProviderMapper: "oidc-user-attribute-idp-mapper",
         config: {
             "claim": "email",
             "user.attribute": "updatedEmail",
         },
     }
 );

console.log("Mapper updated successfully!");
```



##### `function identityProviders.importFromUrl(filter)`
The method lets you import an Identity Provider configuration directly from a metadata URL (e.g., OIDC discovery document or SAML metadata XML).
This saves you from manually entering configuration details, since Keycloak can auto-fill them from the provided URL.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - fromUrl : [required] The URL of the IdP metadata (OIDC discovery endpoint or SAML metadata). 
  - providerId : [required]The type of IdP (e.g., "oidc", "saml"). 
  - trustEmail: [optional] Whether to automatically trust emails from this IdP. 
  - alias: [optional] Alias for the Identity Provider (unique name).
```js
const KeycloakManager = require('keycloak-api-manager');
 // import one Mapper
 const mappers= await KeycloakManager.identityProviders.importFromUrl({
     fromUrl: "https://accounts.google.com/.well-known/openid-configuration",
     providerId: "oidc",
     alias: "google",
     trustEmail: true,
 });

console.log("Imported IdP:", importedIdp);
```


##### `function identityProviders.updatePermission(filter,permissionRepresentation)`
The method allows you to enable or disable fine-grained admin permissions for a specific Identity Provider in Keycloak.
When enabled, Keycloak creates client roles (scopes) that let you define which users or groups can view or manage the Identity Provider.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter: 
  - alias: [required] The alias of the Identity Provider. 
- permissionRepresentation: parameter provided as a JSON object that represent the updated permission object.
  - enabled: [optional] true to enable permissions, false to disable. 
  - realm: [optional] The realm where the IdP is defined.
  - other permisssion fields
```js
const KeycloakManager = require('keycloak-api-manager');
 // import one permission
 const updatedPermissions= await KeycloakManager.identityProviders.updatePermission(
     { alias: "google"},
     { enabled: true }
 );

console.log("Updated permission:", updatedPermissions);
```


##### `function identityProviders.listPermissions(filter)`
The method retrieves the current fine-grained permission settings for a specific Identity Provider in Keycloak.
It returns whether permissions are enabled and, if so, which scope roles are associated with managing and viewing the Identity Provider.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter: 
  - alias: [required] The alias of the Identity Provider. 
  - realm: [optional] The realm where the IdP is defined.
```js
const KeycloakManager = require('keycloak-api-manager');
 // import one permission
 const permissions= await KeycloakManager.identityProviders.listPermissions({
     alias: "google",
     realm: "myrealm",
 });

console.log("Current permissions:", permissions);
```




### `entity groups`
The groups entity allows you to manage groups in a Keycloak realm. 
Groups are collections of users and can have roles and attributes assigned to them. 
Groups help organize users and assign permissions in a scalable way

#### `entity groups functions`
##### `function create(groupRepresentation)`
Create a new group in the current realme

Compatibility note: when `parentId` is provided in `groupRepresentation`, the group is created as a child of that parent.

**` -- @parameters -- `**
- groupRepresentation:An object representing the new state of the group. You can update properties such as:
    - name: [optional] New name of the group
    - parentId: [optional] Parent group ID. If present, a child group is created under that parent.
    - attributes: [optional] Custom attributes up field
    - path: [optional] full path of the group
    - subGroups: [optional] List of child groups (can also be updated separately)
    - description: [optional] the new group Description
    - {other [optional] group descriprion fields}

```js
const KeycloakManager = require('keycloak-api-manager');
 // create a group called my-group
 KeycloakManager.groups.create({name: "my-group"});

// create a child group under an existing parent group
await KeycloakManager.groups.create({
    name: "child-group",
    parentId: "parent-group-id"
});
 ```


##### `function find(filter)`
find method is used to retrieve a list of groups in a specific realm.
It supports optional filtering parameters.
Searching by attributes is only available from Keycloak > 15

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - {builtin attribute}: To find groips by builtin attributes such as name, id
    - max: A pagination parameter used to define the maximum number of groups to return (limit).
    - first: A pagination parameter used to define the number of groups to skip before starting to return results (offset/limit).
```js
const KeycloakManager = require('keycloak-api-manager');
 // find a 100 groups
const groups = await KeycloakManager.groups.find({ max: 100 });
if(groups) console.log('Groups found:', groups);
else console.log('Groups not found');

// find a 100 groups and skip the first 50
groups = await KeycloakManager.groups.find({ max: 100, first:50 });
if(groups) console.log('Groups found:', groups);
else console.log('Groups not found');
 ```

##### `function findOne(filter)`
findOne is method used to retrieve a specific group's details by their unique identifier (id) within a given realm.
It returns the full group representation if the group exists.
```js
const KeycloakManager = require('keycloak-api-manager');
 // find a group with id:'group-id'
const group = await KeycloakManager.groups.findOne({ id: 'group-id' });
if(group) console.log('Group found:', group);
else console.log('Group not found');
 ```


##### `function del(filter)`
Deletes a group from the realm.
Return a promise that resolves when the group is successfully deleted. No content is returned on success.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: The ID of the group to delete.
```js
const KeycloakManager = require('keycloak-api-manager');
 // delete a group with id:'group-id'
const group = await KeycloakManager.groups.del({ id: 'group-id' });
 ```


##### `function count(filter)`
Retrieves the total number of groups present in the specified realm. 
This is useful for pagination, reporting, or general statistics regarding group usage in a Keycloak realm.

Compatibility note: this method always returns a number.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - realm: [optional] The name of the realm. If omitted, the default realm is used. 
  - search: [optional] A text string to filter the group count by name.
```js
const KeycloakManager = require('keycloak-api-manager');
 // count groups
const result = await KeycloakManager.groups.count();
console.log('Total groups:', result);

 // count groups with filter
const result = await KeycloakManager.groups.count({ search: "cool-group" });
console.log('Total cool-group groups:', result);

 ```



##### `function update(filter,groupRepresentation)`
Updates an existing group’s information in a Keycloak realm. 
You can modify the group’s name, attributes, or hierarchy by providing the group ID and the updated data.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The unique ID of the group you want to update. 
  - realm: [optional] The realm name 
- groupRepresentation:An object representing the new state of the group. You can update properties such as:
  - name: [optional] New name of the group 
  - attributes: [optional] Custom attributes up field 
  - path: [optional] full path of the group 
  - subGroups: [optional] List of child groups (can also be updated separately)
  - description: [optional] the new group Description
  - other [optional] group descriprion fields 
```js
const KeycloakManager = require('keycloak-api-manager');
 // update single group
await KeycloakManager.groups.update(
    { id: 'group-id' },
    { name: "another-group-name", description: "another-group-description" },
);
```


##### `function listSubGroups(filter)`
Retrieves a paginated list of direct subgroups for a specified parent group. 
This method is useful when navigating hierarchical group structures within a Keycloak realm.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - parentId: [required] ID of the parent group whose subgroups you want to list.
  - first: [optional] Index of the first result for pagination (default is 0).
  - max: [optional] Maximum number of results to return.
  - briefRepresentation: [optional] If true, returns a lightweight version of each group (default is true).
  - realm: [optional] Realm name.
```js
const KeycloakManager = require('keycloak-api-manager');
 // list 10 subgroups
await KeycloakManager.groups.listSubGroups({
    parentId: 'gropd-id',
    first: 0,
    max: 10,
    briefRepresentation: false,
});
```



##### `function addRealmRoleMappings(role_mapping)`
Adds one or more realm-level roles to a specific group. 
This operation grants all users within that group the associated realm roles, effectively assigning permissions at a group level.

**` -- @parameters -- `**
- role_mapping: parameter provided as a JSON object that accepts the following parameters:
  - id: [required] 	The ID of the group to which roles will be added.
  - roles: [required] An array of role(RoleRepresentation) objects to assign.
  
```js
const KeycloakManager = require('keycloak-api-manager');
 // add a role to group
await KeycloakManager.groups.addRealmRoleMappings({
    id: 'gropd-id',
    // at least id and name should appear
    roles: [{
        id: 'role-id',
        name: 'role-name'
    }]
});
```



##### `function listAvailableRealmRoleMappings(filters)`
Retrieves all available realm-level roles that can be assigned to a specific group but are not yet assigned. 
This helps in identifying which roles are still eligible for addition to the group.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
  - id: [required] The ID of the group you want to inspect.

Return an array of RoleRepresentation objects representing the assignable realm roles for the group.

```js
const KeycloakManager = require('keycloak-api-manager');
 // list available role-mappings
const availableRoles= await KeycloakManager.groups.listAvailableRealmRoleMappings({
    id: 'gropd-id'
});
console.log('Available realm roles for group:', availableRoles);
```


##### `function listRoleMappings(filters)`
Retrieves all role mappings for a specific group, including both realm roles and client roles. 
This method is useful for understanding the complete set of roles that are assigned to a group.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
  - id: [required] The ID of the group whose roles to fetch

Return an object with two arrays:
- realmMappings: realm-level roles assigned to the group. 
- clientMappings: a map of client IDs to the client-level roles assigned for each client.

```js
const KeycloakManager = require('keycloak-api-manager');
 // list role-mappings
const roleMappings= await KeycloakManager.groups.listRoleMappings({
    id: 'gropd-id'
});
console.log('Realm roles:', roleMappings.realmMappings);
console.log('Client roles:', roleMappings.clientMappings);
```


##### `function listRealmRoleMappings(filters)`
Returns the list of realm-level roles that are directly assigned to a specific group. 
These roles are defined at the realm level and are not tied to any specific client.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
  - id: [required] TThe ID of the group to retrieve roles for

Return An array of RoleRepresentation objects

```js
const KeycloakManager = require('keycloak-api-manager');
 // list realm role-mappings of group
const realmRoles= await KeycloakManager.groups.listRealmRoleMappings({
    id: 'gropd-id'
});
console.log('Realm roles assigned to group:', realmRoles.map(role => role.name));
```


##### `function listCompositeRealmRoleMappings(filters)`
Retrieves all composite realm-level roles assigned to a group.
This includes both directly assigned roles and those inherited through composite roles.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
  - id: [required] TThe ID of the group to retrieve roles for

Return An array of RoleRepresentation objects that includes all realm roles, both directly assigned and inherited via composite roles.

```js
const KeycloakManager = require('keycloak-api-manager');
 // List realm composite role-mappings of group
const compositeRealmRoles= await KeycloakManager.groups.listCompositeRealmRoleMappings({
    id: 'gropd-id'
});
console.log('All (composite) realm roles for group:', compositeRealmRoles.map(role => role.name));
```


##### `function delRealmRoleMappings(filters)`
Removes one or more realm-level roles from a group's role mappings. 
This operation only affects roles that are directly assigned.
Composite roles inherited indirectly will not be removed.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
  - id: [required] TThe ID of the group to retrieve roles for
  - roles: [required] Array of roles to be removed

```js
const KeycloakManager = require('keycloak-api-manager');
 // Delete realm role-mappings from group
await KeycloakManager.groups.delRealmRoleMappings({
    id: 'gropd-id',
    // at least id and name should appear
    roles: [{
        id: 'role-id',
        name: 'role-name'
    }]
});
```


##### `function addClientRoleMappings(filters)`
Assigns one or more client-level roles to a specific group. 
This allows all users belonging to that group to inherit the specified roles for a given client.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
  - id: [required] The ID of the group
  - clientUniqueId: [required] The internal ID of the client
  - roles: [required] Array of client roles to assign to the group

```js
const KeycloakManager = require('keycloak-api-manager');
 // add a client role to group
await KeycloakManager.groups.addClientRoleMappings({
    id: 'gropd-id',
    clientUniqueId:'internal-client-id',
    // at least id and name should appear
    roles: [{
        id: 'role-id',
        name: 'role-name'
    }]
});
```


##### `function listAvailableClientRoleMappings(filters)`
Retrieves the list of client roles that are available to be assigned to a specific group but are not currently mapped. 
This is useful when you want to show assignable roles for a group in a specific client context.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
  - id: [required] The ID of the group
  - clientUniqueId: [required] The internal ID of the client

```js
const KeycloakManager = require('keycloak-api-manager');
 // list available client role-mappings for group
const availableRoles= await KeycloakManager.groups.listAvailableClientRoleMappings({
    id: 'gropd-id',
    clientUniqueId:'internal-client-id',
});
console.log('Available roles:', availableRoles);
```


##### `function listClientRoleMappings(filters)`
Retrieves the list of client roles that are currently assigned (mapped) to a specific group for a given client. 
This allows you to see which roles from a client the group already has.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
  - id: [required] The ID of the group
  - clientUniqueId: [required] The internal ID of the client

```js
const KeycloakManager = require('keycloak-api-manager');
 // list client role-mappings of group
const availableRoles= await KeycloakManager.groups.listClientRoleMappings({
    id: 'gropd-id',
    clientUniqueId:'internal-client-id',
});
console.log('Assigned client roles:', availableRoles);
```


##### `function listCompositeClientRoleMappings(filters)`
Retrieves the list of composite client roles assigned to a specific group. 
Composite roles are roles that aggregate other roles, so this method returns client roles that include one or more roles grouped under a composite role assigned to the group.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
  - id: [required] The ID of the group
  - clientUniqueId: [required] The internal ID of the client

```js
const KeycloakManager = require('keycloak-api-manager');
 // list composite client role-mappings for group
const compositeClientRoles= await KeycloakManager.groups.listCompositeClientRoleMappings({
    id: 'gropd-id',
    clientUniqueId:'internal-client-id',
});
console.log('Composite client roles assigned to group:', compositeClientRoles);
```


##### `function delClientRoleMappings(filters)`
Removes specific client role mappings from a group. 
This function deletes one or more client roles that were assigned to the group, effectively revoking those client roles from the group.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
  - id: [required] The ID of the group
  - clientUniqueId: [required] The internal ID of the client
  - roles: An array of role objects(RoleRepresentation) representing the client roles to be removed

```js
const KeycloakManager = require('keycloak-api-manager');
 // delete the created role
await KeycloakManager.groups.delClientRoleMappings({
    id: 'gropd-id',
    clientUniqueId:'internal-client-id',
    roles: [
        {
            id: 'role-id',
            name: 'role-name'
    }]
});
```






### `entity roles`
The roles entity refers to Keycloak's roles management functionality, part of the Admin REST API. 
It allows you to create, update, inspect, and delete both realm-level and client-level roles.

#### `entity roles functions`
##### `function create(role_dictionary)`
Create a new role
```js
const KeycloakManager = require('keycloak-api-manager');
 // create a role name called my-role
 KeycloakManager.roles.create({name:'my-role'});
 ```
##### `function createComposite(filters,[roles])`
Create a new composite role. Composite roles in Keycloak are roles that combine other roles,
allowing you to group multiple permissions into a single, higher-level role.
A composite role can include roles from the same realm as well
as roles from different clients.
When you assign a composite role to a user, they automatically inherit all the roles it contains.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
    - roleId: [required] The id of the role to which composite roles will be added.

- roles: (Array<RoleRepresentation>) [required] A list of roles to be added as composites. Each RoleRepresentation typically includes:
    - id: [required] The role’s unique ID.
    - name: [required] The role’s name.
    - containerId: [optional] The realm or client that owns the role.
    - clientRole: [optional] Whether the role belongs to a client.


```js
const KeycloakManager = require('keycloak-api-manager');
 // create a  composite role where "admin" include anche "reader".
const adminRole = await client.roles.findOneByName({ name: 'admin' });
const readerRole = await client.roles.findOneByName({ name: 'reader' });

await client.roles.createComposite({ roleId: adminRole.id }, [readerRole]);
 ```

##### `function find(filters)`
get all realm roles and return a JSON
- filters: parameter provided as a JSON object that accepts the following parameters:
    - name (string, optional): Search string to filter roles by name
    - realm (string, optional: if set globally in the client): The realm from which to retrieve roles.
    - first (number, optional): Index of the first result to return (used for pagination).
    - max (number, optional): Maximum number of results to return.
```js
const KeycloakManager = require('keycloak-api-manager');
 KeycloakManager.roles.find();
 ```
##### `function findOneByName(filters)`
Get a role by name

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
    - name (string, required) — The exact name of the role to retrieve.
    - realm (string, optional if set globally) — The realm where the role is defined.
```js
const KeycloakManager = require('keycloak-api-manager');
 // get information about 'my-role' role
 KeycloakManager.roles.findOneByName({ name: 'my-role' });
 ```

##### `function findOneById(filters)`
Get a role by its Id

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
    - id (string, required) — The id of the role to retrieve.
    - realm (string, optional if set globally) — The realm where the role is defined.
```js
const KeycloakManager = require('keycloak-api-manager');
 // get information about 'my-role-id' role
 KeycloakManager.roles.findOneById({ id: 'my-role-id' });
 ```

##### `function updateByName(filters,role_dictionary)`
Update a role by its name

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
    - name (string, required) — The exact name of the role to retrieve.
    - realm (string, optional if set globally) — The realm where the role is defined.
- role_dictionary: A JSON object representing a role dictionary as defined in Keycloak
```js
const KeycloakManager = require('keycloak-api-manager');
 // update 'my-role' role with a new description
 KeycloakManager.roles.updateByName({ name: 'my-role' }, {description:"new Description"});
 ```

##### `function updateById(filters,role_dictionary)`
Update a role by its Id

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
    - id (string, required) — The id of the role to retrieve.
    - realm (string, optional if set globally) — The realm where the role is defined.
- role_dictionary: A JSON object representing a role dictionary as defined in Keycloak
```js
const KeycloakManager = require('keycloak-api-manager');
 // update role by id 'my-role-id' with a new description
 KeycloakManager.roles.updateById({ id: 'my-role-id' }, {description:"new Description"});
 ```

##### `function delByName(filters)`
Delete a role by its name

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
    - name (string, required) — The exact name of the role to retrieve.
    - realm (string, optional if set globally) — The realm where the role is defined.
```js
const KeycloakManager = require('keycloak-api-manager');
 // delete role  'my-role' 
 KeycloakManager.roles.delByName({ name: 'my-role' });
 ```

##### `function findUsersWithRole(filters)`
Find all users associated with a specific role
- filters: parameter provided as a JSON object that accepts the following parameters:
    - name: (string, optional) — The exact name of the role to retrieve.
    - id: (string, optional) — The Id of the role to retrieve.
    - realm: (string, optional if set globally) — The realm where the role is defined.
```js
const KeycloakManager = require('keycloak-api-manager');
 // Find all users associated with role named 'my-role' 
 KeycloakManager.roles.findUsersWithRole({ name: 'my-role' });
 ```

##### `function getCompositeRoles(filters)`
Find all composite roles associated with a specific role.
- filters: parameter provided as a JSON object that accepts the following parameters:
    - name: (string, optional) — The exact name of the role to retrieve.
    - id: (string, optional) — The id of the role to retrieve.
```js
const KeycloakManager = require('keycloak-api-manager');
 // Find all composite role named 'my-role' and id 'my-role-id' 
 KeycloakManager.roles.getCompositeRoles({ id: 'my-role-id' });
 ```

##### `function getCompositeRolesForRealm({roleId:roleid})`
The getCompositeRolesForRealm function  is used to retrieve all realm-level roles that are
associated with a given composite role.
When a role is defined as composite, it can include other roles either from the same
realm or from different clients. This specific method returns only the realm-level roles
that have been added to the composite role. It requires the roleId of the target role as a
parameter and returns an array of RoleRepresentation objects. If the role is not composite
or has no associated realm roles, the result will be an empty array. This method is useful
for understanding and managing hierarchical role structures within a realm in Keycloak.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
    - roleId: (string, required) — The Id of the role to retrieve.
```js
const KeycloakManager = require('keycloak-api-manager');
const compositeRoles = await KeycloakManager.roles.getCompositeRolesForRealm({ roleId: 'role-id' });
console.log('admin composite roles:', compositeRoles.map(r => r.name));
 
 ```

##### `function getCompositeRolesForClient({roleId:'roleid', clientId:'clientId'})`
The getCompositeRolesForClient function is used to retrieve all client-level roles that are
associated with a given composite role.
Composite roles in Keycloak can include roles from different clients,
and this method specifically returns the roles belonging to a specified client that
are part of the composite role. It requires the roleId of the composite role
and the clientId of the client whose roles you want to retrieve. The function returns an array of
RoleRepresentation objects representing the client roles included in the composite.
This helps manage and inspect client-specific role hierarchies within the composite role structure in Keycloak.

**` -- @parameters -- `**
- filters: parameter provided as a JSON object that accepts the following parameters:
    - roleId: (string, required) — The Id of the role to retrieve
    - clientId: (string, required) — The id of the client to search for composite roles
```js
const KeycloakManager = require('keycloak-api-manager');
const compositeRoles = await KeycloakManager.roles.getCompositeRolesForClient({
    roleId: 'compositeRole-Id',
    clientId: 'client-Id'
});
console.log('admin composite roles fo client whith Id:clientId:', compositeRoles.map(r => r.name));
 
 ```




### `entity components`
The components entity allows you to manage Keycloak components, which are configuration entities such as user federation providers, authenticators, protocol mappers, themes, and more.
Components in Keycloak are modular and pluggable, and this API lets you create, read, update, and delete them programmatically.

#### `entity components functions`

##### `function create(componentReppresentation)`
The method creates a new component in a Keycloak realm.
Components are modular providers in Keycloak, such as user federation providers (LDAP, Kerberos), authenticators, identity providers, or other pluggable extensions.

**` -- @parameters -- `**
- comoponentReppresentation: An object representing the component to create.
  - name: [required] A human-readable name for the component. 
  - providerId: [required] The provider ID (e.g., "ldap", "kerberos", "totp"). 
  - providerType: [required] The type/class of the provider (e.g., "org.keycloak.storage.UserStorageProvider"). 
  - parentId: [optional] The ID of the parent component (if hierarchical). 
  - config: [optional] A map of configuration options, where each property is an array of strings (Keycloak convention). Example:
        - enabled: ["true"],
        - connectionUrl: ["ldap://ldap.example.com"],
        - bindDn: ["cn=admin,dc=example,dc=com"],
        - bindCredential: ["secret"],
        - usersDn: ["ou=users,dc=example,dc=com"]
```js
const KeycloakManager = require('keycloak-api-manager');
 // create a component called my-ldap
 const newComponent= await KeycloakManager.components.create({
     name: "my-ldap",
     providerId: "ldap",
     providerType: "org.keycloak.storage.UserStorageProvider",
     parentId: null,
     config: {
         enabled: ["true"],
         connectionUrl: ["ldap://ldap.example.com"],
         bindDn: ["cn=admin,dc=example,dc=com"],
         bindCredential: ["secret"],
         usersDn: ["ou=users,dc=example,dc=com"]
     }
 });

console.log("Created component:", newComponent);
 ```


##### `function update(componentReppresentation)`
The method updates an existing component in a Keycloak realm.
Components represent pluggable extensions such as user federation providers (LDAP, Kerberos),
protocol mappers, authenticator factories, or other custom integrations.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The unique ID of the component to update.
- componentRepresentation: An object representing the component to update.
    - name: [required] A human-readable name for the component.
    - providerId: [required] The provider ID (e.g., "ldap", "kerberos", "totp").
    - providerType: [required] The type/class of the provider (e.g., "org.keycloak.storage.UserStorageProvider").
    - parentId: [optional] The ID of the parent component (if hierarchical).
    - config: [optional] A map of configuration options, where each property is an array of strings (Keycloak convention). Example:
        - enabled: ["true"],
        - connectionUrl: ["ldap://ldap.example.com"],
        - bindDn: ["cn=admin,dc=example,dc=com"],
        - bindCredential: ["secret"],
        - usersDn: ["ou=users,dc=example,dc=com"]
```js
const KeycloakManager = require('keycloak-api-manager');
 // update a component
 await KeycloakManager.components.update(
     {id:'component-id'},
     {
     name: "my-ldap",
     providerId: "ldap",
     providerType: "org.keycloak.storage.UserStorageProvider",
     parentId: null,
     config: {
         enabled: ["true"],
         connectionUrl: ["ldap://ldap.example.com"],
         bindDn: ["cn=admin,dc=example,dc=com"],
         bindCredential: ["secret"],
         usersDn: ["ou=users,dc=example,dc=com"]
     }
 });

console.log("Component updated successfully");
 ```


##### `function findOne(filter)`
The method retrieves a single component from a realm by its ID.
Components in Keycloak represent pluggable providers such as LDAP user federation, authenticators, protocol mappers, or other extensions.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The unique ID of the component to retrieve.
```js
const KeycloakManager = require('keycloak-api-manager');
// find one by Id
component = await KeycloakManager.components.findOne({
    id: "component-id",
});

if (component) {
    console.log("Component found:", component);
} else {
    console.log("Component not found");
}

```

##### `function find(filter)`
The method retrieves a list of components in a Keycloak realm.
You can optionally filter components by their parent ID and/or provider type (e.g., LDAP user federation providers, authenticators, protocol mappers).

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - {builtin attribute}: To find components by builtin attributes such as name, id
    - max: A pagination parameter used to define the maximum number of components to return (limit).
    - first: A pagination parameter used to define the number of components to skip before starting to return results (offset/limit).
```js
const KeycloakManager = require('keycloak-api-manager');
// find by Id
component = await KeycloakManager.components.find({
    id: "component-id",
});

if (component) {
    console.log("Component found:", component);
} else {
    console.log("Component not found");
}

```


##### `function del(filter)`
The method deletes a specific component from a Keycloak realm.
Components include user federation providers (e.g., LDAP, Kerberos), authenticator providers, protocol mappers, or other pluggable extensions.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The unique ID of the component to delete.
```js
const KeycloakManager = require('keycloak-api-manager');
// del one by Id
await KeycloakManager.components.del({
    id: "component-id",
});

console.log("Component deleted successfully");
 ```


##### `function listSubComponents(filter)`
The method retrieves all sub-components of a given parent component in a Keycloak realm.
This is useful when working with hierarchical components, for example:
 - LDAP storage provider and protocol mappers as sub-components 
 - Authenticator factories with nested components

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the parent component. 
  - type: [optional] Filters sub-components by their provider type (e.g., "org.keycloak.protocol.mapper.ProtocolMapper").
```js
const KeycloakManager = require('keycloak-api-manager');
// del one by Id
const subComponents= await KeycloakManager.components.listSubComponents({
    id: "component-id", 
    type: "org.keycloak.protocol.mapper.ProtocolMapper",
});

console.log("Sub-components:", subComponents);
 ```


### `entity authenticationManagement`
The authenticationManagement entity provides methods to manage authentication flows, executions, and related settings within a Keycloak realm.
ìThese operations let you:
- Create and manage authentication flows (e.g., browser flow, direct grant flow). 
- Add and configure executions (authenticators, forms, conditions). 
- Update execution requirements (e.g., REQUIRED, ALTERNATIVE, DISABLED). 
- Handle form providers and authenticator configuration. 
- Manage bindings (set a realm’s browser flow, direct grant flow, etc.).

Common Use Cases:
- Defining custom login flows. 
- Adding 2FA authenticators (e.g., OTP, WebAuthn) to flows. 
- Configuring conditional executions (e.g., "only if user has role X"). 
- Assigning authentication flows to realm bindings (browser, reset credentials, etc.).

#### `entity authenticationManagement functions`

##### `function deleteRequiredAction(filter)`
The method deletes a required action from a Keycloak realm.
Required actions are tasks that users must complete after login, such as:
- Updating their password 
- Verifying their email 
- Configuring OTP 
- Accepting terms and conditions

By deleting a required action, it will no longer be available for assignment to users.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - alias: [required] The unique alias of the required action to delete (e.g., "UPDATE_PASSWORD").
```js
const KeycloakManager = require('keycloak-api-manager');
// del one by Id
const subComponents= await KeycloakManager.authenticationManagement.deleteRequiredAction({
    alias: "UPDATE_PROFILE",
});

console.log("Required action deleted successfully");

 ```


##### `function registerRequiredAction(actionRepresentation)`
The method registers a new required action in a Keycloak realm.
Required actions are tasks that users may be forced to perform during authentication (e.g., verify email, update password, configure OTP, or a custom scripted action).
This method is typically used after checking available actions via getUnregisteredRequiredActions.

**` -- @parameters -- `**
- actionRepresentation: The representation of the required action to register. 
  - providerId: [required] Unique ID of the required action (e.g., "terms_and_conditions"). 
  - name: [required] Display name of the required action. 
  - description : [optional] Human-readable description of the action. 
  - defaultAction: [optional] Whether the action should be enabled by default. 
  - enabled: [optional] Whether the action is active. 
  - priority: [optional] Determines the execution order among required actions. 
  - config: [optional] Extra configuration options (usually empty for built-in actions).
```js
const KeycloakManager = require('keycloak-api-manager');
// register required action
const subComponents= await KeycloakManager.authenticationManagement.registerRequiredAction({
    providerId: "terms_and_conditions",
    name: "Terms and Conditions",
    description: "Require user to accept terms before continuing",
    enabled: true,
    defaultAction: false,
    priority: 50,
    config: {}
});

console.log("Required action registered successfully");

 ```


##### `function getUnregisteredRequiredActions(filter)`
The method retrieves all available required actions that exist in Keycloak but are not yet registered in a given realm.
This is useful if you want to see which built-in or custom required actions can still be added to the realm (e.g., custom scripts, OTP setup, email verification).

```js
const KeycloakManager = require('keycloak-api-manager');
// get unregistered required actions
const unregistered= await KeycloakManager.authenticationManagement.getUnregisteredRequiredActions();

console.log("Unregistered required actions:", unregistered);

 ```

##### `function getRequiredActions(filter)`
The method retrieves all required actions that are currently registered and available in a given Keycloak realm.
Required actions are tasks that users may be required to perform during authentication, such as:
- Updating password 
- Verifying email 
- Configuring OTP 
- Accepting terms and conditions
- others...

```js
const KeycloakManager = require('keycloak-api-manager');
// get required actions
const requiredActions= await KeycloakManager.authenticationManagement.getRequiredActions();

console.log("Registered required actions:", requiredActions);

 ```

##### `function getRequiredActionForAlias(filter)`
The method retrieves a single required action in a Keycloak realm by its alias.
Required actions are tasks that users may be forced to complete during authentication, such as update password, verify email, or configure OTP.
This method is useful when you want details about a specific required action without listing all actions.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The unique alias of the required action to retrieve (e.g., "UPDATE_PASSWORD").
```js
const KeycloakManager = require('keycloak-api-manager');
// get required action for alias
const requiredAction= await KeycloakManager.authenticationManagement.getRequiredActionForAlias({
    alias:'UPDATE_PASSWORD'
});

console.log("Required action for alias details:", requiredAction);

 ```

##### `function lowerRequiredActionPriority(filter)`
The method lowers the priority of a registered required action in a Keycloak realm.
Priority determines the order in which required actions are executed for a user during authentication. Lowering the priority moves the action further down the execution order.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action to modify.
```js
const KeycloakManager = require('keycloak-api-manager');
// Lower required action priority
await KeycloakManager.authenticationManagement.lowerRequiredActionPriority({
    alias:'UPDATE_PASSWORD'
});

console.log("Required action priority lowered successfully");

 ```

##### `function raiseRequiredActionPriority(filter)`
The method raises the priority of a registered required action in a Keycloak realm.
Priority determines the order in which required actions are executed for a user during authentication. 
Raising the priority moves the action higher in the execution order, meaning it will be executed sooner.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action to modify.
```js
const KeycloakManager = require('keycloak-api-manager');
// raise required action priority
await KeycloakManager.authenticationManagement.raiseRequiredActionPriority({
    alias:'UPDATE_PASSWORD'
});

console.log("Required action priority raised successfully");

 ```

##### `function getRequiredActionConfigDescription(filter)`
The method retrieves the configuration description for a specific required action in a Keycloak realm.
This includes details about the configurable options available for that required action, such as which fields can be set, their types, and any default values.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action.
```js
const KeycloakManager = require('keycloak-api-manager');
// Get required action config description
const configDescription= await KeycloakManager.authenticationManagement.getRequiredActionConfigDescription({
    alias: "CONFIGURE_OTP",
});

console.log("Required action config description:", configDescription);

 ```


##### `function getRequiredActionConfig(filter)`
The method retrieves the current configuration for a specific required action in a Keycloak realm.
This allows you to see the settings that have been applied to a required action, such as OTP policies, password requirements, or any custom configurations.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action.
```js
const KeycloakManager = require('keycloak-api-manager');
// Get required action config
const config= await KeycloakManager.authenticationManagement.getRequiredActionConfig({
    alias: "CONFIGURE_OTP",
});

console.log("Required action current config:", config);

 ```

##### `function removeRequiredActionConfig(filter)`
The method deletes the configuration of a specific required action in a Keycloak realm.
This removes any customized settings for the action, effectively resetting it to its default behavior.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action.
```js
const KeycloakManager = require('keycloak-api-manager');
// Remove required action config
await KeycloakManager.authenticationManagement.removeRequiredActionConfig({
    alias: "CONFIGURE_OTP",
});

console.log("Required action configuration removed successfully");

 ```

##### `function updateRequiredAction(filter,actionRepresentation)`
The method updates an existing required action in a Keycloak realm.
Required actions are tasks that users may be required to perform during authentication, such as:
- Updating password 
- Verifying email 
- Configuring OTP 
- Accepting terms and conditions
- Others...

This method allows you to modify attributes such as enabled, defaultAction, priority, or configuration of a required action.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action to update.
- actionRepresentation: The updated representation of the required action. 
  - providerId: [required] Unique ID of the required action (alias). 
  - name: [required] Display name of the action. 
  - description: [optional] Human-readable description. 
  - enabled: [optional] Whether the action is active. 
  - defaultAction: [optional] Whether the action is assigned to new users by default. 
  - priority: [optional] Execution order among required actions. 
  - config: [optional] Extra configuration.
  
```js
const KeycloakManager = require('keycloak-api-manager');
// update required action
const requiredAction= await KeycloakManager.authenticationManagement.updateRequiredAction(
    { alias: "VERIFY_EMAIL" },
    {
        providerId: "VERIFY_EMAIL",
        name: "Verify Email",
        description: "Require user to verify their email before login",
        enabled: true,
        defaultAction: false,
        priority: 20,
        config: {}
    }
);

console.log("Required action updated successfully");

 ```

##### `function updateRequiredActionConfig(filter,actionConfigRepresentation)`
The method updates the configuration of a specific required action in a Keycloak realm.
This allows you to modify settings such as OTP policies, password requirements, or other parameters of built-in or custom required actions.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action to update.
- actionConfigRepresentation: The configuration object to update. 
  
  
```js
const KeycloakManager = require('keycloak-api-manager');
// update required action config
const requiredAction= await KeycloakManager.authenticationManagement.updateRequiredActionConfig(
    { alias: "VERIFY_EMAIL" },
    {
        max_auth_age: "301",
        otpPolicyDigits: ["8"],
        otpPolicyAlgorithm: ["HmacSHA256"]
    }
);

console.log("Required action configuration updated successfully");

 ```


##### `function getClientAuthenticatorProviders()`
The method retrieves all client authenticator providers available in a Keycloak realm.
Client authenticators are used to verify clients during authentication, such as:
- Client ID and secret authentication 
- JWT or X.509 certificate authentication 
- Custom client authenticators

This method is useful for configuring client authentication flows and assigning authenticators to specific clients.
 
  
```js
const KeycloakManager = require('keycloak-api-manager');
// Get client authenticator providers
const clientAuthenticators= await KeycloakManager.authenticationManagement.getClientAuthenticatorProviders();

console.log("Client authenticator providers:", clientAuthenticators);

 ```


##### `function getFormActionProviders()`
The method retrieves all form action providers available in a Keycloak realm.
Form action providers are used during authentication flows to perform specific actions in forms, such as:
- OTP validation 
- Password update 
- Terms and conditions acceptance 
- Custom scripted form actions

This method is useful for configuring authentication flows that require specific user interactions.

```js
const KeycloakManager = require('keycloak-api-manager');
// Get form action providers
const formActions= await KeycloakManager.authenticationManagement.getFormActionProviders();

console.log("Form action providers:", formActions);

 ```

##### `function getAuthenticatorProviders()`
The method retrieves all authenticator providers available in a Keycloak realm.
Authenticators are used in authentication flows to verify users or perform specific steps during login, such as:
- Username/password verification 
- OTP verification 
- WebAuthn authentication 
- Custom authenticators

This method is useful for configuring authentication flows and adding or replacing authenticators.

```js
const KeycloakManager = require('keycloak-api-manager');
// Get authenticator providers
const authenticators= await KeycloakManager.authenticationManagement.getAuthenticatorProviders();


console.log("Authenticator providers:", authenticators);

 ```


##### `function getFormProviders()`
The method retrieves all form providers available in a Keycloak realm.
Form providers are used in authentication flows to render or handle user-facing forms, such as:
- Login forms 
- Registration forms 
- OTP input forms 
- Terms and conditions acceptance

This method is useful for configuring authentication flows that require user interaction through forms.

```js
const KeycloakManager = require('keycloak-api-manager');
// Get form providers
const forms= await KeycloakManager.authenticationManagement.getFormProviders();



console.log("Form providers:", forms);

 ```

##### `function getFlows()`
The method retrieves all authentication flows in a Keycloak realm.
Authentication flows define the sequence of authenticators and required actions that users must complete during login or other authentication events.

This method allows you to inspect existing flows, including built-in flows like browser, direct grant, or registration, as well as custom flows.

```js
const KeycloakManager = require('keycloak-api-manager');
// Get flows
const flows= await KeycloakManager.authenticationManagement.getFlows();

console.log("Authentication flows:", flows);

 ```

##### `function createFlow(flowRepresentation)`
The method retrieves a specific authentication flow in a Keycloak realm by its id.
Authentication flows define the sequence of authenticators and required actions that users must complete during login or other authentication events.
This method is useful for inspecting or modifying a particular flow.

**` -- @parameters -- `**
- flowRepresentation: The representation of the new flow. A typical AuthenticationFlowRepresentation includes:
  - alias : [required] Human-readable alias for the flow.
  - providerId: [required] Type of flow ("basic-flow", "client-flow", etc.).
  - description: [optional] Description of the flow.  
  - topLevel: [optional] Whether this is a top-level flow (default: true). 
  - builtIn: [optional] Whether this is a built-in flow (default: false). 
  - authenticationExecutions: [optional] Executions to include in the flow.

```js
const KeycloakManager = require('keycloak-api-manager');
// Create flow
await KeycloakManager.authenticationManagement.createFlow({
    alias: "custom-browser-flow",
    description: "Custom browser authentication flow",
    providerId: "basic-flow",
    topLevel: true,
    builtIn: false,
    authenticationExecutions: []
});

console.log("Authentication flow created successfully");

 ```


##### `function updateFlow(filter, flowRepresentation)`
The method updates an existing authentication flow in a Keycloak realm.
This allows you to modify attributes such as the flow’s description, alias, top-level status, or other properties.

**` -- @parameters -- `**
filter: Parameter provided as a JSON object that accepts the following filter:
    - flowId: [required] The id of the source flow to update.
- flowRepresentation: The representation of the flow to update. A typical AuthenticationFlowRepresentation includes:
  - alias : [required] Human-readable alias for the flow.
  - providerId: [required] Type of flow ("basic-flow", "client-flow", etc.).
  - description: [optional] Description of the flow.  
  - topLevel: [optional] Whether this is a top-level flow (default: true). 
  - builtIn: [optional] Whether this is a built-in flow (default: false). 
  - authenticationExecutions: [optional] Executions to include in the flow.

```js
const KeycloakManager = require('keycloak-api-manager');
// Update flow
await KeycloakManager.authenticationManagement.updateFlow(
    { flowId:'flow-id' },
    {
        alias: "custom-browser-flow",
        description: "Custom browser authentication flow",
        providerId: "basic-flow",
        topLevel: true,
        builtIn: false,
        authenticationExecutions: []
    }
);

console.log("Flow updated successfully");

 ```


##### `function deleteFlow(filter)`
The method deletes an existing authentication flow in a Keycloak realm.
Deleting a flow removes it completely, including all its executions and subflows. 
This is typically used to remove custom flows that are no longer needed.

**` -- @parameters -- `**
filter: Parameter provided as a JSON object that accepts the following filter:
    - flowId: [required] The id of the source flow to update.

```js
const KeycloakManager = require('keycloak-api-manager');
// Delete flow
await KeycloakManager.authenticationManagement.deleteFlow({ 
    flowId:'flow-id' 
});

console.log("Authentication flow deleted successfully");

 ```

##### `function copyFlow(filter)`
The method duplicates an existing authentication flow in a Keycloak realm.
This is useful for creating a custom flow based on an existing built-in or custom flow, preserving all executions and subflows.

**` -- @parameters -- `**
- filter: Parameter provided as a JSON object that accepts the following filter:
  - flow: [required] The alias of the source flow to copy. 
  - newName: [required] The alias of the new copied flow.

```js
const KeycloakManager = require('keycloak-api-manager');
// Copy flow
await KeycloakManager.authenticationManagement.copyFlow({
    flow: "browser",
    newName: "custom-browser-flow"
});

console.log("Authentication flow copied successfully");

 ```


##### `function getFlow(filter)`
The method retrieves a specific authentication flow in a Keycloak realm by its id.
Authentication flows define the sequence of authenticators and required actions that users must complete during login or other authentication events.
This method is useful for inspecting or modifying a particular flow.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - flowId: [required] The id of the authentication flow to retrieve

```js
const KeycloakManager = require('keycloak-api-manager');
// Get flows
const flow= await KeycloakManager.authenticationManagement.getFlow({
    flowId:'flow.id'
});

console.log("Authentication flow:", flow);

 ```

##### `function getExecutions(filter)`
The method retrieves all authentication executions for a specific authentication flow in a Keycloak realm.
Executions define the individual steps or actions within a flow, such as:
- Username/password verification 
- OTP validation 
- Terms acceptance 
- Subflows

This method is useful to inspect or modify the steps of a flow.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - flow: [required] The alias of the authentication flow whose executions you want to retrieve.

```js
const KeycloakManager = require('keycloak-api-manager');
// Get executions
const executions= await KeycloakManager.authenticationManagement.getExecutions({
    flow:'browser'
});

console.log("Authentication flow executions:", executions);

 ```



##### `function addExecutionToFlow(filter)`
The method adds a new execution (step) to an existing authentication flow in a Keycloak realm.
Executions define the individual actions or authenticators in a flow, such as username/password verification, OTP validation, or custom authenticators.
This method allows you to extend a flow with additional steps or subflows.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - flow: [required] The alias of the authentication flow to which the execution will be added. 
    - provider: [required] The authenticator or subflow to add (e.g., "auth-otp-form").
    - requirement: [optional] "REQUIRED" | "ALTERNATIVE" | "DISABLED"
    - priority: [optional] Number representing the execution order 
    - authenticatorFlow: [optional] Boolean indicating if the execution is a nested flow

```js
const KeycloakManager = require('keycloak-api-manager');
// add execution to flow
await KeycloakManager.authenticationManagement.addExecutionToFlow({
    flow: "browser",
    provider: "auth-otp-form",
});

console.log("Execution added to authentication flow successfully");

 ```

##### `function addFlowToFlow(filter)`
The method adds an existing authentication flow as a subflow to another authentication flow in a Keycloak realm.
This allows you to nest flows, creating complex authentication sequences where one flow can call another as a step.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - flow: [required] The alias of the parent authentication flow. 
    - alias: [required] The alias (name) of the new subflow.
    - type: [required] Type of the flow (e.g., "basic-flow", "client-flow").
    - provider: [required] The provider ID of the flow (e.g., "registration-page-form").
    - description: [optional] A human-readable description of the subflow.

```js
const KeycloakManager = require('keycloak-api-manager');
// add flow to flow
const flow= await KeycloakManager.authenticationManagement.addFlowToFlow({
    flow: "browser",
    alias: "subFlow",
    description: "",
    provider: "registration-page-form",
    type: "basic-flow",
});

console.log("Subflow added:", flow);

 ```


##### `function updateExecution(filter,executionRepresentation)`
The method updates an existing execution (step) within an authentication flow in a Keycloak realm.
Executions are individual authenticators or subflows within a flow, and this method allows you to modify their requirement, priority, or other settings.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - flow: [required] The alias of the authentication flow containing the execution.
- executionRepresentation: The updated execution object. Typical fields in AuthenticationExecutionInfoRepresentation:
  - id: [required] The ID of the execution. 
  - requirement: [optional] "REQUIRED" | "ALTERNATIVE" | "DISABLED"
  - priority: [optional] Execution order within the flow 
  - authenticator: [optional] Authenticator ID (if changing the execution type)
  - authenticatorFlow: [optional] Whether the execution is a nested flow
    

```js
const KeycloakManager = require('keycloak-api-manager');
// Update execution
await KeycloakManager.authenticationManagement.updateExecution(
    { flow: "browser" },
    {
        id: "exec1-abc",
        requirement: "ALTERNATIVE",
        priority: 10,
    }
);

console.log("Execution updated successfully");

 ```


##### `function delExecution(filter)`
The method deletes an existing execution (step) from an authentication flow in a Keycloak realm.
Executions are individual authenticators or subflows within a flow, and this method removes them completely from the flow.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the execution to delete.
    

```js
const KeycloakManager = require('keycloak-api-manager');
// Dell execution
await KeycloakManager.authenticationManagement.delExecution({
    id: "exececution-id"
});

console.log("Execution deleted successfully");

 ```


##### `function raisePriorityExecution(filter)`
The method increases the priority of an execution within an authentication flow in a Keycloak realm.
Increasing the priority moves the execution earlier in the flow sequence, affecting the order in which authenticators or subflows are executed.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] he ID of the execution whose priority will be raised.
    

```js
const KeycloakManager = require('keycloak-api-manager');
// raise priority execution
await KeycloakManager.authenticationManagement.raisePriorityExecution({
    id: "exececution-id"
});

console.log("Execution priority raised successfully");

 ```

##### `function lowerPriorityExecution(filter)`
The method decreases the priority of an execution within an authentication flow in a Keycloak realm.
Lowering the priority moves the execution later in the flow sequence, affecting the order in which authenticators or subflows are executed.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] he ID of the execution whose priority will be lowered.
    

```js
const KeycloakManager = require('keycloak-api-manager');
// lower priority execution
await KeycloakManager.authenticationManagement.lowerPriorityExecution({
    id: "exececution-id"
});

console.log("Execution priority lowered successfully");
 ```


##### `function createConfig(filter)`
The method creates a configuration for a specific execution (step) within an authentication flow in a Keycloak realm.
Configurations allow you to customize the behavior of an authenticator or required action, such as OTP policies, password requirements, or custom parameters.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the execution or required action to configure. 
    - alias: [required] The alias (name) of the configuration.
    - config: [optional] The payload can also include a config object with key-value pairs for configuration parameters.
    

```js
const KeycloakManager = require('keycloak-api-manager');
// Create config
const config= await KeycloakManager.authenticationManagement.createConfig({
    id: 'execution-id',
    alias: "test",
});

console.log("Configuration created:", config);
```


##### `function getConfig(filter)`
The method retrieves the configuration of a specific required action or execution within an authentication flow in a Keycloak realm.
Configurations define additional settings for authenticators or required actions, such as OTP policies, password rules, or custom parameters.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the execution or required action whose configuration you want to retrieve.
    

```js
const KeycloakManager = require('keycloak-api-manager');
// Get config
const config= await KeycloakManager.authenticationManagement.getConfig({
    id: 'execution-id',
});


console.log("Configuration retrieved:", config);
```


##### `function updateConfig(filter)`
The method updates the configuration of a specific required action or execution within an authentication flow in a Keycloak realm.
This allows you to modify existing settings, such as OTP policies, password rules, or any custom parameters, without creating a new configuration.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the existing configuration.
  - config: [required] Key-value pairs representing the new configuration parameters.
    

```js
const KeycloakManager = require('keycloak-api-manager');
// Update config
await KeycloakManager.authenticationManagement.updateConfig({
    id: 'config-id',
    config:{
        defaultProvider: "stringa"
    }
});


console.log("Configuration updated successfully");
```


##### `function delConfig(filter)`
The method deletes a configuration associated with a specific required action or execution within an authentication flow in a Keycloak realm.
This is useful for removing obsolete or unwanted settings from a required action or execution.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - id: [required] The ID of the existing configuration.
    

```js
const KeycloakManager = require('keycloak-api-manager');
// del config
await KeycloakManager.authenticationManagement.delConfig({
    id: 'config-id',
});


console.log("Configuration deleted successfully");
```


##### `function getConfigDescription(filter)`
The method retrieves the configuration description for a specific authenticator or required action in a Keycloak realm.

This provides metadata and guidance about the configuration options available for the authenticator, such as:
- Names of configuration properties 
- Types (string, boolean, list, etc.)
- Default values 
- Help texts or descriptions

This is useful for dynamically generating forms for configuring required actions or authenticators.

**` -- @parameters -- `**
- filter: parameter provided as a JSON object that accepts the following filter:
  - providerId: [required] The ID of the authenticator or required action whose configuration description you want to retrieve.
    

```js
const KeycloakManager = require('keycloak-api-manager');
// Get config description
const configDescription= await KeycloakManager.authenticationManagement.getConfigDescription({
    providerId: 'provider-id',
});


console.log("Configuration description:", configDescription);
```

---

## 🔄 Recent Updates & Compatibility Notes

### Version 3.2.0+ - Improvements and Bug Fixes

#### New Features
- **`stop()` method**: Added a new method to cleanly stop the Keycloak Admin Client by clearing the automatic token refresh interval. This is essential for test environments and CLI scripts to allow the Node.js process to exit gracefully.
  ```js
  KeycloakManager.stop();
  ```

- **Token refresh interval now uses `unref()`**: The automatic token refresh interval is now unreferenced, allowing your Node.js process to exit even if the interval is still active, without needing to call `stop()` explicitly in simple scripts.

#### Bug Fixes & Normalizations

**Clients Handler:**
- **`getSessionCount()` normalization**: Fixed inconsistent return values. The method now always returns a number directly instead of potentially returning an object with a `.count` property. This ensures consistent behavior across different Keycloak versions.
  ```js
  // Before: sessionCount could be { count: 5 } or 5
  // After: sessionCount is always 5
  const count = await KeycloakManager.clients.getSessionCount({ id: clientId });
  console.log(`Active sessions: ${count}`); // Always works
  ```

- **`getOfflineSessionCount()` normalization**: Same fix as `getSessionCount()` - now consistently returns a number.

- **`addClientScopeMappings()` and `delClientScopeMappings()` parameter fix**: These methods now properly accept the `roles` parameter as a second argument, making the API more consistent and easier to use.
  ```js
  // Correct usage
  await KeycloakManager.clients.addClientScopeMappings(
    { id: targetClientId, client: sourceClientId },
    [{ id: roleId, name: roleName }]  // roles array as second parameter
  );
  ```

- **Direct API fallback for specific Authorization Services methods**: Some `@keycloak/keycloak-admin-client` methods can fail with normalization/response issues depending on Keycloak version. To guarantee reliable behavior, the following methods now use direct Keycloak Admin REST API calls internally:
    - `clients.listAllResourcesByScope()`
    - `clients.listScopesByResource()`
    - `clients.importResource()`
  
    This keeps the public API unchanged while avoiding known library-level compatibility bugs.

**Users Handler:**
- **`countGroups()` normalization**: this method now consistently returns a numeric value.
- **`listOfflineSessions()` client ID compatibility**: public `clientId` values are resolved to internal UUID when needed.
- **`getUserStorageCredentialTypes(filter)` and `updateCredentialLabel(filter,label)` signature fix**: both methods now expose the correct parameters and work as expected.

**Groups Handler:**
- **`create(groupRepresentation)` parent support**: when `parentId` is provided, the group is correctly created as a child group.
- **`count()` normalization**: this method now consistently returns a numeric value.

#### Testing
- Comprehensive test suite added for all handlers (AuthenticationManagement, Clients, ClientScopes, Components, Groups, IdentityProviders, Realms, Roles, Users)
- Tests include direct Keycloak Admin API verification to ensure library operations are correctly executed
- Test coverage includes edge cases and error handling

These improvements ensure better compatibility across different Keycloak versions and more predictable behavior in production environments.

---

## 📝 License

This project is licensed under the MIT License.

Copyright (c) 2025 CRS4, aromanino, gporruvecchio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙋‍♂️ Contributions

Contributions, issues and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

---

## 👨‍💻 Maintainer

Developed and maintained by [CRS4 Microservice Core Team ([cmc.smartenv@crs4.it](mailto:cmc.smartenv@crs4.it))] – feel free to reach out for questions or suggestions.

Design and development
------
Alessandro Romanino ([a.romanino@gmail.com](mailto:a.romanino@gmail.com))<br>
Guido Porruvecchio ([guido.porruvecchio@gmail.com](mailto:guido.porruvecchio@gmail.com))


