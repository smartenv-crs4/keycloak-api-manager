# PKCE Login Flow Guide

⚠️ **DEPRECATION NOTICE (v6.0.0):** This guide describes PKCE implementation using **deprecated methods** in keycloak-api-manager. 

**👉 NEW APPROACH (Recommended):** For user authentication flows, use [`keycloak-express-middleware v6.1.0+`](https://github.com/smartenv-crs4/keycloak-express-middleware) instead. The middleware package provides a more integrated and Express-native implementation of PKCE flows.

**See:** Migration instructions at the end of this guide.

---

This guide walks you through implementing OAuth2 Authorization Code + PKCE flow in your application using Keycloak and the keycloak-api-manager library.

## Overview

PKCE (Proof Key for Code Exchange) is the modern, secure way for browser-based and mobile applications to authenticate users through Keycloak. Unlike the legacy resource owner password grant, PKCE:

- ✅ Never exposes user passwords to your backend
- ✅ Works seamlessly with Keycloak's authorization server
- ✅ Provides built-in CSRF protection via state parameter
- ✅ Protects against authorization code interception attacks
- ✅ Is the OAuth2 standard for public clients

## Flow Diagram

```
┌─────────────┐                                    ┌──────────────┐
│   Browser   │                                    │  Keycloak    │
│  (User)     │                                    │   Server     │
└──────┬──────┘                                    └──────────────┘
       │                                                  ▲
       │  1. Click "Login"                               │
       ├─────────────────────────────────────────────────►
       │                                                  │
       │  2. Verify state, generate PKCE pair             │
       │  3. Redirect to Keycloak /auth with              │
       │     code_challenge & state                       │
       │                                                  │
       │◄─────────────────────────────────────────────────┤
       │     Keycloak login page                          │
       │                                                  │
       │  4. User enters credentials                      │
       ├─────────────────────────────────────────────────►
       │                                                  │
       │  5. Verify credentials                           │
       │  6. Redirect to /callback with                   │
       │     code + state                                 │
       │                                                  │
       │◄─────────────────────────────────────────────────┤
       │  code=abc123&state=xyz789                        │
       │                                                  │
       │  7. Exchange code for token                      │
       │  (with code_verifier)                            │
       │──────────────────────────────────────────────────►
       │     POST /auth/callback backend                  │
       │                                                  │
       │                                    ┌────────────┐
       │                                    │  Backend   │
       │                                    │  (Node.js) │
       │                                    └────────────┘
       │                                           ▲
       │                                           │
       │                                           │
       │                          8. Call loginPKCE()
       │                          with code, verifier
       │                                           │
       │                      Keycloak validates
       │                      code_challenge vs
       │                      code_verifier
       │                                           │
       │                     9. Return access token
       │                        (JWT)
       │                                           │
       │  10. Set secure HttpOnly cookie           │
       │◄──────────────────────────────────────────┤
       │  (with access_token + refresh_token)      │
       │                                           │
       │  Browser is now authenticated!            │
       │                                           │
```

## Step-by-Step Implementation

### Step 1: Generate Authorization URL

When the user clicks "Login", use `generateAuthorizationUrl()` from keycloak-api-manager to generate the PKCE pair and authorization URL:

```javascript
const pkceFlow = KeycloakManager.generateAuthorizationUrl({
  redirect_uri: `${process.env.APP_URL}/auth/callback`,
  scope: 'openid profile email' // optional, defaults to 'openid profile email'
});

// Result contains:
// {
//   authUrl: 'https://keycloak.example.com/realms/my-realm/protocol/openid-connect/auth?...',
//   state: 'random_state_value',
//   codeVerifier: 'random_verifier_value'
// }
```

Store the `state` and `codeVerifier` in your session, then redirect the user to the authorization URL:

```javascript
app.get('/auth/login', (req, res) => {
  const pkceFlow = KeycloakManager.generateAuthorizationUrl({
    redirect_uri: `${process.env.APP_URL}/auth/callback`
  });
  
  // Store state and verifier in session for callback validation
  req.session.pkce_state = pkceFlow.state;
  req.session.pkce_verifier = pkceFlow.codeVerifier;
  
  // Redirect user to Keycloak login
  res.redirect(pkceFlow.authUrl);
});
```

**Why this works:**
- `generateAuthorizationUrl()` handles all PKCE complexity internally
- Returns a ready-to-use authorization URL
- State parameter provides CSRF protection
- Code verifier is stored server-side (never exposed to client)

When Keycloak redirects back with the authorization code, you exchange it for an access token using `loginPKCE()`:

```javascript
// User callback after Keycloak login
app.get('/auth/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    // 1. Validate state parameter (CSRF protection)
    if (state !== req.session.pkce_state) {
      return res.status(400).send('Invalid state parameter - CSRF attack detected');
    }
    
    // 2. Check for authorization errors
    if (error) {
      return res.status(400).send(`Authorization failed: ${error}`);
    }
    
    // 3. Retrieve stored verifier from session
    const code_verifier = req.session.pkce_verifier;
    if (!code_verifier) {
      return res.status(400).send('PKCE verifier not found in session');
    }
    
    // 4. Exchange code for token using keycloak-api-manager
    const tokenResponse = await KeycloakManager.loginPKCE({
      code,
      redirect_uri: `${process.env.APP_URL}/auth/callback`,
      code_verifier
    });
    
    // 5. Set secure HTTPOnly cookie with access token
    res.cookie('access_token', tokenResponse.access_token, {
      httpOnly: true,        // Prevent XSS access
      secure: true,          // HTTPS only
      sameSite: 'strict',    // CSRF protection
      maxAge: tokenResponse.expires_in * 1000
    });
    
    // Also store refresh token separately
    res.cookie('refresh_token', tokenResponse.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // 6. Clear sensitive session data
    delete req.session.pkce_verifier;
    delete req.session.pkce_state;
    
    // Redirect to application home
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Token exchange failed:', error);
    res.status(500).send('Authentication failed');
  }
});
```

**Security checks in this step:**
- ✅ Validate `state` matches what we stored (CSRF protection)
- ✅ Check for authorization errors
- ✅ Verify `code_verifier` exists in session
- ✅ Exchange code with verifier (proves we initiated the flow)
- ✅ Store token in HttpOnly cookie (prevents XSS theft)
- ✅ Clear sensitive session data

## Complete Working Example

Here's a complete Express.js application with PKCE flow:

```javascript
const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const KeycloakManager = require('keycloak-api-manager');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, secure: false } // Set secure: true in production
}));

// Initialize Keycloak Manager
KeycloakManager.configure({
  baseUrl: process.env.KEYCLOAK_URL,
  realmName: process.env.KEYCLOAK_REALM,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
  grantType: 'client_credentials'
});

// Routes
app.get('/auth/login', (req, res) => {
  // Generate PKCE pair and authorization URL
  const pkceFlow = KeycloakManager.generateAuthorizationUrl({
    redirect_uri: `${process.env.APP_URL}/auth/callback`,
    scope: 'openid profile email'
  });
  
  // Store state and verifier in session (server-side only!)
  req.session.pkce_state = pkceFlow.state;
  req.session.pkce_verifier = pkceFlow.codeVerifier;
  
  // Redirect user to Keycloak login
  res.redirect(pkceFlow.authUrl);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    // Validate state (CSRF protection)
    if (state !== req.session.pkce_state) {
      return res.status(400).send('Invalid state parameter');
    }
    
    if (error) {
      return res.status(400).send(`Authorization failed: ${error}`);
    }
    
    const code_verifier = req.session.pkce_verifier;
    if (!code_verifier) {
      return res.status(400).send('PKCE verifier not found');
    }
    
    // Exchange code for token (client_id + client_secret from configure())
    const tokenResponse = await KeycloakManager.loginPKCE({
      code,
      redirect_uri: `${process.env.APP_URL}/auth/callback`,
      code_verifier
    });
    
    // Set secure cookies
    res.cookie('access_token', tokenResponse.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: tokenResponse.expires_in * 1000
    });
    
    res.cookie('refresh_token', tokenResponse.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    // Clear sensitive data
    delete req.session.pkce_verifier;
    delete req.session.pkce_state;
    
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Token exchange failed:', error);
    res.status(500).send('Authentication failed');
  }
});

app.get('/dashboard', (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.redirect('/auth/login');
  }
  
  try {
    const decoded = jwt.decode(token); // Or verify with public key in production
    res.send(`Welcome, ${decoded.preferred_username}!`);
  } catch (error) {
    res.redirect('/auth/login');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  req.session.destroy();
  res.redirect('/');
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Login at http://localhost:3000/auth/login');
});
```

## Environment Variables

```bash
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=my-app
KEYCLOAK_CLIENT_SECRET=your-client-secret
APP_URL=http://localhost:3000
SESSION_SECRET=your-session-secret
```

## Security Best Practices

### ✅ DO

- ✅ Store PKCE verifier in **secure server-side session**, never in cookies
- ✅ Validate state parameter every time (CSRF protection)
- ✅ Use **HttpOnly cookies** for tokens (prevents XSS theft)
- ✅ Use **Secure flag** on cookies (HTTPS only in production)
- ✅ Use **SameSite=strict** on cookies (CSRF protection)
- ✅ Clear sensitive data from session after token exchange
- ✅ Use SHA256 for code_challenge (`S256` method)
- ✅ Generate cryptographically secure random values (use `crypto` module)

### ❌ DON'T

- ❌ Store code_verifier in browser (localStorage, sessionStorage, etc.)
- ❌ Skip state parameter validation
- ❌ Use weak random generators
- ❌ Expose tokens in URL parameters
- ❌ Store tokens in browser storage (vulnerable to XSS)
- ❌ Use plain HTTP (always HTTPS in production)
- ❌ Reuse PKCE pairs or state values

## Common Issues & Troubleshooting

### "Invalid state parameter - CSRF attack detected"

**Cause:** Browser tabs have separate sessions, or cookies are not being persisted.

**Solution:**
```javascript
// Ensure session cookies are sent with redirects
app.use(session({
  cookie: { 
    httpOnly: true, 
    secure: true,
    sameSite: 'lax'  // Allow cross-site for redirects
  }
}));
```

### "PKCE verifier not found in session"

**Cause:** Session was lost between `/auth/login` and `/auth/callback`.

**Debug:**
```javascript
app.get('/auth/callback', (req, res) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  // ... rest of callback
});
```

### "Invalid code_challenge"

**Cause:** The code_challenge calculated by Keycloak doesn't match our SHA256 hash.

**Verify:** The `createPkcePair()` function uses S256 (SHA256). Ensure code_challenge is:
1. Lowercase base64url-encoded
2. Derived from code_verifier with SHA256, not any other hash

### Access token not being set

**Cause:** `loginPKCE()` threw an error that wasn't caught, or response format is different.

**Debug:**
```javascript
const tokenResponse = await KeycloakManager.loginPKCE({...});
console.log('Token response:', JSON.stringify(tokenResponse, null, 2));
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 300,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "scope": "openid profile email"
}
```

## Production Considerations

### 1. Session Storage

For production, use Redis instead of in-memory sessions:

```javascript
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

const redisClient = createClient();
redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));
```

### 2. Token Refresh

Access tokens expire. Implement refresh token logic:

```javascript
function isTokenExpiring(token) {
  const decoded = jwt.decode(token);
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - now < 60; // Refresh if less than 60 seconds left
}

app.use(async (req, res, next) => {
  const token = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;
  
  if (!token) return next();
  
  if (isTokenExpiring(token) && refreshToken) {
    try {
      const newTokens = await KeycloakManager.login({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET
      });
      
      res.cookie('access_token', newTokens.access_token, { httpOnly: true, secure: true });
      res.cookie('refresh_token', newTokens.refresh_token, { httpOnly: true, secure: true });
    } catch (error) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
    }
  }
  
  next();
});
```

### 3. Token Verification

Always verify tokens using Keycloak's public key:

```javascript
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: `${process.env.KEYCLOAK_URL}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      algorithms: ['RS256'],
      issuer: `${process.env.KEYCLOAK_URL}/auth/realms/${process.env.KEYCLOAK_REALM}`,
      audience: process.env.KEYCLOAK_CLIENT_ID
    }, (err, decoded) => {
      err ? reject(err) : resolve(decoded);
    });
  });
}
```

## Related Documentation

- [loginPKCE() API Reference](../api/configuration.md#loginpkce)
- [login() API Reference](../api/configuration.md#login)
- [OAuth2 PKCE Specification](https://tools.ietf.org/html/rfc7636)
- [Keycloak Authorization Code Flow](https://www.keycloak.org/docs/latest/server_admin/#_oidc)

---

## 🚀 Migration to keycloak-express-middleware (Recommended)

The methods described in this guide (`generateAuthorizationUrl()`, `loginPKCE()`, `login()`) are **deprecated in v6.0.0** and will be removed in v7.0.0.

### Why Migrate?

`keycloak-express-middleware` provides:
- ✅ Native Express integration (sessions, cookies, redirects)
- ✅ Cleaner PKCE implementation focused on user authentication
- ✅ Better separation of concerns (admin API vs user auth)
- ✅ Tighter integration with Express middleware patterns

### Migration Example

**Old Code (keycloak-api-manager, DEPRECATED):**
```javascript
const KeycloakManager = require('keycloak-api-manager');

// Configure admin API
await KeycloakManager.configure({
  baseUrl: 'https://keycloak:8443',
  realmName: 'master',
  clientId: 'admin-cli',
  username: 'admin',
  password: 'admin'
});

// Use OIDC methods (deprecated)
const pkceFlow = KeycloakManager.generateAuthorizationUrl({
  redirect_uri: 'http://localhost:3000/callback'
});

const tokens = await KeycloakManager.loginPKCE({
  code: req.query.code,
  redirect_uri: 'http://localhost:3000/callback',
  code_verifier: req.session.pkce_verifier
});
```

**New Code (keycloak-express-middleware, RECOMMENDED):**
```javascript
const KeycloakMiddleware = require('keycloak-express-middleware');

// Configure middleware for user authentication
const keycloakMiddleware = new KeycloakMiddleware({
  baseUrl: 'https://keycloak:8443',
  realmName: 'my-realm',
  clientId: 'my-app',
  clientSecret: 'my-app-secret'
});

// Use OIDC methods from middleware
const pkceFlow = keycloakMiddleware.generateAuthorizationUrl({
  redirect_uri: 'http://localhost:3000/callback'
});

const tokens = await keycloakMiddleware.loginPKCE({
  code: req.query.code,
  redirect_uri: 'http://localhost:3000/callback',
  code_verifier: req.session.pkce_verifier
});
```

### Step-by-Step Migration

**1. Install keycloak-express-middleware:**
```bash
npm install keycloak-express-middleware@6.1.0
npm uninstall keycloak-api-manager  # if no longer needed for admin operations
```

**2. Initialize middleware instead of manager:**
```javascript
// Replace this:
// const KeycloakManager = require('keycloak-api-manager');
// await KeycloakManager.configure({...});

// With this:
const KeycloakMiddleware = require('keycloak-express-middleware');
const keycloakMiddleware = new KeycloakMiddleware({
  baseUrl: process.env.KEYCLOAK_URL,
  realmName: process.env.KEYCLOAK_REALM,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET
});
```

**3. Replace method calls:**
```javascript
// Old (keycloak-api-manager)
const pkceFlow = KeycloakManager.generateAuthorizationUrl({...});
const tokens = await KeycloakManager.loginPKCE({...});
const newTokens = await KeycloakManager.login({...});

// New (keycloak-express-middleware)
const pkceFlow = keycloakMiddleware.generateAuthorizationUrl({...});
const tokens = await keycloakMiddleware.loginPKCE({...});
const newTokens = await keycloakMiddleware.login({...});
```

**4. Keep using keycloak-api-manager for admin operations (unchanged):**
```javascript
const KeycloakManager = require('keycloak-api-manager');

await KeycloakManager.configure({
  baseUrl: 'https://keycloak:8443',
  realmName: 'master',
  clientId: 'admin-cli',
  username: 'admin',
  password: 'admin'
});

// Admin operations still work the same
const users = await KeycloakManager.users.find();
const realms = await KeycloakManager.realms.find();
```

### API Comparison

| Operation | keycloak-api-manager (Deprecated) | keycloak-express-middleware (Recommended) |
|-----------|-----------------------------------|------------------------------------------|
| Generate PKCE URL | `KeycloakManager.generateAuthorizationUrl()` | `middleware.generateAuthorizationUrl()` |
| Login PKCE | `KeycloakManager.loginPKCE()` | `middleware.loginPKCE()` |
| Token Grant | `KeycloakManager.login()` | `middleware.login()` |
| Deprecated Alias | `KeycloakManager.auth()` | *(Use login()*)  |

### Additional Resources

- **Middleware Documentation:** https://github.com/smartenv-crs4/keycloak-express-middleware
- **Migration Guide:** https://github.com/smartenv-crs4/keycloak-api-manager/blob/main/OIDC_MIGRATION_PLAN.md
- **Middleware Integration Report:** See keycloak-express-middleware/DETAILED_INTEGRATION_REPORT.md

### Deprecation Timeline

| Version | Status | Notes |
|---------|--------|-------|
| v5.0.8  | Supported | Last version with working OIDC methods |
| v6.0.0  | Deprecated | Methods work but marked @deprecated |
| v7.0.0  | Removed | OIDC methods will be permanently removed |

**Action Required:** Migrate to keycloak-express-middleware before v7.0.0 is released.

## Related Documentation

- [loginPKCE() API Reference](../api/configuration.md#loginpkce)
- [login() API Reference](../api/configuration.md#login)
- [OAuth2 PKCE Specification](https://tools.ietf.org/html/rfc7636)
- [Keycloak Authorization Code Flow](https://www.keycloak.org/docs/latest/server_admin/#_oidc)
