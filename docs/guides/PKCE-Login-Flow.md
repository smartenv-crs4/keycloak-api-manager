# PKCE Login Flow Guide

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

### Step 1: Generate PKCE Pair

When the user clicks "Login", your backend generates a PKCE pair and stores it securely:

```javascript
const crypto = require('crypto');

function base64url(buf) {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function createPkcePair() {
  // Generate code_verifier (random 128-char string)
  const code_verifier = base64url(crypto.randomBytes(96));
  
  // Generate code_challenge (SHA256 hash of verifier)
  const code_challenge = base64url(
    crypto.createHash('sha256').update(code_verifier).digest()
  );
  
  // Generate state (CSRF protection)
  const state = base64url(crypto.randomBytes(32));
  
  return { code_verifier, code_challenge, state };
}
```

**Why this works:**
- `code_verifier`: A random, unguessable string
- `code_challenge`: The SHA256 hash of the verifier, sent to Keycloak during login
- `state`: A random token to prevent CSRF attacks; Keycloak will return it unchanged

### Step 2: Redirect to Keycloak Authorization Endpoint

Store the PKCE pair in the session, then redirect the user to Keycloak:

```javascript
const express = require('express');
const session = require('express-session');
const KeycloakManager = require('keycloak-api-manager');

const app = express();

// Session configuration (store verifier securely server-side)
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, secure: true } // secure: true in production (HTTPS only)
}));

// 1. User clicks "Login" button
app.get('/auth/login', (req, res) => {
  const { code_verifier, code_challenge, state } = createPkcePair();
  
  // Store verifier and state in session (server-side only!)
  req.session.pkce_verifier = code_verifier;
  req.session.pkce_state = state;
  
  // Build Keycloak authorization URL
  const keycloakAuthUrl = `${process.env.KEYCLOAK_URL}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth`;
  const authUrl = new URL(keycloakAuthUrl);
  
  authUrl.searchParams.append('client_id', process.env.KEYCLOAK_CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', `${process.env.APP_URL}/auth/callback`);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'openid profile email');
  authUrl.searchParams.append('code_challenge', code_challenge);
  authUrl.searchParams.append('code_challenge_method', 'S256'); // S256 = SHA256
  authUrl.searchParams.append('state', state);
  
  // Redirect user to Keycloak login page
  res.redirect(authUrl.toString());
});
```

**What happens:**
- User is redirected to Keycloak
- They see the login page
- They enter their username/password
- On successful auth, Keycloak redirects back to your `/auth/callback` endpoint with `code` and `state`

### Step 3: Exchange Authorization Code for Token

When Keycloak redirects back with the authorization code, you exchange it for an access token:

```javascript
// 2. Keycloak redirects back with authorization code
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
    
    // 4. Exchange code for token using loginPKCE()
    const tokenResponse = await KeycloakManager.loginPKCE({
      code,
      redirect_uri: `${process.env.APP_URL}/auth/callback`,
      code_verifier,
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET
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

### Step 4: Use the Access Token

Now the user has an access token in a secure cookie. Use it to access protected resources:

```javascript
// Middleware to verify access token
app.use((req, res, next) => {
  const token = req.cookies.access_token;
  
  if (!token) {
    return res.status(401).send('Not authenticated');
  }
  
  // Verify and decode the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY);
    req.user = decoded; // User data available in request
    next();
  } catch (error) {
    return res.status(401).send('Invalid token');
  }
});

// Protected route
app.get('/dashboard', (req, res) => {
  res.send(`Welcome, ${req.user.preferred_username}!`);
});
```

## Complete Working Example

Here's a complete Express.js application with PKCE flow:

```javascript
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
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
  realmName: process.env.KEYCLOAK_REALM,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
  keycloakUrl: process.env.KEYCLOAK_URL
});

// Helper functions
function base64url(buf) {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function createPkcePair() {
  const code_verifier = base64url(crypto.randomBytes(96));
  const code_challenge = base64url(
    crypto.createHash('sha256').update(code_verifier).digest()
  );
  const state = base64url(crypto.randomBytes(32));
  return { code_verifier, code_challenge, state };
}

// Routes
app.get('/auth/login', (req, res) => {
  const { code_verifier, code_challenge, state } = createPkcePair();
  
  req.session.pkce_verifier = code_verifier;
  req.session.pkce_state = state;
  
  const keycloakAuthUrl = `${process.env.KEYCLOAK_URL}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth`;
  const authUrl = new URL(keycloakAuthUrl);
  
  authUrl.searchParams.append('client_id', process.env.KEYCLOAK_CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', `${process.env.APP_URL}/auth/callback`);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'openid profile email');
  authUrl.searchParams.append('code_challenge', code_challenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  authUrl.searchParams.append('state', state);
  
  res.redirect(authUrl.toString());
});

app.get('/auth/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
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
    
    // Exchange code for token
    const tokenResponse = await KeycloakManager.loginPKCE({
      code,
      redirect_uri: `${process.env.APP_URL}/auth/callback`,
      code_verifier,
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET
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
