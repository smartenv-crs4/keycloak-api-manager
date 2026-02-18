
/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The realms property provides access to all administrative operations related to Keycloak realms.
 * A realm in Keycloak is a fundamental concept that acts as an isolated tenant:
 * each realm manages its own set of users, roles, groups, and clients independently.
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler=null;
exports.setKcAdminClient=function(kcAdminClient){
 kcAdminClientHandler=kcAdminClient;
}


/**
 * ***************************** - CREATE - *******************************
 * Create is a method used to create a new realm.
 * This method accepts a realm representation object containing details such as is, name
 * @param {JSON} realmDictionary: is a JSON object that accepts filter parameters
 *     - id:[required] The internal ID of the realm. If omitted, Keycloak uses the realm name as the ID.
 *     - realm:[required] The name of the realm to create.
 *     - Additional optional properties can be passed to configure the realm (e.g., enabled, displayName, etc.).
 */
exports.create=function(realmDictionary){
return (kcAdminClientHandler.realms.create(realmDictionary));
}


/**
 * ***************************** - UPDATE - *******************************
 * Updates the configuration of an existing realm.
 * You can use this method to modify settings such as login behavior, themes, token lifespans, and more.
 * @param {JSON} filter: is a JSON object that accepts filter parameters:
 *    - realm:[required] The identifier of the realm you want to update.
 * @param {JSON} realmDictionary: An object containing the updated realm configuration. Only the fields you want to change need to be included.
 */
exports.update=function(filter,realmDictionary){
 return(kcAdminClientHandler.realms.update(filter,realmDictionary));
}


/**
 * ***************************** - DEL - *******************************
 * Deletes a specific realm from the Keycloak server.
 * This operation is irreversible and removes all users, clients, roles, groups, and settings associated with the realm.
 * @param {JSON} filter: is a JSON object that accepts filter parameters
 *    - realm:[required] The name of the realm to delete.
 */
exports.del=function(filter){
 return(kcAdminClientHandler.realms.del(filter));
}

/**
 * ***************************** - FIND - *******************************
 * Retrieves a list of all realms configured in the Keycloak server.
 *This includes basic metadata for each realm such as ID and display name, but not the full configuration details.
 *This method does not take any parameters.
 */
exports.find=function(){
 return(kcAdminClientHandler.realms.find());
}


/**
 * ***************************** - findOne - *******************************
 * Retrieves the full configuration and metadata of a specific realm by its name (realm ID).
 * This includes settings like login policies, themes, password policies, etc.
 * @parameters:
 * - filter: is a JSON object that accepts filter parameters
 *   - realm:[required] The name (ID) of the realm you want to retrieve.
 */
exports.findOne=function(filter){
 return(kcAdminClientHandler.realms.findOne(filter));
}

/**
 * ***************************** - partialImport - *******************************
 * Performs a partial import of realm configuration into a Keycloak realm.
 * This allows you to import users, roles, groups, clients, and other components without replacing the entire realm.
 * It’s useful for incremental updates or merging configuration pieces.
 *  @parameters:
 * - configuration: is a JSON object that accepts filter parameters
 *   - realm:[required] The name of the realm where the data should be imported.
 *   - rep:[required] A JSON object representing part of the realm configuration to be imported(can include users, roles, groups, clients, etc.).
 *      - ifResourceExists:[required] Defines the behavior when an imported resource already exists in the target realm.
 *        Options are:
 *            - 'FAIL' – the operation fails if a resource already exists.
 *            - 'SKIP' – existing resources are skipped.
 *           - 'OVERWRITE' – existing resources are overwritten.
 *      - other configuration to be imported like users, roles, groups ...
 */
exports.partialImport=function(configuration){
 return(kcAdminClientHandler.realms.partialImport(configuration));
}



/**
 * ***************************** - export - *******************************
 * Exports the configuration of a specific realm.
 * This method returns the full realm representation in JSON format, including roles, users, clients, groups, and other components depending on the provided options.
 * @parameters:
 * - configuration: is a JSON object that accepts filter parameters
 *    - realm:[required] The name of the realm to export.
 *    - exportClients: [optional] boolean, Whether to include clients in the export. Default: true.
 *    - exportGroupsAndRoles: [optional] boolean,  Whether to include groups and roles in the export. Default: true.
 */
exports.export=function(configuration){
 return(kcAdminClientHandler.realms.export(configuration));
}


/**
 * ***************************** - getClientRegistrationPolicyProviders - *******************************
 * Fetches the list of available client registration policy providers for the specified realm.
 *These providers define how new clients can be registered and what rules or validations apply (e.g., allowed scopes, required attributes).
 * @parameters:
 * - configuration: is a JSON object that accepts filter parameters
 *     - realm:[required] The name of the realm where you want to list client registration policy providers.
 */
exports.getClientRegistrationPolicyProviders=function(configuration){
 return(kcAdminClientHandler.realms.getClientRegistrationPolicyProviders(configuration));
}


/**
 * ***************************** - createClientsInitialAccess - *******************************
 *
 * Creates a new Initial Access Token for dynamic client registration.
 * This token allows clients to register themselves with the realm using the Dynamic Client Registration API. Useful when you want to allow programmatic client creation in a controlled way.
 * @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *     - realm:[required] The name of the realm where the initial access token should be created.
 * - options: is a JSON object that accepts filter parameters
 *     - count [required]  Number of times this token can be used to register new clients.
 *     - expiration [required] Time (in seconds) after which the token expires. 0 is unlimited
 *
 *
 * @return - Returns an object containing:
 * - id: internal ID of the token
 * - token: the actual token string to be used during dynamic registration
 * - timestamp: Creation timestamp
 * - expiration: Expiration time in seconds
 * - count: Maximum allowed uses
 * - remainingCount: How many uses are left
 */
exports.createClientsInitialAccess=function(realmFilter,options){
 return(kcAdminClientHandler.realms.createClientsInitialAccess(realmFilter,options));
}




/**
 * ***************************** - getClientsInitialAccess - *******************************
 * Retrieves all existing Initial Access Tokens for dynamic client registration in a given realm.
 * These tokens are used to allow programmatic or automated registration of clients via the Dynamic Client Registration API.
 *  @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *    - realm:[required] The name of the realm from which to list all initial access tokens.
 *
 * @return - An array of objects representing each initial access token. Each object contains:
 * - id: internal ID of the token
 * - token: the actual token string to be used during dynamic registration
 * - timestamp: Creation timestamp
 * - expiration: Expiration time in seconds
 * - count: Maximum allowed uses
 * - remainingCount: How many uses are left
 */

exports.getClientsInitialAccess=function(realmFilter){
 return(kcAdminClientHandler.realms.getClientsInitialAccess(realmFilter));
}




/**
 * ***************************** - delClientsInitialAccess - *******************************
 * Deletes a specific Initial Access Token used for dynamic client registration in a given realm.
 * This revokes the token, preventing any future use.
 * @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *     - realm:[required] The name of the realm where the token was created.
 *     - id:[required] The ID of the initial access token you want to delete.
 */

exports.delClientsInitialAccess=function(realmFilter){
 return(kcAdminClientHandler.realms.delClientsInitialAccess(realmFilter));
}

/**
 * ***************************** - addDefaultGroup - *******************************
 * Adds an existing group to the list of default groups for a given realm.
 * Users created in this realm will automatically be added to all default groups.
 * @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *    - realm:[required] The name of the realm where the default group will be set.
 *    - id:[required] The ID of the group to be added as a default group
 */

exports.addDefaultGroup=function(realmFilter){
 return(kcAdminClientHandler.realms.addDefaultGroup(realmFilter));
}


/**
 * ***************************** - removeDefaultGroup - *******************************
 * Removes a group from the list of default groups in a realm.
 * Default groups are automatically assigned to new users when they are created.
 * @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *      - realm:[required] The name of the realm from which to remove the default group.
 *      - id:[required] The ID of the group you want to remove from the default list.
 */

exports.removeDefaultGroup=function(realmFilter){
 return(kcAdminClientHandler.realms.removeDefaultGroup(realmFilter));
}

/**
 * ***************************** - getDefaultGroups - *******************************
 * Retrieves a list of all default groups for a specified realm.
 * These are the groups that new users will automatically be added to upon creation.
 * @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *      - realm:[required] The name of the realm from which to retrieve default groups.
 */
exports.getDefaultGroups=function(realmFilter){
 return(kcAdminClientHandler.realms.getDefaultGroups(realmFilter));
}

/**
 * ***************************** - getGroupByPath - *******************************
 * Retrieves a group object by specifying its hierarchical path in a realm.
 * This is useful when you know the group’s full path (e.g., /parent/child) but not its ID.
 * @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *     - realm:[required] The name of the realm where the group is located.
 *     - path:[required] TThe full hierarchical path to the group, starting with a slash (/). For example: /developers/frontend.
 */
exports.getGroupByPath=function(realmFilter){
 return(kcAdminClientHandler.realms.getGroupByPath(realmFilter));
}

/**
 * ***************************** - getConfigEvents - *******************************
 * Retrieves the event configuration settings for a specific realm.
 * This includes settings related to the event listeners, enabled event types, admin events, and more.
 * Useful for auditing and tracking activities inside Keycloak.
 * @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *      - realm:[required] The name of the realm from which to retrieve the event configuration.
 */
exports.getConfigEvents=function(realmFilter){
 return(kcAdminClientHandler.realms.getConfigEvents(realmFilter));
}


/**
 * ***************************** - updateConfigEvents - *******************************
 * Updates the event configuration for a given realm.
 * This includes enabling/disabling events, setting specific event types to track,
 * enabling admin event logging, and choosing which event listeners to use.
 * @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *     - realm:[required] The name of the realm where the configuration will be updated.
 * - configurationEvents:is a config events JSON object dictionary like this:
 *      - eventsEnabled: Enables or disables event logging.
 *      - eventsListeners: List of event listener IDs to use (e.g., ["jboss-logging"]).
 *      - enabledEventTypes: List of event types to track (e.g., ["LOGIN", "LOGOUT", "REGISTER"]).
 *      - adminEventsEnabled: Enables logging for admin events.
 *      - adminEventsDetailsEnabled: Includes full details in admin event logs if set to true.
 */
exports.updateConfigEvents=function(realmFilter,configurationEvents){
 return(kcAdminClientHandler.realms.updateConfigEvents(realmFilter,configurationEvents));
}


/**
 * ***************************** - findEvents - *******************************
 * Retrieves a list of events that occurred in a specified realm.
 * You can filter the results by event type, user, date range, and other criteria.
 * Useful for auditing login, logout, and other user-related activities.
 *  @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *      - realm: [required] The name of the realm to fetch events from.
 *      - client: [optional] Client ID to filter events for a specific client.
 *      - type: [optional] Event type to filter (e.g., LOGIN, REGISTER).
 *      - user: [optional]  User ID to filter events related to a specific user.
 *      - dateFrom: [optional] Start date in ISO 8601 format to filter events.
 *      - dateTo: [optional] End date in ISO 8601 format to filter events.
 *      - first: [optional] Pagination offset.
 *      - max: [optional] Maximum number of events to return.
 */
exports.findEvents=function(realmFilter){
 return(kcAdminClientHandler.realms.findEvents(realmFilter));
}

/**
 * ***************************** - findAdminEvents - *******************************
 * Retrieves administrative events that occurred in a specific realm.
 * Admin events are triggered by actions such as creating users, updating roles, or modifying realm settings.
 * This is useful for auditing changes made via the admin API or admin console.
 * @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *     - realm: [required] The name of the realm to retrieve admin events from.
 *     - authClient: [optional] Client ID used to perform the action.
 *     - authIpAddress: [optional] IP address of the actor who triggered the event.
 *     - authRealm: [optional] Realm of the actor.
 *     - authUser: [optional] User ID of the admin who performed the action.
 *     - dateFrom: [optional] Start date in ISO 8601 format.
 *     - dateTo: [optional] End date in ISO 8601 format.
 *     - first: [optional] Pagination offset.
 *     - max: [optional] Maximum number of events to retrieve.
 *     - operationTypes: [optional] Filter by operation type (e.g., CREATE, UPDATE, DELETE).
 *     - resourcePath: [optional] Filter events by resource path.
 *     - resourceTypes: [optional] Filter events by resource type (e.g., USER, REALM_ROLE, CLIENT).
 */
exports.findAdminEvents=function(realmFilter){
 return(kcAdminClientHandler.realms.findAdminEvents(realmFilter));
}


/**
 * ***************************** - clearEvents - *******************************
 * Deletes all user events (not admin events) from the event store of a specific realm.
 * Useful for resetting or cleaning up event logs related to user actions such as logins, logouts, failed login attempts, etc.
 * This does not clear administrative events. To remove those, use realms.clearAdminEvents().
 * @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *      - realm: [required] The name of the realm from which to clear user events.
 */
exports.clearEvents=function(realmFilter){
 return(kcAdminClientHandler.realms.clearEvents(realmFilter));
}



/**
 * ***************************** - clearAdminEvents - *******************************
 * Deletes all admin events from the event store of a specific realm.
 * Admin events include actions such as creating users, updating roles, changing client settings, etc.,
 * performed by administrators via the Admin Console or Admin REST API.
 * @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *      - realm: [required] The name of the realm from which to clear administrative events.
 */
exports.clearAdminEvents=function(realmFilter){
 return(kcAdminClientHandler.realms.clearAdminEvents(realmFilter));
}


/**
 * ***************************** - getUsersManagementPermissions - *******************************
 * Retrieves the status and configuration of user management permissions (also known as fine-grained permissions) in a specific realm.
 * This allows you to check whether user management operations (like creating, updating, or deleting users) are protected by specific roles or policies.
 *
 * @parameters:
 * - realmFilter: is a JSON object that accepts filter parameters
 *      - realm: [required] The name of the realm for which you want to retrieve the user management permission settings.
 */
exports.getUsersManagementPermissions=async function(realmFilter){
 try {
  const token = kcAdminClientHandler.accessToken;
  const realmName = realmFilter.realm;
  const path = `/admin/realms/${realmName}/users-management-permissions`;
  const { makeRequest } = require('./httpApiHelper');
  return await makeRequest(token, 'GET', path);
 } catch (err) {
  if (kcAdminClientHandler.realms && kcAdminClientHandler.realms.getUsersManagementPermissions) {
   return kcAdminClientHandler.realms.getUsersManagementPermissions(realmFilter);
  }
  throw err;
 }
}


/**
 * ***************************** - updateUsersManagementPermissions - *******************************
 * Enables or disables fine-grained user management permissions in a specified realm.
 * This controls whether operations on users (such as creating, editing, or deleting users)
 * are protected using Keycloak's authorization services.
 * @parameters:
 * - update-parameters: is a JSON object that accepts this parameters
 *      - realm: [required] The name of the realm for which you want to update the user management permission settings.
 *      - enabled: [required] boolean value to enable or disable permission
 *           - true: Activates fine-grained permissions for user management.
 *           - false: Disables fine-grained permissions and falls back to standard admin roles.
 */
exports.updateUsersManagementPermissions=async function(updateParameters){
 try {
  const token = kcAdminClientHandler.accessToken;
  const realmName = updateParameters.realm;
  const path = `/admin/realms/${realmName}/users-management-permissions`;
  const { makeRequest } = require('./httpApiHelper');
  return await makeRequest(token, 'PUT', path, { enabled: updateParameters.enabled });
 } catch (err) {
  if (kcAdminClientHandler.realms && kcAdminClientHandler.realms.updateUsersManagementPermissions) {
   return kcAdminClientHandler.realms.updateUsersManagementPermissions(updateParameters);
  }
  throw err;
 }
}

/**
 * ***************************** - getKeys - *******************************
 * Retrieves the realm keys metadata, including public keys, certificates, and active key information
 * used for token signing, encryption, and other cryptographic operations in the specified realm.
 * @parameters:
 * - filter: is a JSON object that accepts this parameters
 *      - realm: [required] The name of the realm for which you want to retrieve key metadata.
 *
 * Returns a list of keys and related information:
 */
exports.getKeys=function(filter){
 return(kcAdminClientHandler.realms.getKeys(filter));
}




/**
 * ***************************** - getClientSessionStats - *******************************
 * Retrieves statistics about active client sessions in the specified realm. This includes the number of active sessions per client.
 * @parameters:
 * - filter: is a JSON object that accepts this parameters
 *      - realm: [required]  The name of the realm for which you want to retrieve client session statistics.
 *
 * Returns an array of objects, each representing a client with active sessions
 */
exports.getClientSessionStats=function(filter){
 return(kcAdminClientHandler.realms.getClientSessionStats(filter));
}


/**
 * ***************************** - pushRevocation - *******************************
 * Immediately pushes a revocation policy to all clients in the specified realm.
 * This forces clients to revalidate tokens, effectively revoking cached access tokens and enforcing updated policies.
 * @parameters:
 * - filter: is a JSON object that accepts this parameters
 *      - realm: [required]  The name of the realm where the revocation should be pushed.
 */
exports.pushRevocation=function(filter){
 return(kcAdminClientHandler.realms.pushRevocation(filter));
}

/**
 * ***************************** - logoutAll - *******************************
 * Logs out all active sessions for all users in the specified realm.
 * This invalidates all user sessions, forcing every user to re-authenticate.
 * @parameters:
 * - filter: is a JSON object that accepts this parameters
 *      - realm: [required] The name of the realm from which to log out all users.
 */
exports.logoutAll=function(filter){
 return(kcAdminClientHandler.realms.logoutAll(filter));
}

/**
 * ***************************** - testLDAPConnection - *******************************
 * Tests the connection to an LDAP server using the provided configuration parameters.
 * This is useful to verify that Keycloak can reach and authenticate with the LDAP server before
 * fully integrating it into the realm configuration.
 * @parameters:
 * - filter: is a JSON object that accepts this filter parameters
 *      - realm: [required] Name of the realm where the LDAP provider is being tested.
 * - options: is a JSON object that accepts this parameters
 *      - action: [required] Specifies the test type. Use "testConnection" to verify the connection, or "testAuthentication" to verify bind credentials.
 *      - connectionUrl: [required] URL of the LDAP server (e.g., ldap://ldap.example.com:389).
 *      - bindDn: [required] Distinguished Name (DN) used to bind to the LDAP server.
 *      - bindCredential: [required] Password or secret associated with the bind DN.
 *      - useTruststoreSpi: [optional] Whether to use the truststore ("ldapsOnly", "always", etc.).
 *      - connectionTimeout: [optional] Timeout value for the connection (in milliseconds).
 *      - authType: [optional] Type of authentication; usually "simple" or "none".
 */
exports.testLDAPConnection=function(filter,options){
 return(kcAdminClientHandler.realms.testLDAPConnection(filter,options));
}



/**
 * ***************************** - ldapServerCapabilities - *******************************
 * This function queries the LDAP server configured for a specific realm to retrieve and display its supported capabilities.
 * It helps validate the connection and understand which LDAP features are available,
 * such as supported controls, extensions, authentication mechanisms, and more.
 * @parameters:
 * - filter: is a JSON object that accepts this filter parameters
 *      - realm: [required] Name of the realm where the LDAP provider is being tested.
 * - options: is a JSON object that accepts this parameters
 *      - action: [required] Specifies the test type. Use "testConnection" to verify the connection, or "testAuthentication" to verify bind credentials.
 *      - connectionUrl: [required] URL of the LDAP server (e.g., ldap://ldap.example.com:389).
 *      - bindDn: [required] Distinguished Name (DN) used to bind to the LDAP server.
 *      - bindCredential: [required] Password or secret associated with the bind DN.
 *      - useTruststoreSpi: [optional] Whether to use the truststore ("ldapsOnly", "always", etc.).
 *      - connectionTimeout: [optional] Timeout value for the connection (in milliseconds).
 *      - authType: [optional] Type of authentication; usually "simple" or "none".
 */
exports.ldapServerCapabilities=function(filter,options){
 return(kcAdminClientHandler.realms.ldapServerCapabilities(filter,options));
}



/**
 * ***************************** - testSMTPConnection - *******************************
 * Tests the SMTP connection using the provided configuration.
 * This allows you to verify that Keycloak can connect and send emails through the configured
 * SMTP server before applying the settings to the realm.
 *  @parameters:
 * - filter: is a JSON object that accepts this filter parameters
 *      - realm: [required] The name of the realm where the SMTP server will be tested.
 * - config: An object containing the SMTP server configuration:
 *      - from: [required] The sender email address.
 *      - host: [required] The SMTP server host (e.g., smtp.example.com).
 *      - port: [required] The SMTP server port (usually 587, 465, or 25).
 *      - auth: [optional] Whether authentication is required ("true" or "false").
 *      - user [optional] The username for SMTP authentication.
 *      - password [optional] The password for SMTP authentication.
 *      - replyTo [optional] The reply-to email address.
 *      - starttls [optional] Enable STARTTLS ("true" or "false").
 *      - ssl [optional] Enable SSL ("true" or "false").
 *      - envelopeFrom [optional] Envelope sender address.
 */
exports.testSMTPConnection=function(filter,config){
 return(kcAdminClientHandler.realms.testSMTPConnection(filter,config));
}

/**
 * ***************************** - getRealmLocalizationTexts - *******************************
 * Retrieves all localization texts (custom messages and labels) defined for a specific realm and locale.
 * Localization texts are used to override default Keycloak UI messages for login forms, error pages, and other user-facing content
 * @parameters:
 * - filter: is a JSON object that accepts this filter parameters
 *      - realm: [required] The name of the realm from which to fetch localization texts.
 *      - selectedLocale: [required] The locale code (e.g., 'en', 'it', 'fr', etc.) for which you want to retrieve the translations.
 */
exports.getRealmLocalizationTexts=function(filter){
 return(kcAdminClientHandler.realms.getRealmLocalizationTexts(filter));
}



/**
 * ***************************** - addLocalization - *******************************
 * Adds or updates a localization text (custom UI message or label) for a specific realm and locale in Keycloak.
 * This allows you to override default messages in the login screens and other UI components with custom translations.
 *  @parameters:
 * - filter: is a JSON object that accepts this filter parameters
 *      - realm: [required] The name of the realm where the localization should be applied.
 *      - selectedLocale: [required] The locale code (e.g., 'en', 'fr', 'it') for which the translation is being added.
 *      - key: [required] The message key or identifier to override (e.g., loginAccountTitle, errorInvalidUsername).
 * - value: [required]  The actual translated text to associate with the key for the given locale.
 */
exports.addLocalization=function(filter,value){
 return(kcAdminClientHandler.realms.addLocalization(filter,value));
}



/**
 * ***************************** - getRealmSpecificLocales - *******************************
 * Retrieves the list of locales (language codes) for which custom localization texts have been defined in a specific realm.
 * This function is useful to determine which locales have at least one overridden message.
 *  @parameters:
 * - filter: is a JSON object that accepts this filter parameters
 *      - realm: [required] The name of the realm for which to fetch the list of custom locales.
 *      - selectedLocale: [optional] The locale code (e.g., 'en', 'fr', 'it').
 *
 * Return An array of locale codes (e.g., ["en", "it", "fr"]) representing the languages that have at least
 * one customized localization entry in the given realm.
 */
exports.getRealmSpecificLocales=function(filter){
 return(kcAdminClientHandler.realms.getRealmSpecificLocales(filter));
}



/**
 * ***************************** - deleteRealmLocalizationTexts - *******************************
 * Deletes a specific custom localization text entry for a given locale and key within a realm.
 * This is useful when you want to remove a previously added or overridden message from the realm's custom localization.
 * @parameters:
 * - filter: is a JSON object that accepts this filter parameters
 *      - realm: [required] The name of the realm where the localization entry exists.
 *      - selectedLocale: [required] The locale code (e.g., 'en', 'fr', 'it').
 *      - key: [optional] The key identifying the message you want to remove. If no key is specified, all keys will be removed
 *
 * Returns void if the deletion is successful. Will throw an error if the entry does not exist or if parameters are invalid.
 */
exports.deleteRealmLocalizationTexts=function(filter){
 return(kcAdminClientHandler.realms.deleteRealmLocalizationTexts(filter));
}