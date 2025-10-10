var express = require('express');
var conf=require('./config').conf;
var responseinterceptor = require('responseinterceptor');
var Keycloak =require('keycloak-connect');
var session=require('express-session');
//const {default: KcAdminClient} = require("@keycloak/keycloak-admin-client");
var keycloakAdminClient=require('@keycloak/keycloak-admin-client').default;
var keycloak = null;
var ready=false;
var readyQueue=[];
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


/**
 * ***************************** - ENGLISH - *******************************
 * Async Configuration function for the Keycloak adapter in an Express application.
 * It must be called at app startup, before defining any protected routes.
 * It returns a promise
 *
 * Parameters:
 * - app: Express application instance (e.g., const app = express();)
 * - keyCloakConfig: JSON object containing the Keycloak client configuration.
 *     This can be obtained from the Keycloak admin console:
 *     Clients → [client name] → Installation → "Keycloak OIDC JSON" → Download
 *     Example:
 *     {
 *       "realm": "realm-name",
 *       "auth-server-url": "https://keycloak.example.com/",
 *       "ssl-required": "external",
 *       "resource": "client-name",
 *       "credentials": { "secret": "secret-code" },
 *       "confidential-port": 0
 *     }
 * - keyCloakOptions: advanced configuration options for the adapter.
 *     Main supported options:
 *     - session: Express session configuration (as in express-session)
 *     - scope: authentication scopes (e.g., 'openid profile email offline_access')
 *         Note: to use offline_access, the client must have the option enabled and
 *         the user must have the offline_access role.
 *     - idpHint: to suggest an identity provider to Keycloak during login
 *     - cookies: to enable cookie handling
 *     - realmUrl: to override the realm URL
 *
 * - adminClientCredentials: [Optional] Advanced configuration for setting up the realm-admin user or client,
 *   which will be used as the administrator to manage Keycloak via API.
 *   This is required in order to use the administrative functions exposed by this library.
 *   If this parameter is not provided, it will not be possible to use the administrative functions of Keycloak
 *   exposed by this adapter. In fact, exports.kcAdminClient will be null, so any attempt to call
 *   keycloakAdapter.kcAdminClient will result in a runtime error due to access on an undefined object
 *
 *     Main supported options:
 *     -baseUrl
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
 *    - clientId: string containing the client ID configured in Keycloak. Required for all grant types.
 *    - clientSecret: [Optional] string containing the client secret of the client. Required for client_credentials or confidential clients.
 *    - totp: string for Time-based One-Time Password (TOTP) for multi-factor authentication (MFA), if enabled for the user.
 *    - offlineToken: [Optional] boolean value. If true, requests an offline token (used for long-lived refresh tokens). Default is false.
 *    - refreshToken: [Optional] string containing a valid refresh token to request a new access token when using the refresh_token grant type.
 */
exports.configure=async function(adminClientCredentials){
        let configAdminclient={
            baseUrl:adminClientCredentials.baseUrl,
            realmName:adminClientCredentials.realmName
        }
        kcAdminClient=  new keycloakAdminClient(configAdminclient);
        delete adminClientCredentials.baseUrl;
        delete adminClientCredentials.realmName;
        await kcAdminClient.auth(adminClientCredentials);

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



/*
 <table><tbody>
 <tr><th align="left">Alessandro Romanino</th><td><a href="https://github.com/aromanino">GitHub/aromanino</a></td><td><a href="mailto:a.romanino@gmail.com">mailto:a.romanino@gmail.com</a></td></tr>
 <tr><th align="left">Guido Porruvecchio</th><td><a href="https://github.com/gporruvecchio">GitHub/porruvecchio</a></td><td><a href="mailto:guido.porruvecchio@gmail.com">mailto:guido.porruvecchio@gmail.com</a></td></tr>
 </tbody></table>
 * */




