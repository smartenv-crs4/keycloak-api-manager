/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The users refers to Keycloak's users management functionality, part of the Admin REST API.
 * It allows you to manage as create, update, inspect, and delete both realm-level and client-level users.
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler=null;
exports.setKcAdminClient=function(kcAdminClient){
 kcAdminClientHandler=kcAdminClient;
}


/**
 * ***************************** - CREATE - *******************************
 * Create is a method used to create a new user in the specified realm.
 * This method accepts a user representation object containing details such as username, email, enabled status,
 * credentials, and other user attributes that can be get by getProfile function.
 * It is typically used when you want to programmatically add new users to your Keycloak realm via the Admin API.
 * @parameters:
 * - userRepresentation: An object containing the user fields to be updated.
 */
exports.create=function(userRepresentation){
return (kcAdminClientHandler.users.create(userRepresentation));
}


/**
 * ***************************** - del - *******************************
 * Deletes a user from the specified realm. Once removed, the user and all associated data (such as credentials,
 * sessions, and group/role memberships) are permanently deleted.
 * @parameters:
 * - id: [Required] the user ID to delete
 * - realm [Optional] the realm name (defaults to current realm)
 */

exports.del=function(filter){
 return (kcAdminClientHandler.users.del(filter));
}

/**
 * ***************************** - find - *******************************
 * find method is used to retrieve a list of users in a specific realm.
 * It supports optional filtering parameters such as username, email, first name, last name, and more.
 * Searching by attributes is only available from Keycloak > 15
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - q: A string containing a query filter by custom attributes, such as 'username:admin'.
 *     - {builtin attribute}: To find users by builtin attributes such as email, surname... example {email:"admin@admin.com"}
 *     - max: A pagination parameter used to define the maximum number of users to return (limit).
 *     - first: A pagination parameter used to define the number of users to skip before starting to return results (offset/limit).
 */

exports.find=function(filter){
 return (kcAdminClientHandler.users.find(filter));
}


/**
 * ***************************** - findOne - *******************************
 * findOne is method used to retrieve a specific user's details by their unique identifier (id) within a given realm.
 * It returns the full user representation if the user exists.
 * @parameters:
 * - filter is a JSON object that accepts filter parameters id
 *      - id: user identifier
 */

exports.findOne=function(filter){
 return (kcAdminClientHandler.users.findOne(filter));
}


/**
 * ***************************** - count - *******************************
 * count method returns the total number of users in a given realm.
 * It optionally accepts filtering parameters similar to those in users.find() such
 * as username, email, firstName, lastName and so on to count only users that match specific criteria.
 * Searching by attributes is only available from Keycloak > 15
 * @parameters:
 * - filter is a JSON object that accepts filter parameters, such as { email: 'test@keycloak.org' }
 */

exports.count=function(filter){
 return (kcAdminClientHandler.users.count(filter));
}


/**
 * ***************************** - update - *******************************
 * update method is used to update the details of a specific user in a Keycloak realm.
 * It requires at least the user’s ID(searchParams) and the updated data(userRepresentation).
 * You can modify fields like firstName, lastName, email, enabled, and more.
 * @parameters:
 * - searchParams: is a JSON object that accepts filter parameters
 *      - id: [Required] the user ID to update
 *      - realm [Optional] the realm name (defaults to current realm)
 * - userRepresentation: An object containing the user fields to be updated.
 */

exports.update=function(searchParams,userRepresentation){
 return (kcAdminClientHandler.users.update(searchParams,userRepresentation));
}

/**
 * ***************************** - resetPassword - *******************************
 * resetPassword method is used to set a new password for a specific user.
 * This action replaces the user's existing credentials. You can also set whether the user is required to
 * change the password on next login.
 * @parameters:
 * - newCredentialsParameters: is a JSON object that accepts filter parameters
 *      - id: [Required] the user ID to update
 *      - realm [Optional] the realm name (defaults to current realm)
 *      - credential: An object containing the new user credentials
 *      - temporary: true or false. Whether the new password is temporary (forces user to reset at next login).
 *      - type: a String value set to "password"
 *      - value: a String containing new password to be set
 */

exports.resetPassword=function(newCredentialsParameters){
 return (kcAdminClientHandler.users.resetPassword(newCredentialsParameters));
}

/**
 * ***************************** - getCredentials - *******************************
 * getCredentials() method retrieves the list of credentials (e.g., passwords, OTPs, WebAuthn, etc.)
 * currently associated with a given user in a specific realm.
 * This is useful for auditing, checking what types of credentials a user has set up,
 * or managing credentials such as password reset, WebAuthn deletion, etc.
 * @parameters:
 * - filter: is a JSON object that accepts filter parameters
 *      - id: [Required] the user ID to update
 *      - realm [Optional] the realm name (defaults to current realm)
 */

exports.getCredentials=function(filter){
 return (kcAdminClientHandler.users.getCredentials(filter));
}


/**
 * ***************************** - deleteCredential - *******************************
 * deleteCredential method allows you to delete a specific credential (e.g., password, OTP, WebAuthn, etc.) from a user.
 * This is useful when you want to invalidate or remove a credential, forcing the user to reconfigure or reset it.
 * @parameters:
 * - accountInfo: is a JSON object that accepts this parameters
 *      - id: [Required] the user ID to update
 *      - credentialId [Required] the credentils identifier
 */

exports.deleteCredential=function(accountInfo){
 return (kcAdminClientHandler.users.deleteCredential(accountInfo));
}

/**
 * ***************************** - getProfile - *******************************
 * It is a method  that retrieves the user profile dictionary information.
 * This includes basic user details such as username, email, first name,  last name,
 * and other attributes associated with the user profile in the Keycloak realm.
 */

exports.getProfile=function(){
 return (kcAdminClientHandler.users.getProfile());
}


/**
 * ***************************** - addToGroup - *******************************
 * Adds a user to a specific group within the realm.
 * @parameters:
 * - parameters: is a JSON object that accepts this parameters
 *      - id [required]: The user ID of the user you want to add to the group.
 *      - groupId [required]: The group ID of the group the user should be added to.
 */

exports.addToGroup=function(parameters){
 return (kcAdminClientHandler.users.addToGroup(parameters));
}

/**
 * ***************************** - delFromGroup - *******************************
 * Removes a user from a specific group in Keycloak.
 * @parameters:
 * - parameters: is a JSON object that accepts this parameters
 *      - id [required]: The user ID of the user you want to remove to the group.
 *      - groupId [required]: The group ID of the group the user should be removed to.
 */
exports.delFromGroup=function(parameters){
 return (kcAdminClientHandler.users.delFromGroup(parameters));
}

/**
 * ***************************** - countGroups - *******************************
 * Retrieves the number of groups that a given user is a member of.
 * @parameters:
 * - filter is a JSON object that accepts filter parameters, such as { id: '' }
 *       - id: [required] The user ID of the user whose group membership count you want to retrieve.
 *       - search: [optional] a String containing group name such "cool-group",
 */
exports.countGroups=function(filter){
 return (kcAdminClientHandler.users.countGroups(filter));
}


/**
 * ***************************** - listGroups - *******************************
 * Returns the list of groups that a given user is a member of.
 * @parameters:
 * - filter is a JSON object that accepts filter parameters, such as { id: '' }
 *      - id: [required] The user ID of the user whose group membership you want to retrieve.
 *      - search: [optional] a String containing group name such "cool-group",
 */
exports.listGroups=function(filter){
 return (kcAdminClientHandler.users.listGroups(filter));
}

/**
 * ***************************** - addRealmRoleMappings - *******************************
 * Assigns one or more realm-level roles to a user.
 * Returns a promise that resolves when the roles are successfully assigned. No return value on success.
 *
 * @parameters:
 * - roleMapping is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user to whom the roles will be assigned..
 *     - roles: [required] An array of role representations to assign. Each role object should contain at least:
 *          - id: [required] The role Id
 *          - name: [required] The role Name
 */
exports.addRealmRoleMappings=function(roleMapping){
 return (kcAdminClientHandler.users.addRealmRoleMappings(roleMapping));
}


/**
 * ***************************** - delRealmRoleMappings - *******************************
 * Removes one or more realm-level roles from a specific user.
 * Only roles that were directly assigned to the user can be removed with this method.
 * This method does not affect composite roles. It only removes directly assigned realm roles.
 *
 * @parameters:
 * - roleMapping is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user to whom the roles will be removed..
 *     - roles: [required] An array of role representations to remove. Each role object should contain at least:
 *          - id: [required] The role Id
 *          - name: [required] The role Name
 */
exports.delRealmRoleMappings=function(roleMapping){
 return (kcAdminClientHandler.users.delRealmRoleMappings(roleMapping));
}


/**
 * ***************************** - listAvailableRealmRoleMappings - *******************************
 * Retrieves all available realm-level roles that can still be assigned to a specific user.
 * These are the roles that exist in the realm but have not yet been mapped to the user.
 *
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user for whom to list assignable realm roles.
 */
exports.listAvailableRealmRoleMappings=function(filter){
 return (kcAdminClientHandler.users.listAvailableRealmRoleMappings(filter));
}


/**
 * ***************************** - listRoleMappings - *******************************
 * Retrieves all realm-level and client-level roles that are currently assigned to a specific user.
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The user ID for which you want to fetch the assigned role mappings.
 *
 * @return a promise resolving to an object with two main properties:
 * - realmMappings: array of realm-level roles assigned to the user.
 * - clientMappings: object containing client roles grouped by client.
 */
exports.listRoleMappings=function(filter){
 return (kcAdminClientHandler.users.listRoleMappings(filter));
}


/**
 * ***************************** - listRealmRoleMappings - *******************************
 * Retrieves the realm-level roles that are currently assigned to a specific user.
 * Unlike listRoleMappings, this method focuses only on realm roles and excludes client roles.
 *
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The user ID for which you want to fetch the assigned role mappings.
 *
 * @return a promise resolving to an array of role objects (realm roles)
 */
exports.listRealmRoleMappings=function(filter){
 return (kcAdminClientHandler.users.listRealmRoleMappings(filter));
}

/**
 * ***************************** - listCompositeRealmRoleMappings - *******************************
 * Retrieves the list of composite realm-level roles that are effectively assigned to a user.
 * Composite roles include both directly assigned realm roles and any roles inherited through composite role structures.
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The user ID for which you want to fetch the assigned role mappings.
 *
 * @return a promise resolving to an array of role objects (realm roles)
 */
exports.listCompositeRealmRoleMappings=function(filter){
 return (kcAdminClientHandler.users.listCompositeRealmRoleMappings(filter));
}



/**
 * ***************************** - addClientRoleMappings - *******************************
 * Assigns one or more client-level roles to a user.
 * This method adds role mappings from a specific client to the given user,
 * allowing the user to have permissions defined by those client roles.
 *
 * @parameters:
 * - role_mapping is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user to whom roles will be assigned.
 *     - clientUniqueId:[required] The internal ID of the client that owns the roles.
 *     - roles: [required] Array of role objects representing the client roles to assign, at least id and name should appear:
 *          - id:[required]: role identifier
 *          - name:[required]: role name
 *          - [optional] Other fields
 */
exports.addClientRoleMappings=function(role_mapping){
 return (kcAdminClientHandler.users.addClientRoleMappings(role_mapping));
}



/**
 * ***************************** - listAvailableClientRoleMappings - *******************************
 * Retrieves a list of client roles that are available to be assigned to a specific user,
 * meaning roles defined in a client that the user does not yet have assigned.
 * This is useful for determining which roles can still be mapped to the user.
 *
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user
 *     - clientUniqueId:[required] The internal ID of the client (not the clientId string)
 */
exports.listAvailableClientRoleMappings=function(filter){
 return (kcAdminClientHandler.users.listAvailableClientRoleMappings(filter));
}


/**
 * ***************************** - listCompositeClientRoleMappings - *******************************
 * Retrieves all composite roles assigned to a specific user for a given client.
 * Composite roles are roles that include other roles.
 * This method returns not only directly assigned roles, but also roles inherited through composite definitions for that client.
 *
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user
 *     - clientUniqueId:[required] The internal ID of the client (not the clientId string)
 */

exports.listCompositeClientRoleMappings=function(filter){
 return (kcAdminClientHandler.users.listCompositeClientRoleMappings(filter));
}


/**
 * ***************************** - listClientRoleMappings - *******************************
 * Retrieves all client-level roles directly assigned to a user for a specific client.
 * Unlike composite role mappings, this method only returns the roles that were explicitly
 * assigned to the user from the client, without including roles inherited via composite definitions.
 *
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user
 *     - clientUniqueId:[required] The internal ID of the client (not the clientId string)
 */
exports.listClientRoleMappings=function(filter){
 return (kcAdminClientHandler.users.listClientRoleMappings(filter));
}


/**
 * ***************************** - delClientRoleMappings - *******************************
 * Removes one or more client-level roles previously assigned to a specific user.
 * This operation unlinks the direct association between the user and the specified roles within the given client.
 *
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user to whom roles will be removed.
 *     - clientUniqueId:[required] The internal ID of the client that owns the roles.
 *     - roles: [required] Array of role objects representing the client roles to assign, at least id and name should appear:
 *         - id:[required]: role identifier
 *         - name:[required]: role name
 *         - [optional] Other fields
 */
exports.delClientRoleMappings=function(filter){
 return (kcAdminClientHandler.users.delClientRoleMappings(filter));
}



/**
 * ***************************** - listSessions - *******************************
 * Retrieves a list of active user sessions for the specified user.
 * Each session represents a login session associated with that user across different clients or devices.
 *
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user whose sessions will be listed.
 *     - clientId: [optional] The internal ID of the client that owns the roles.
 */
exports.listSessions=function(filter){
 return (kcAdminClientHandler.users.listSessions(filter));
}


/**
 * ***************************** - listOfflineSessions - *******************************
 * Retrieves a list of offline sessions for the specified user.
 * Offline sessions represent long-lived refresh tokens that allow clients to obtain new access tokens
 * without requiring the user to be actively logged in.
 *
 *@parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user whose sessions will be listed
 *     - clientId: [optional] The client ID whose sessions are being checked
 */
exports.listOfflineSessions=function(filter){
 return (kcAdminClientHandler.users.listOfflineSessions(filter));
}


/**
 * ***************************** - logout - *******************************
 * Forces logout of the specified user from all active sessions, both online and offline.
 * This invalidates the user’s active sessions and tokens, effectively logging them out from all clients
 *
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user whose sessions will be closed
 */
exports.logout=function(filter){
 return (kcAdminClientHandler.users.logout(filter));
}


/**
 * ***************************** - listConsents - *******************************
 * Retrieves the list of OAuth2 client consents that the specified user has granted.
 * Each consent represents a client application that the user has authorized to access their data with specific scopes.
 *
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user whose client consents can be retrieved.
 */
exports.listConsents=function(filter){
 return (kcAdminClientHandler.users.listConsents(filter));
}


/**
 * ***************************** - revokeConsent - *******************************
 * Revokes a previously granted OAuth2 client consent for a specific user.
 * This operation removes the authorization a user has given to a client,
 * effectively disconnecting the client from the user's account and invalidating associated tokens.
 *
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user whose consent should be revoked
 *     - clientId: [required] TThe client ID for which the consent should be revoked
 */
exports.revokeConsent=function(filter){
 return (kcAdminClientHandler.users.revokeConsent(filter));
}


/**
 * ***************************** - impersonation - *******************************
 * Initiates an impersonation session for a specific user.
 * This allows an administrator to act on behalf of the user, gaining access as if they were logged in as that user.
 * This is typically used for debugging or support purposes.
 * Returns an object containing a redirect URL or token used to impersonate the user.
 *
 * @parameters:
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the user to impersonate.
 *     - realmName: [optional] the name of the realm
 */
exports.impersonation=function(filter){
 return (kcAdminClientHandler.users.impersonation(filter));
}

/**
 * ***************************** - listFederatedIdentities - *******************************
 * Retrieves a list of federated identities (external identity providers) associated with a specific user.
 * This is useful if the user has linked their account with external providers like Google, Facebook, etc.
 *
 * @parameters:
 *
 * - filter is a JSON object that accepts this parameters:
 *     - id: [required] The unique ID of the user for whom you want to fetch the federated identities.
 */
exports.listFederatedIdentities=function(filter){
 return (kcAdminClientHandler.users.listFederatedIdentities(filter));
}


/**
 * ***************************** - addToFederatedIdentity - *******************************
 * Adds (links) an external identity provider to a specific Keycloak user.
 * This is typically used to associate a federated identity (such as a Google or Facebook account) with an existing Keycloak user.
 *
 * @parameters:
 * - options is a JSON object that accepts this parameters:
 *      - id: [required] The ID of the Keycloak user to whom the federated identity should be added.
 *      - federatedIdentityId: [required] The alias of the identity provider (e.g., "google" or "facebook").
 *      - federatedIdentity [required] An object with the following fields:
 *           - identityProvider:[required] The alias of the identity provider.
 *           - userId: [required] The ID of the user in the external identity provider.
 *           - userName: [required] The username in the external identity provider.
 */
exports.addToFederatedIdentity=function(options){
 return (kcAdminClientHandler.users.addToFederatedIdentity(options));
}



/**
 * ***************************** - delFromFederatedIdentity - *******************************
 * Removes (unlinks) a federated identity provider from a specific Keycloak user.
 * This operation dissociates the external identity (e.g., a Google or Facebook account) previously linked to the user.
 *
 * @parameters:
 * - options is a JSON object that accepts this parameters:
 *     - id: [required] The ID of the Keycloak user from whom the federated identity should be removed.
 *     - federatedIdentityId: [required] The alias of the identity provider (e.g., "google" or "facebook").
 */
exports.delFromFederatedIdentity=function(options){
 return (kcAdminClientHandler.users.delFromFederatedIdentity(options));
}

/**
 * ***************************** - getUserStorageCredentialTypes - *******************************
 * For more details, see the keycloak-admin-client package in the Keycloak GitHub repository.
 */
exports.getUserStorageCredentialTypes=function(){
 return (kcAdminClientHandler.users.getUserStorageCredentialTypes());
}

/**
 * ***************************** - CREATE - *******************************
 * For more details, see the keycloak-admin-client package in the Keycloak GitHub repository.
 */
exports.updateCredentialLabel=function(){
 return (kcAdminClientHandler.users.updateCredentialLabel());
}


