var express = require('express');
var keycloakAdminClient=require('@keycloak/keycloak-admin-client').default;
var kcAdminClient=null;
var realmHandler=require('./Handlers/realmsHandler');
var usersHandler=require('./Handlers/usersHandler');
var clientsHandler=require('./Handlers/clientsHandler');
var clientScopesHandler=require('./Handlers/clientScopesHandler');
var identityProvidersHandler=require('./Handlers/identityProvidersHandler');
var groupsHandler=require('./Handlers/groupsHandler');
var rolesHandler=require('./Handlers/rolesHandler');
var componentsHandler=require('./Handlers/componentsHandler');
var authenticationManagementHandler=require('./Handlers/authenticationManagementHandler');
var request=require('request');

let configAdminclient=null;
let tokenRefreshInterval=null;

/**
 * Configure and initialize the Keycloak Admin Client for managing Keycloak resources.
 * 
 * This function MUST be called before using any administrative functions exposed by this library.
 * It sets up the admin client with proper credentials and establishes automatic token refresh.
 * 
 * @param {Object} adminClientCredentials - Configuration object for Keycloak Admin Client
 * @param {string} adminClientCredentials.baseUrl - Keycloak server base URL (e.g., "http://localhost:8080")
 * @param {string} adminClientCredentials.realmName - Realm to authenticate against (use "master" for admin operations)
 * @param {string} adminClientCredentials.clientId - Client ID configured in Keycloak (e.g., "admin-cli")
 * @param {string} adminClientCredentials.grantType - OAuth2 grant type ("password", "client_credentials", etc.)
 * @param {number} adminClientCredentials.tokenLifeSpan - Access token lifetime in seconds (recommended: 60-120)
 * @param {string} [adminClientCredentials.username] - Admin username (required for "password" grant type)
 * @param {string} [adminClientCredentials.password] - Admin password (required for "password" grant type)
 * @param {string} [adminClientCredentials.clientSecret] - Client secret (required for "client_credentials" or confidential clients)
 * @param {string} [adminClientCredentials.scope] - OAuth2 scope (optional, e.g., "openid profile")
 * @param {Object} [adminClientCredentials.requestOptions] - Custom HTTP options (headers, timeout, etc.) compatible with Fetch API
 * @param {string} [adminClientCredentials.totp] - Time-based One-Time Password for MFA (if enabled)
 * @param {boolean} [adminClientCredentials.offlineToken=false] - Request offline token for long-lived refresh tokens
 * @param {string} [adminClientCredentials.refreshToken] - Existing refresh token (for "refresh_token" grant type)
 * 
 * @returns {Promise<void>} Resolves when configuration is complete and authentication successful
 * 
 * @throws {Error} If authentication fails or required parameters are missing
 * 
 * @example
 * // Basic configuration with password grant
 * await KeycloakManager.configure({
 *   baseUrl: 'http://localhost:8080',
 *   realmName: 'master',
 *   clientId: 'admin-cli',
 *   username: 'admin',
 *   password: 'admin',
 *   grantType: 'password',
 *   tokenLifeSpan: 120
 * });
 * 
 * @example
 * // Configuration with client credentials
 * await KeycloakManager.configure({
 *   baseUrl: 'https://auth.example.com',
 *   realmName: 'master',
 *   clientId: 'service-account',
 *   clientSecret: 'secret-key',
 *   grantType: 'client_credentials',
 *   tokenLifeSpan: 60
 * });
 * 
 * @note After successful configuration, all admin handlers are exposed:
 * - KeycloakManager.realms - Realm management
 * - KeycloakManager.users - User management
 * - KeycloakManager.clients - Client management
 * - KeycloakManager.clientScopes - Client scope management
 * - KeycloakManager.identityProviders - Identity provider management
 * - KeycloakManager.groups - Group management
 * - KeycloakManager.roles - Role management
 * - KeycloakManager.components - Component management
 * - KeycloakManager.authenticationManagement - Authentication flow management
 * 
 * @note Token Refresh: The client automatically refreshes the access token at intervals
 * calculated as (tokenLifeSpan * 1000) / 2 milliseconds. Call KeycloakManager.stop()
 * to clear the refresh interval and allow graceful process termination.
 */
exports.configure=async function(adminClientCredentials){
        configAdminclient={
                baseUrl:adminClientCredentials.baseUrl,
                realmName:adminClientCredentials.realmName
        }

        kcAdminClient=  new keycloakAdminClient(configAdminclient);
        configAdminclient.clientId=adminClientCredentials.clientId;
        configAdminclient.clientSecret=adminClientCredentials.clientSecret;


        let tokenLifeSpan= Number(adminClientCredentials.tokenLifeSpan);
        tokenLifeSpan = Number.isFinite(tokenLifeSpan) && tokenLifeSpan > 0
                ? (tokenLifeSpan * 1000) / 2
                : 30000;
        delete adminClientCredentials.baseUrl;
        delete adminClientCredentials.realmName;
        delete adminClientCredentials.tokenLifeSpan;
        await kcAdminClient.auth(adminClientCredentials);

        if (tokenRefreshInterval) {
                clearInterval(tokenRefreshInterval);
        }

        tokenRefreshInterval = setInterval(async ()=>{
                await kcAdminClient.auth(adminClientCredentials);
        },tokenLifeSpan);
        if (tokenRefreshInterval.unref) {
                tokenRefreshInterval.unref();
        }

        realmHandler.setKcAdminClient(kcAdminClient);
        exports.realms=realmHandler;

        usersHandler.setKcAdminClient(kcAdminClient);
        exports.users=usersHandler;

        clientsHandler.setKcAdminClient(kcAdminClient);
        exports.clients=clientsHandler;

        clientScopesHandler.setKcAdminClient(kcAdminClient);
        exports.clientScopes=clientScopesHandler;

        identityProvidersHandler.setKcAdminClient(kcAdminClient);
        exports.identityProviders=identityProvidersHandler;

        groupsHandler.setKcAdminClient(kcAdminClient);
        exports.groups=groupsHandler;

        rolesHandler.setKcAdminClient(kcAdminClient);
        exports.roles=rolesHandler;

        componentsHandler.setKcAdminClient(kcAdminClient);
        exports.components=componentsHandler;

        authenticationManagementHandler.setKcAdminClient(kcAdminClient);
        exports.authenticationManagement=authenticationManagementHandler;


        //exports = kcAdminClient;
};

/**
 * Updates the runtime configuration of the Keycloak Admin Client instance.
 * Allows switching the target realm, base URL, or HTTP request options without 
 * reinitializing the client or re-authenticating.
 * 
 * @param {Object} configToOverride - Configuration object to update
 * @param {string} [configToOverride.realmName] - The name of the target realm for subsequent API requests
 * @param {string} [configToOverride.baseUrl] - The base URL of the Keycloak server (e.g., https://auth.example.com)
 * @param {Object} [configToOverride.requestOptions] - Custom HTTP options (headers, timeout, etc.) applied to API calls
 * @param {string} [configToOverride.realmPath] - A custom realm path if your Keycloak instance uses a non-standard realm route
 * @returns {void}
 * 
 * @note Calling setConfig does not perform authentication - it only changes configuration values in memory.
 * The authentication token already stored in the admin client remains active until it expires.
 * Only the properties explicitly passed in the config object are updated; all others remain unchanged.
 */
exports.setConfig=function(configToOverride){
        return(kcAdminClient.setConfig(configToOverride));
}

/**
 * Retrieves the current authentication tokens used by the Keycloak Admin Client.
 * Returns both the access token (used for API authorization) and the refresh token 
 * (used to renew the session when the access token expires).
 * 
 * @returns {Object} Token object containing:
 * @returns {string} accessToken - The active access token string currently held by the Keycloak Admin Client
 * @returns {string} refreshToken - The corresponding refresh token string, if available
 * 
 * @note The tokens are managed internally by the Keycloak Admin Client after successful authentication.
 * The accessToken typically expires after a short period (e.g., 60 seconds by default).
 * If the client is not authenticated or the session has expired, both values may be undefined.
 */
exports.getToken=function(){
        return({
                accessToken:kcAdminClient.accessToken,
                refreshToken:kcAdminClient.refreshToken,
        });
}

/**
 * Cleanly stops the Keycloak Admin Client by clearing the automatic token refresh interval.
 * When the admin client is configured with tokenLifeSpan, it automatically refreshes 
 * the access token at regular intervals to maintain the session.
 * Calling stop() clears this interval, allowing your Node.js process to exit gracefully.
 * 
 * @returns {void}
 * 
 * @note This method should be called when you're done using the Keycloak Admin Client 
 * and want to terminate your application. It's particularly important in test environments 
 * or CLI scripts where the process needs to exit cleanly. The method is safe to call 
 * multiple times; subsequent calls have no effect.
 * 
 * @example
 * // Configure and use the admin client
 * await KeycloakManager.configure({ ... });
 * const users = await KeycloakManager.users.find();
 * // Clean up and allow process to exit
 * KeycloakManager.stop();
 */
exports.stop=function(){
        if (tokenRefreshInterval) {
                clearInterval(tokenRefreshInterval);
                tokenRefreshInterval=null;
        }
}

/**
 * Allows a user or client to authenticate against a Keycloak realm and obtain an access token.
 * Sends a direct HTTP POST request to the Keycloak OpenID Connect token endpoint using the provided credentials.
 * 
 * @param {Object} credentials - Authentication details
 * @param {string} [credentials.username] - Username of the user (required for password grant)
 * @param {string} [credentials.password] - Password of the user (required for password grant)
 * @param {string} credentials.grant_type - The OAuth2 grant type (e.g. "password", "client_credentials", "refresh_token")
 * @returns {Promise<Object>} Token response object from Keycloak
 * 
 * @example
 * const tokenResponse = await KeycloakManager.auth({
 *   username: "demo",
 *   password: "demo123",
 *   grant_type: "password",
 * });
 * console.log("Access Token:", tokenResponse.access_token);
 */
exports.auth=async function(credentials){
        credentials.client_id=configAdminclient.clientId;
        credentials.client_secret=configAdminclient.clientSecret;
        let options={
                url: `${configAdminclient.baseUrl}realms/${configAdminclient.realmName}/protocol/openid-connect/token` ,
                headers: {'content-type': 'application/www-form-urlencoded', 'Authorization': "Bearer " + kcAdminClient.accessToken },
                form: credentials
        }
        return new Promise((resolve, reject) => {
                request.post(options, function (error, response, body) {
                        if (error) {
                                console.error("Internal Server Error:", error); // internal error
                                reject(error);
                        } else {
                                resolve(JSON.parse(body)); // ✅ return auth token or error due to invalid credentials
                        }
                });
        });
};






/*
 <table><tbody>
 <tr><th align="left">Alessandro Romanino</th><td><a href="https://github.com/aromanino">GitHub/aromanino</a></td><td><a href="mailto:a.romanino@gmail.com">mailto:a.romanino@gmail.com</a></td></tr>
 <tr><th align="left">Guido Porruvecchio</th><td><a href="https://github.com/gporruvecchio">GitHub/porruvecchio</a></td><td><a href="mailto:guido.porruvecchio@gmail.com">mailto:guido.porruvecchio@gmail.com</a></td></tr>
 </tbody></table>
 * */




