var express = require('express');
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
let keycloakAdminClientClass=null;

async function getKeycloakAdminClientClass() {
        if (keycloakAdminClientClass) {
                return keycloakAdminClientClass;
        }

        try {
                const requiredModule = require('@keycloak/keycloak-admin-client');
                keycloakAdminClientClass = requiredModule.default || requiredModule;
                return keycloakAdminClientClass;
        } catch (err) {
                if (err && err.code !== 'ERR_REQUIRE_ESM') {
                        throw err;
                }
        }

        const importedModule = await import('@keycloak/keycloak-admin-client');
        keycloakAdminClientClass = importedModule.default || importedModule;
        return keycloakAdminClientClass;
}

function normalizeBaseUrl(baseUrl) {
        if (!baseUrl) {
                return baseUrl;
        }
        return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

/**
 * ***************************** - ENGLISH - *******************************
 *
 *     Main supported options:
 *     -baseUrl: Keycloak base Url
 *     - realmName: [Optional] A String that specifies the realm to authenticate against, if different from the keyCloakConfig.realm parameter.
 *       If you intend to use Keycloak administrator credentials, this should be set to 'master'.
 *     - scope: [Optional] A string that specifies The OAuth2 scope requested during authentication (optional).
 *              Typically not required for administrative clients. example:openid profile
 *    - requestOptions: [Optional] JSON parameters to configure HTTP requests (such as custom headers, timeouts, etc.).
 *      It is compatible with the Fetch API standard. Fetch request options
 *      https://developer.mozilla.org/en-US/docs/Web/API/fetch#options
 *    - username: [Optional] string username. Required when using the password grant type.
 *    - password: [Optional] string password. Required when using the password grant type.
 *    - grantType: The OAuth2 grant type used for authentication.
 *      Possible values: 'password', 'client_credentials', 'refresh_token', etc.
 *    - tokenLifeSpan: Lifetime of an access token expressed in seconds.
 *    - clientId: string containing the client ID configured in Keycloak. Required for all grant types.
 *    - clientSecret: [Optional] string containing the client secret of the client. Required for client_credentials or confidential clients.
 *    - totp: string for Time-based One-Time Password (TOTP) for multi-factor authentication (MFA), if enabled for the user.
 *    - offlineToken: [Optional] boolean value. If true, requests an offline token (used for long-lived refresh tokens). Default is false.
 *    - refreshToken: [Optional] string containing a valid refresh token to request a new access token when using the refresh_token grant type.
 */
exports.configure=async function(adminClientCredentials){
        if (!adminClientCredentials || typeof adminClientCredentials !== 'object') {
                throw new Error('configure(adminClientCredentials) requires a configuration object');
        }

        const realmName = adminClientCredentials.realmName || adminClientCredentials.realm;
        const baseUrl = normalizeBaseUrl(adminClientCredentials.baseUrl);

        if (!baseUrl) {
                throw new Error('Missing required parameter: baseUrl');
        }
        if (!realmName) {
                throw new Error('Missing required parameter: realmName (or alias: realm)');
        }
        if (!adminClientCredentials.clientId) {
                throw new Error('Missing required parameter: clientId');
        }

        configAdminclient={
                baseUrl,
                realmName
        }

        const KeycloakAdminClient = await getKeycloakAdminClientClass();
        kcAdminClient=  new KeycloakAdminClient(configAdminclient);
        configAdminclient.clientId=adminClientCredentials.clientId;
        configAdminclient.clientSecret=adminClientCredentials.clientSecret;

        const authCredentials = { ...adminClientCredentials, baseUrl, realmName };
        delete authCredentials.baseUrl;
        delete authCredentials.realmName;
        delete authCredentials.realm;
        delete authCredentials.tokenLifeSpan;

        let tokenLifeSpanMs = Number(adminClientCredentials.tokenLifeSpan);
        tokenLifeSpanMs = Number.isFinite(tokenLifeSpanMs) && tokenLifeSpanMs > 0
                ? (tokenLifeSpanMs * 1000) / 2
                : 30000;
        await kcAdminClient.auth(authCredentials);

        if (tokenRefreshInterval) {
                clearInterval(tokenRefreshInterval);
        }

        tokenRefreshInterval = setInterval(async ()=>{
                await kcAdminClient.auth(authCredentials);
        },tokenLifeSpanMs);

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


//TODO: Remove da documentare
exports.setConfig=function(configToOverride){
        return(kcAdminClient.setConfig(configToOverride));
}
//TODO: Remove da documentare
// restituisce il token utilizzato dalla libreria per comunicare con la keycloak API
exports.getToken=function(){
        return({
                accessToken:kcAdminClient.accessToken,
                refreshToken:kcAdminClient.refreshToken,
        });
}

//TODO: Remove da documentare
//permette ad un utente o un client di autenticarsi su keycloack ed oottenere un token
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




