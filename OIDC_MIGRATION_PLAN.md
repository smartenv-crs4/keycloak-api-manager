# OIDC Methods Migration Plan - keycloak-api-manager

## Overview

L'architettura prevede una **migrazione pianificata** dei metodi OIDC (`auth()`, `login()`, `loginPKCE()`) da `keycloak-api-manager` a `keycloak-express-middleware`.

## Current State (v5.0.8)

**In keycloak-api-manager:**
- ✅ `auth(credentials)` - OIDC token endpoint wrapper
- ✅ `login(credentials)` - Generic token grant helper
- ✅ `generateAuthorizationUrl(options)` - PKCE URL generator
- ✅ `loginPKCE(credentials)` - PKCE token exchange

## Why This Migration?

### Separation of Concerns

```
keycloak-api-manager (Admin API Management)
├── configure()          ← Admin setup
├── Users.find()        ← Admin operations
├── Realms.create()     ← Admin operations
└── ❌ login() / auth()   ← Should NOT be here!

keycloak-express-middleware (User Authentication)
├── protectMiddleware()  ← Route protection
├── Express integration  ← Session, cookies
└── ✅ generateAuthorizationUrl()  ← Belongs here
└── ✅ login()           ← Belongs here
└── ✅ loginPKCE()       ← Belongs here
```

### Why Middleware is Better

1. **Natural Context:** Express app has sessions, cookies, redirects
2. **No Admin Context:** Users don't need admin API management
3. **Tighter Integration:** Works with middleware ecosystem
4. **Cleaner Namespaces:** Each package has clear responsibilities

## Migration Timeline

### Phase 1: ✅ DONE (Now)
- [x] Create ready-to-integrate files in middleware (`oidc-methods.js`)
- [x] Write comprehensive tests (21 tests, all passing)
- [x] Document integration guide
- [x] Commit to middleware repo

**Status:** Ready for integration into `keycloak-express-middleware`

### Phase 2: Manual Integration (When You're Ready)
- [ ] Integrate `oidc-methods.js` into middleware `index.js`
- [ ] Run tests to verify
- [ ] Release `keycloak-express-middleware v6.1.0`

**Your Action:** Follow `keycloak-express-middleware/OIDC_INTEGRATION_GUIDE.md`

### Phase 3: Deprecation in keycloak-api-manager (v6.0.0)

Once middleware integration is confirmed:

1. **Mark methods as deprecated** in index.js:
   ```javascript
   exports.auth = async function auth(credentials = {}) {
       console.warn('⚠️ DEPRECATED: auth() is deprecated in v6.0. ' +
           'Use keycloak-express-middleware.login() instead. ' +
           'See: https://...');
       return requestOidcToken(credentials);
   };
   ```

2. **Update documentation:**
   - Add migration guide in README
   - Mark OIDC methods as deprecated in API docs
   - Link to middleware documentation

3. **Release v6.0.0:**
   - Update package.json version
   - Add breaking change notice
   - Include migration guide in release notes

4. **Future (v7.0.0):**
   - Optionally remove these methods entirely
   - Keep at least 1 major version for migration

## Current keycloak-api-manager Methods

### `auth(credentials)` - Generic OIDC Token Grant
```javascript
// Still works, but should use middleware
const token = await KeycloakManager.auth({
  grant_type: 'password',
  username: 'user',
  password: 'pass'
});
```

**Migration Path:**
```javascript
// Instead use middleware
const token = await keycloakMiddleware.login({
  grant_type: 'password',
  username: 'user',
  password: 'pass'
});
```

### `login(credentials)` - Preferred Alias
```javascript
// Currently the preferred way in API manager
const token = await KeycloakManager.login({
  grant_type: 'client_credentials'
});
```

**Migration Path:**
```javascript
// Move to middleware
const token = await keycloakMiddleware.login({
  grant_type: 'client_credentials'
});
```

### `generateAuthorizationUrl(options)` - PKCE URL Generator
```javascript
// Generates OAuth2 authorization URL + PKCE pair
const pkceFlow = KeycloakManager.generateAuthorizationUrl({
  redirect_uri: 'https://app/callback'
});
```

**Migration Path:**
```javascript
// Move to middleware
const pkceFlow = keycloakMiddleware.generateAuthorizationUrl({
  redirect_uri: 'https://app/callback'
});
```

### `loginPKCE(credentials)` - PKCE Token Exchange
```javascript
// Exchange auth code for tokens in callback
const token = await KeycloakManager.loginPKCE({
  code: req.query.code,
  redirect_uri: 'https://app/callback',
  code_verifier: req.session.verifier
});
```

**Migration Path:**
```javascript
// Move to middleware
const token = await keycloakMiddleware.loginPKCE({
  code: req.query.code,
  redirect_uri: 'https://app/callback',
  code_verifier: req.session.verifier
});
```

## What Stays in keycloak-api-manager

✅ **These remain unchanged forever:**
- `configure(credentials)` - Admin authentication
- `setConfig(overrides)` - Configuration management
- `getToken()` - Get current admin token
- `stop()` - Cleanup
- **All handlers:** `users`, `realms`, `clients`, `groups`, `roles`, etc.

The package remains the **dedicated Admin API Manager** - exactly what it should be.

## Migration Guide for Users (TBD)

When ready, we'll publish:

```markdown
# Migrating OIDC Methods from keycloak-api-manager to keycloak-express-middleware

## Version Support

| Method | deprecated | removed | alternative |
|--------|-----------|---------|-------------|
| `auth()` | v6.0.0 | v7.0.0 | middleware.login() |
| `login()` | v6.0.0 | v7.0.0 | middleware.login() |
| `generateAuthorizationUrl()` | v6.0.0 | v7.0.0 | middleware.generateAuthorizationUrl() |
| `loginPKCE()` | v6.0.0 | v7.0.0 | middleware.loginPKCE() |

## Migration Steps

1. Install/update middleware
2. Replace method calls
3. Update imports
4. Test
```

## Next Actions

### You Should Do:
1. Review `keycloak-express-middleware/OIDC_INTEGRATION_GUIDE.md`
2. Decide if you want to integrate manually or have me automate it
3. Once middleware is ready, let me know

### I Will Do (When You Say):
1. Integrate methods into middleware `index.js`
2. Release `keycloak-express-middleware v6.1.0`
3. Deprecate in `keycloak-api-manager v6.0.0`
4. Create migration guide
5. Update all documentation

## Questions?

- How should we handle the transition period?
- Do we support both packages simultaneously?
- Timeline for full migration?
- Any concerns about the approach?
