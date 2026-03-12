
/**
 * **************************************************************************************************
 * Keycloak API Manager - Main Entry Point
 *
 * This module provides a centralized interface for managing Keycloak administrative resources via the REST Admin API.
 * It exposes methods for client configuration, token handling, and wiring all resource handlers.
 *
 * Each handler in Handlers/ encapsulates logic for a specific Keycloak resource (users, roles, groups, etc.).
 *
 * NOTE: OIDC authentication functions are deprecated and have been moved to keycloak-express-middleware.
 * **************************************************************************************************
 */
const KeycloakAdminClient = require('@keycloak/keycloak-admin-client').default;


/**
 * Resource handler registry. Each key represents a Keycloak resource and maps to its handler module.
 */
const handlerRegistry = {
    realms: require('./Handlers/realmsHandler'),
    users: require('./Handlers/usersHandler'),
    clients: require('./Handlers/clientsHandler'),
    clientScopes: require('./Handlers/clientScopesHandler'),
    identityProviders: require('./Handlers/identityProvidersHandler'),
    groups: require('./Handlers/groupsHandler'),
    roles: require('./Handlers/rolesHandler'),
    components: require('./Handlers/componentsHandler'),
    authenticationManagement: require('./Handlers/authenticationManagementHandler'),
    attackDetection: require('./Handlers/attackDetectionHandler'),
    organizations: require('./Handlers/organizationsHandler'),
    userProfile: require('./Handlers/userProfileHandler'),
    clientPolicies: require('./Handlers/clientPoliciesHandler'),
    serverInfo: require('./Handlers/serverInfoHandler')
};


// Keycloak Admin client instance
let kcAdminClient = null;
// Interval ID per il refresh automatico del token
let tokenRefreshInterval = null;
// Current runtime configuration
let runtimeConfig = null;
// Authentication payload used for token refresh
let authPayload = null;


/**
 * Ensures the client is configured before executing operations.
 * Throws an error when configuration is missing.
 */
function assertConfigured() {
    if (!kcAdminClient || !runtimeConfig) {
        throw new Error('Keycloak Admin Client is not configured. Call configure() first.');
    }
}


/**
 * Normalizes the baseUrl by removing a trailing slash, if present.
 * @param {string} baseUrl
 * @returns {string}
 */
function toBaseUrl(baseUrl) {
    if (!baseUrl || typeof baseUrl !== 'string') {
        throw new Error('Invalid baseUrl. It must be a non-empty string.');
    }
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}


/**
 * Binds all resource handlers by injecting the configured Keycloak client and exporting the modules.
 */
function bindHandlers() {
    Object.entries(handlerRegistry).forEach(([name, handler]) => {
        handler.setKcAdminClient(kcAdminClient);
        exports[name] = handler;
    });
}


/**
 * Stops and resets the token refresh timer.
 */
function clearRefreshTimer() {
    if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
        tokenRefreshInterval = null;
    }
}


/**
 * Starts the automatic access token refresh timer.
 * @param {number} intervalMs - interval in milliseconds
 */
function startRefreshTimer(intervalMs) {
    clearRefreshTimer();

    tokenRefreshInterval = setInterval(async () => {
        try {
            await kcAdminClient.auth({ ...authPayload });
        } catch (err) {
            console.error('Token refresh failed:', err.message);
        }
    }, intervalMs);

    if (tokenRefreshInterval.unref) {
        tokenRefreshInterval.unref();
    }
}

/**
 * Initializes and authenticates the Keycloak Admin Client. Must be called before using any handler.
 * Supports password and client_credentials grant types.
 * Starts automatic token refresh and propagates the configured client to all handlers.
 *
 * @param {Object} adminClientCredentials - Credentials and configuration object:
 *   - baseUrl {string} Keycloak server base URL
 *   - realmName {string} Realm name
 *   - clientId {string} Client ID
 *   - clientSecret {string} (optional) Secret for client_credentials
 *   - username {string} (optional) Admin username
 *   - password {string} (optional) Admin password
 *   - grantType {string} ("password" | "client_credentials")
 *   - tokenLifeSpan {number} (optional) Token refresh interval (seconds)
 *   - ... Other OAuth2 parameters
 * @returns {Promise<void>} Promise resolved when configuration is complete
 * @example
 * await KeycloakManager.configure({ baseUrl, realmName, clientId, clientSecret, grantType: 'client_credentials' })
 */
exports.configure = async function configure(adminClientCredentials = {}) {
    const {
        baseUrl,
        realmName,
        clientId,
        clientSecret,
        tokenLifeSpan,
        ...credentials
    } = adminClientCredentials;

    const normalizedBaseUrl = toBaseUrl(baseUrl);

    runtimeConfig = {
        baseUrl: normalizedBaseUrl,
        realmName,
        clientId,
        clientSecret
    };

    kcAdminClient = new KeycloakAdminClient({
        baseUrl: normalizedBaseUrl,
        realmName
    });

    const originalSetRefreshToken = kcAdminClient.setRefreshToken?.bind(kcAdminClient);
    if (originalSetRefreshToken) {
        kcAdminClient.setRefreshToken = (token) => {
            if (!token) {
                kcAdminClient.refreshToken = undefined;
                return;
            }
            return originalSetRefreshToken(token);
        };
    }

    authPayload = {
        clientId,
        ...(clientSecret ? { clientSecret } : {}),
        ...credentials
    };
    await kcAdminClient.auth(authPayload);

    const intervalMs = Number.isFinite(Number(tokenLifeSpan)) && Number(tokenLifeSpan) > 0
        ? (Number(tokenLifeSpan) * 1000) / 2
        : 30000;

    startRefreshTimer(intervalMs);
    bindHandlers();
};


/**
 * Updates Keycloak client runtime configuration without re-initializing the session or re-authenticating.
 * Allows switching realm, baseUrl, or HTTP request options (requestConfig) at runtime.
 *
 * @param {Object} overrides - Configuration overrides object.
 * @param {string} [overrides.realmName] - Changes the target realm for all subsequent calls.
 * @param {string} [overrides.baseUrl] - Changes the Keycloak server base URL.
 * @param {object} [overrides.requestConfig] - HTTP request option overrides (e.g., timeout, custom headers). These options are passed internally to the HTTP client used by keycloak-admin-client (typically Axios).
 * @returns {void}
 *
 * @example
 * // Change only the realm
 * KeycloakManager.setConfig({ realmName: 'my-app' });
 *
 * // Change realm and add custom request headers
 * KeycloakManager.setConfig({
 *   realmName: 'my-realm',
 *   requestConfig: {
 *     timeout: 10000,
 *     headers: { 'X-Custom-Header': 'value' }
 *   }
 * });
 *
 * // Change baseUrl (e.g., for different environments)
 * KeycloakManager.setConfig({ baseUrl: 'https://keycloak-alt.example.com' });
 *
 * @note Does not perform login/token refresh. It only updates runtime context. The token remains valid if compatible with the new realm.
 */
exports.setConfig = function setConfig(configToOverride = {}) {
    assertConfigured();
    kcAdminClient.setConfig(configToOverride);

    runtimeConfig = {
        ...runtimeConfig,
        ...(configToOverride.baseUrl ? { baseUrl: toBaseUrl(configToOverride.baseUrl) } : {}),
        ...(configToOverride.realmName ? { realmName: configToOverride.realmName } : {})
    };
};


/**
 * Returns the current access and refresh tokens.
 * Useful for debugging or passing the token to other services.
 * The token is automatically refreshed by the internal timer.
 *
 * @returns {{ accessToken: string, refreshToken: string }}
 * @example
 * const { accessToken } = KeycloakManager.getToken();
 */
exports.getToken = function getToken() {
    assertConfigured();
    return {
        accessToken: kcAdminClient.accessToken,
        refreshToken: kcAdminClient.refreshToken
    };
};


/**
 * Stops the automatic token refresh timer and releases resources.
 * Call this before shutting down the application to avoid dangling processes.
 *
 * @returns {void}
 * @example
 * KeycloakManager.stop();
 */
exports.stop = function stop() {
    clearRefreshTimer();
};


/**
 * Executes a direct request to the Keycloak OIDC token endpoint.
 * Used internally for password, client_credentials, authorization_code (PKCE), and other grant types.
 *
 * @param {Object} credentials - OAuth2 parameters (grant_type, username, password, code, etc.)
 * @returns {Promise<Object>} Token endpoint response (access_token, refresh_token, etc.)
 * @throws {Error} If the request fails
 */
async function requestOidcToken(credentials = {}) {
    assertConfigured();

    const body = new URLSearchParams();
    Object.entries(credentials).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            body.append(key, String(value));
        }
    });

    if (runtimeConfig.clientId && !body.has('client_id')) {
        body.append('client_id', runtimeConfig.clientId);
    }
    if (runtimeConfig.clientSecret && !body.has('client_secret')) {
        body.append('client_secret', runtimeConfig.clientSecret);
    }

    const response = await fetch(
        `${runtimeConfig.baseUrl}/realms/${runtimeConfig.realmName}/protocol/openid-connect/token`,
        {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            body
        }
    );

    const responseText = await response.text();
    const payload = responseText ? JSON.parse(responseText) : {};

    if (!response.ok) {
        const errorMessage = payload.error_description || payload.error || 'Authentication failed';
        throw new Error(errorMessage);
    }

    return payload;
}

/**
 * @deprecated v6.0.0 - This method has been moved to keycloak-express-middleware.
 * Use the middleware package for user authentication instead. See:
 * https://github.com/smartenv-crs4/keycloak-express-middleware#oidc-authentication
 * 
 * This API manager is intended for Keycloak admin resource management only.
 * For user authentication flows, import from keycloak-express-middleware.
 * 
 * @see {@link https://github.com/smartenv-crs4/keycloak-express-middleware|keycloak-express-middleware}
 * @param {object} credentials - OIDC token request credentials
 * @returns {Promise<object>} Token response containing access_token, refresh_token, etc.
 */
exports.auth = async function auth(credentials = {}) {
    return requestOidcToken(credentials);
};

/**
 * @deprecated v6.0.0 - This method has been moved to keycloak-express-middleware.
 * Use the middleware package for user authentication instead. See:
 * https://github.com/smartenv-crs4/keycloak-express-middleware#oidc-authentication
 * 
 * This API manager is intended for Keycloak admin resource management only.
 * For user authentication flows, import from keycloak-express-middleware.
 * 
 * @see {@link https://github.com/smartenv-crs4/keycloak-express-middleware|keycloak-express-middleware}
 * @param {object} credentials - OIDC token request credentials (supports any OAuth2 grant type)
 * @returns {Promise<object>} Token response containing access_token, refresh_token, etc.
 */
exports.login = async function login(credentials = {}) {
    return requestOidcToken(credentials);
};

/**
 * @deprecated v6.0.0 - This method has been moved to keycloak-express-middleware.
 * Use the middleware package for user authentication instead. See:
 * https://github.com/smartenv-crs4/keycloak-express-middleware#oidc-pkce-flow
 * 
 * This API manager is intended for Keycloak admin resource management only.
 * For user authentication flows, import from keycloak-express-middleware.
 * 
 * @see {@link https://github.com/smartenv-crs4/keycloak-express-middleware|keycloak-express-middleware}
 * @param {object} credentials - PKCE authorization code exchange parameters
 * @returns {Promise<object>} Token response containing access_token, refresh_token, etc.
 */
exports.loginPKCE = async function loginPKCE(credentials = {}) {
    const {
        code,
        redirect_uri,
        redirectUri,
        code_verifier,
        codeVerifier,
        client_id,
        clientId,
        client_secret,
        clientSecret,
        ...rest
    } = credentials;

    const resolvedCode = code;
    const resolvedRedirectUri = redirect_uri || redirectUri;
    const resolvedCodeVerifier = code_verifier || codeVerifier;
    const resolvedClientId = client_id || clientId;
    const resolvedClientSecret = client_secret || clientSecret;

    if (!resolvedCode) {
        throw new Error('loginPKCE requires "code".');
    }
    if (!resolvedRedirectUri) {
        throw new Error('loginPKCE requires "redirect_uri" (or "redirectUri").');
    }
    if (!resolvedCodeVerifier) {
        throw new Error('loginPKCE requires "code_verifier" (or "codeVerifier").');
    }

    return requestOidcToken({
        grant_type: 'authorization_code',
        code: resolvedCode,
        redirect_uri: resolvedRedirectUri,
        code_verifier: resolvedCodeVerifier,
        ...(resolvedClientId ? { client_id: resolvedClientId } : {}),
        ...(resolvedClientSecret ? { client_secret: resolvedClientSecret } : {}),
        ...rest
    });
};

/**
 * @deprecated v6.0.0 - This method has been moved to keycloak-express-middleware.
 * Use the middleware package for user authentication instead. See:
 * https://github.com/smartenv-crs4/keycloak-express-middleware#generating-authorization-urls
 * 
 * This API manager is intended for Keycloak admin resource management only.
 * For user authentication flows, import from keycloak-express-middleware.
 * 
 * @see {@link https://github.com/smartenv-crs4/keycloak-express-middleware|keycloak-express-middleware}
 * @param {object} options - Authorization URL generation options
 * @returns {object} Object with { authUrl, state, codeVerifier } for PKCE flow
 */
exports.generateAuthorizationUrl = function generateAuthorizationUrl(options = {}) {
    assertConfigured();
    
    const { 
        redirect_uri,
        redirectUri,
        scope,
        state: customState
    } = options;

    const resolvedRedirectUri = redirect_uri || redirectUri;
    if (!resolvedRedirectUri) {
        throw new Error('generateAuthorizationUrl requires "redirect_uri" (or "redirectUri").');
    }

    const crypto = require('crypto');

    // Helper to encode bytes to base64url
    function base64url(buffer) {
        return buffer
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    // Generate PKCE pair
    const codeVerifier = base64url(crypto.randomBytes(96));
    const codeChallenge = base64url(
        crypto.createHash('sha256').update(codeVerifier).digest()
    );

    // Generate or use provided state
    const state = customState || base64url(crypto.randomBytes(32));

    // Build authorization URL
    const authUrl = new URL(
        `${runtimeConfig.baseUrl}/realms/${runtimeConfig.realmName}/protocol/openid-connect/auth`
    );
    
    authUrl.searchParams.append('client_id', runtimeConfig.clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', resolvedRedirectUri);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', state);
    
    if (scope) {
        authUrl.searchParams.append('scope', scope);
    } else {
        authUrl.searchParams.append('scope', 'openid profile email');
    }

    return {
        authUrl: authUrl.toString(),
        state,
        codeVerifier
    };
};
