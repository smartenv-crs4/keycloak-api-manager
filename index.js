const KeycloakAdminClient = require('@keycloak/keycloak-admin-client').default;

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

let kcAdminClient = null;
let tokenRefreshInterval = null;
let runtimeConfig = null;
let authPayload = null;

function assertConfigured() {
    if (!kcAdminClient || !runtimeConfig) {
        throw new Error('Keycloak Admin Client is not configured. Call configure() first.');
    }
}

function toBaseUrl(baseUrl) {
    if (!baseUrl || typeof baseUrl !== 'string') {
        throw new Error('Invalid baseUrl. It must be a non-empty string.');
    }
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function bindHandlers() {
    Object.entries(handlerRegistry).forEach(([name, handler]) => {
        handler.setKcAdminClient(kcAdminClient);
        exports[name] = handler;
    });
}

function clearRefreshTimer() {
    if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
        tokenRefreshInterval = null;
    }
}

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

exports.setConfig = function setConfig(configToOverride = {}) {
    assertConfigured();
    kcAdminClient.setConfig(configToOverride);

    runtimeConfig = {
        ...runtimeConfig,
        ...(configToOverride.baseUrl ? { baseUrl: toBaseUrl(configToOverride.baseUrl) } : {}),
        ...(configToOverride.realmName ? { realmName: configToOverride.realmName } : {})
    };
};

exports.getToken = function getToken() {
    assertConfigured();
    return {
        accessToken: kcAdminClient.accessToken,
        refreshToken: kcAdminClient.refreshToken
    };
};

exports.stop = function stop() {
    clearRefreshTimer();
};

exports.auth = async function auth(credentials = {}) {
    assertConfigured();

    const body = new URLSearchParams();
    Object.entries(credentials).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            body.append(key, String(value));
        }
    });

    if (runtimeConfig.clientId) {
        body.append('client_id', runtimeConfig.clientId);
    }
    if (runtimeConfig.clientSecret) {
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
};
