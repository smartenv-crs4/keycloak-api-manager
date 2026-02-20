# OIDC Methods Migration Plan - keycloak-api-manager

## 🚀 Current Status: v6.0.0 - MIGRATION RELEASED

✅ **OIDC Methods Deprecated:** All OIDC authentication methods are now marked `@deprecated` in v6.0.0.

✅ **keycloak-express-middleware v6.1.0 Released:** OIDC methods now available in middleware package with full test coverage.

📅 **Removal Timeline:**
- **v6.0.0** (NOW) - Methods work but marked @deprecated
- **v7.0.0** (FUTURE) - Methods will be permanently removed

---

## Overview

L'architettura prevede una **migrazione pianificata** dei metodi OIDC (`auth()`, `login()`, `loginPKCE()`) da `keycloak-api-manager` a `keycloak-express-middleware`.

## Current State (v5.0.8)

**In keycloak-api-manager:**
- ✅ `auth(credentials)` - OIDC token endpoint wrapper
- ✅ `login(credentials)` - Generic token grant helper
- ✅ `generateAuthorizationUrl(options)` - PKCE URL generator
- ✅ `loginPKCE(credentials)` - PKCE token exchange

## Current State (v6.0.0) - NOW

**Status Changes in keycloak-api-manager:**
- ⚠️ `auth(credentials)` - Marked @deprecated
- ⚠️ `login(credentials)` - Marked @deprecated
- ⚠️ `generateAuthorizationUrl(options)` - Marked @deprecated
- ⚠️ `loginPKCE(credentials)` - Marked @deprecated

✅ Methods **still work** but show deprecation warnings in JSDoc and IDE.

**Status in keycloak-express-middleware v6.1.0:**
- ✅ `generateAuthorizationUrl(options)` - Fully implemented & tested
- ✅ `login(credentials)` - Fully implemented & tested
- ✅ `loginPKCE(credentials)` - Fully implemented & tested
- ✅ All 21 tests passing

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
- [x] Integrate OIDC methods into keycloak-express-middleware v6.1.0
- [x] Release keycloak-express-middleware v6.1.0 to npm

**Status:** ✅ COMPLETE & RELEASED

### Phase 2: ✅ DONE (Done)
- [x] Mark methods as @deprecated in keycloak-api-manager index.js
- [x] Update README with deprecation notices
- [x] Update API documentation with deprecation notices
- [x] Add migration guide in PKCE-Login-Flow docs
- [x] Release keycloak-api-manager v6.0.0

**Status:** ✅ COMPLETE - v6.0.0 released with @deprecated warnings

### Phase 3: TODO (Future - v7.0.0)
- [ ] Remove OIDC methods from keycloak-api-manager
- [ ] Release keycloak-api-manager v7.0.0 (breaking change)
- [ ] Update all documentation to reference keycloak-express-middleware only

**Timeline:** TBD based on user feedback and adoption

---

## What You Need to Know

### For Current Users (v5.0.8 or earlier)

**Action Required:** Migrate to keycloak-express-middleware before v7.0.0.

**Timeline:** v6.0.0 is deprecated (warnings only), v7.0.0 will remove methods entirely.

**Steps:**
1. Install keycloak-express-middleware v6.1.0+
2. Replace method calls (see examples below)
3. Test thoroughly
4. Deploy before v7.0.0 is released

### For New Projects

**Action Required:** Do NOT use OIDC methods from keycloak-api-manager.

**Recommendation:** Use keycloak-express-middleware v6.1.0+ for all user authentication.

---

## NPM Packages

### keycloak-api-manager

| Version | OIDC Methods | Status |
|---------|------------|--------|
| v5.0.8 | Supported | Legacy (should migrate) |
| v6.0.0 | Deprecated | Current (shows warnings) |
| v7.0.0 | Removed | Future (no OIDC methods) |

**NPM:** https://www.npmjs.com/package/keycloak-api-manager

### keycloak-express-middleware

| Version | OIDC Methods | Status |
|---------|------------|--------|
| < 6.1.0 | Not available | Legacy |
| v6.1.0+ | Available | Current - RECOMMENDED |

**NPM:** https://www.npmjs.com/package/keycloak-express-middleware

**GitHub:** https://github.com/smartenv-crs4/keycloak-express-middleware

---

### `auth(credentials)` - Generic OIDC Token Grant (DEPRECATED)

```javascript
// ⚠️ DEPRECATED - Don't use in new code
const token = await KeycloakManager.auth({
  grant_type: 'password',
  username: 'user',
  password: 'pass'
});
```

**Migration Path:**
```javascript
// ✅ NEW - Use keycloak-express-middleware instead
const token = await keycloakMiddleware.login({
  grant_type: 'password',
  username: 'user',
  password: 'pass'
});
```

---

### `login(credentials)` - Preferred Alias (DEPRECATED)

```javascript
// ⚠️ DEPRECATED - Don't use in new code
const token = await KeycloakManager.login({
  grant_type: 'client_credentials'
});
```

**Migration Path:**
```javascript
// ✅ NEW - Use keycloak-express-middleware instead
const token = await keycloakMiddleware.login({
  grant_type: 'client_credentials'
});
```

---

### `generateAuthorizationUrl(options)` - PKCE URL Generator (DEPRECATED)

```javascript
// ⚠️ DEPRECATED - Don't use in new code
const pkceFlow = KeycloakManager.generateAuthorizationUrl({
  redirect_uri: 'https://app/callback'
});
```

**Migration Path:**
```javascript
// ✅ NEW - Use keycloak-express-middleware instead
const pkceFlow = keycloakMiddleware.generateAuthorizationUrl({
  redirect_uri: 'https://app/callback'
});
```

---

### `loginPKCE(credentials)` - PKCE Token Exchange (DEPRECATED)

```javascript
// ⚠️ DEPRECATED - Don't use in new code
const token = await KeycloakManager.loginPKCE({
  code: req.query.code,
  redirect_uri: 'https://app/callback',
  code_verifier: req.session.verifier
});
```

**Migration Path:**
```javascript
// ✅ NEW - Use keycloak-express-middleware instead
const token = await keycloakMiddleware.loginPKCE({
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

---

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
