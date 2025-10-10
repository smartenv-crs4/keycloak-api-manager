/**
 * **************************************************************************************************
 * **************************************************************************************************
 * Clients entity provides a set of methods to manage clients (i.e., applications or services) within a realm.
 * Clients represent entities that want to interact with Keycloak for authentication or authorization (e.g., web apps, APIs).
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler=null;
exports.setKcAdminClient=function(kcAdminClient){
 kcAdminClientHandler=kcAdminClient;
}


/**
 * ***************************** - CREATE - *******************************
 * Creates a new client with the provided configuration
 * @parameters:
 * - client_dictionary:  An object(JSON) of type ClientRepresentation, containing the configuration for the new client.
 *      - clientId: [required] string	The unique identifier for the client (required).
 *      - name:	[required] string	A human-readable name for the client.
 *      - enabled: [optional]	boolean	Whether the client is enabled. Default is true.
 *      - publicClient:	[optional] boolean	Whether the client is public (no secret).
 *      - secret:	[optional] string	Client secret (if not a public client).
 *      - redirectUris:	[optional] string[]	List of allowed redirect URIs (for browser-based clients).
 *      - baseUrl:	[optional] string	Base URL of the client.
 *      - protocol:	[optional] string	Protocol to use (openid-connect, saml, etc.).
 *      - standardFlowEnabled:	[optional] boolean	Enables standard OAuth2 Authorization Code Flow.
 *      - {Other client fields}: [optional] Other client fields
 */
exports.create=function(client_dictionary){
 return (kcAdminClientHandler.clients.create(client_dictionary));
}



/**
 * ***************************** - find - *******************************
 * Retrieves a list of all clients in the current realm, optionally filtered by query parameters.
 * This method is useful for listing all registered applications or services in Keycloak or searching
 * for a specific one using filters like clientId.
 * @parameters:
 * - filter: A JSON structure used to filter results based on specific fields:
 *      - clientId: [optional] string filter to search clients by their clientId.
 *      - viewableOnly: [optional] boolean value. If true, returns only clients that the current user is allowed to view.
 *      - first:[optional] Pagination: index of the first result to return.
 *      - max:[optional] Pagination: maximum number of results to return.
 */
exports.find=function(filter){
 return (kcAdminClientHandler.clients.find(filter));
}


/**
 * ***************************** - findOne - *******************************
 * Retrieves detailed information about a specific client within a realm by its unique client ID.
 * This method fetches the client’s configuration, including its settings, roles, protocols, and other metadata.
 * @parameters:
 * - filter: A JSON structure used to filter results based on specific fields:
 *     - id: [optional]	The unique identifier of the client to retrieve
 */
exports.findOne=function(filter){
 return (kcAdminClientHandler.clients.findOne(filter));
}


/**
 * ***************************** - del - *******************************
 * Deletes a client from the realm using its internal ID.
 * This operation is irreversible and will remove the client and all its associated roles, permissions, and configurations.
 * @parameters:
 * - filter: A JSON structure used to filter results based on specific fields:
 *      - id: [required] The internal ID of the client to delete (not clientId)
 */
exports.del=function(filter){
 return (kcAdminClientHandler.clients.del(filter));
}



/**
 * ***************************** - update - *******************************
 * Updates the configuration of an existing client in the realm.
 * You can modify various attributes such as the client name, redirect URIs, protocol, access type, and more.
 * @parameters:
 * - filter: A JSON structure used to filter results based on specific fields:
 *     - id: [required] The unique ID of the client you want to update
 * - clientRepresentation: [required] The new configuration for the client
 */
exports.update=function(filter,clientRepresentation){
 return (kcAdminClientHandler.clients.update(filter,clientRepresentation));
}



/**
 * ***************************** - createRole - *******************************
 * Creates a new client role under a specific client.
 * Client roles are roles associated with a specific client (application), and are useful
 * for fine-grained access control within that client.
 * @parameters:
 * - role_parameters: JSON structure that defines the role like:
 *     - id: [required] The internal ID of the client where the role will be created.
 *     - name: [required] Name of the new role.
 *     - description: [optional] Optional description of the role.
 *     - [optional] Other role fields
 */
exports.createRole=function(role_parameters){
 return (kcAdminClientHandler.clients.createRole(role_parameters));
}



/**
 * ***************************** - findRole - *******************************
 * Retrieves a specific client role by name from a given client.
 * This is useful when you want to inspect or verify the properties of a role defined within a particular client.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The internal ID of the client (not the clientId string) where the role is defined.
 *     - roleName: [required] The name of the client role you want to find.
 */
exports.findRole=function(filter){
 return (kcAdminClientHandler.clients.findRole(filter));
}



/**
 * ***************************** - updateRole - *******************************
 * Updates the attributes of a specific client role in Keycloak.
 * This includes changing the role's name, description, or any associated metadata.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The internal ID of the client (not the clientId string) where the role is defined.
 *      - roleName: [required] The name of the client role you want to update
 * - roleRepresentation: [required] An object with the updated properties of the role
 */
exports.updateRole=function(filter,roleRepresentation){
 return (kcAdminClientHandler.clients.updateRole(filter,roleRepresentation));
}


/**
 * ***************************** - delRole - *******************************
 * Deletes a client role by its name for a specific client.
 * This permanently removes the role from the specified client in Keycloak.
 * A promise that resolves to void if the deletion is successful.
 * If the role does not exist or the operation fails, an error will be thrown.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The internal ID of the client (not the clientId string) where the role is defined.
 *      - roleName: [required] The name of the client role you want to delete.
 */
exports.delRole=function(filter){
 return (kcAdminClientHandler.clients.delRole(filter));
}




/**
 * ***************************** - listRoles - *******************************
 * Retrieves all roles defined for a specific client within the realm.
 * These roles can be used to assign permissions to users or groups for the specific client application.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The internal ID of the client (not clientId)
 */
exports.listRoles=function(filter){
 return (kcAdminClientHandler.clients.listRoles(filter));
}



/**
 * ***************************** - getClientSecret - *******************************
 * Retrieves the client secret associated with a confidential client in Keycloak.
 * This is typically used for clients using client_credentials or authorization_code flows where the secret is required to authenticate the client.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The internal ID of the client (not clientId)
 */
exports.getClientSecret=function(filter){
 return (kcAdminClientHandler.clients.getClientSecret(filter));
}


/**
 * ***************************** - generateNewClientSecret - *******************************
 * Generates a new client secret for a confidential client in Keycloak. This will overwrite the existing secret and return the newly generated one.
 * It is useful when rotating credentials or recovering access.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The internal ID of the client (not clientId)
 */
exports.generateNewClientSecret=function(filter){
 return (kcAdminClientHandler.clients.creatgenerateNewClientSecrete(filter));
}


/**
 * ***************************** - generateRegistrationAccessToken - *******************************
 * Generates a new registration access token for a client. This token allows the client to make authorized requests to the client registration REST API.
 * It’s particularly useful in dynamic client registration workflows or when automating client updates via external systems.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The internal ID of the client (not clientId)
 */
exports.generateRegistrationAccessToken=function(filter){
 return (kcAdminClientHandler.clients.generateRegistrationAccessToken(filter));
}



/**
 * ***************************** - invalidateSecret - *******************************
 * Invalidates (revokes) the current client secret, making it no longer valid.
 * After invalidation, the client will no longer be able to authenticate using the old secret and a new secret should be generated.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The internal ID of the client (not clientId)
 */
exports.invalidateSecret=function(filter){
 return (kcAdminClientHandler.clients.invalidateSecret(filter));
}


/**
 * ***************************** - getInstallationProviders - *******************************
 * Retrieves a list of available installation providers for a specific client.
 *     Installation providers define how client configuration can be exported or installed,
 * for example as a JSON file, Keycloak XML adapter config, or other formats supported by Keycloak.
 * Return an array of installation provider objects, each representing a supported installation format for the client.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The internal ID of the client (not clientId)
 *
 */
exports.getInstallationProviders=function(filter){
 return (kcAdminClientHandler.clients.getInstallationProviders(filter));
}


/**
 * ***************************** - listPolicyProviders - *******************************
 * The method retrieves the list of available policy providers for a client’s resource server.
 * Policy providers define the logic used to evaluate authorization decisions (e.g., role-based, group-based, time-based, JavaScript rules).
 * This method allows you to see which policy types are supported and available to be created for a given client.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The ID of the client (resource server) for which to list available policy providers.
 */
exports.listPolicyProviders=function(filter){
 return (kcAdminClientHandler.clients.listPolicyProviders(filter));
}


/**
 * ***************************** - getServiceAccountUser - *******************************
 * Retrieves the service account user associated with a specific client.
 * In Keycloak, clients configured as service accounts have a corresponding user representing them,
 * which can be used for token-based access and permissions management.
 * Return an object representing the user linked to the client's service account,
 * including details such as user ID, username, email, and other user attributes.
 *
 *  @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The internal ID of the client (not clientId)
 *
 */
exports.getServiceAccountUser=function(filter){
 return (kcAdminClientHandler.clients.getServiceAccountUser(filter));
}


/**
 * ***************************** - addDefaultClientScope - *******************************
 * The method is used to associate a client scope as a default scope for a specific client.
 * Default scopes are automatically included in tokens issued to the client.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The internal ID of the client (not clientId)
 *     - clientScopeId: [required] The ID of the client scope you want to add as a default scope.
 */
exports.addDefaultClientScope=function(filter){
 return (kcAdminClientHandler.clients.addDefaultClientScope(filter));
}



/**
 * ***************************** - delDefaultClientScope - *******************************
 * This function detaches a default client scope (either default or optional) from a client.
 * Default scopes are automatically assigned to tokens issued for the client.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The internal ID of the client (not clientId)
 *     - clientScopeId: [required]  The ID of the client scope to be removed.
 */
exports.delDefaultClientScope=function(filter){
 return (kcAdminClientHandler.clients.delDefaultClientScope(filter));
}



/**
 * ***************************** - delOptionalClientScope - *******************************
 * The method is used to remove an optional client scope from a specific client.
 * Optional client scopes are those that are not automatically assigned to clients but can be requested during authentication.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The internal ID of the client (not clientId)
 *      - clientScopeId: [required]  The ID of the client scope you want to unlink from the client.
 */
exports.delOptionalClientScope=function(filter){
 return (kcAdminClientHandler.clients.delOptionalClientScope(filter));
}


/**
 * ***************************** - listDefaultClientScopes - *******************************
 * This method lists those default scopes for a given client.
 * Default client scopes are automatically assigned to a client during token requests (e.g., openid, profile).
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The client ID of the client whose default client scopes you want to list.
 */
exports.listDefaultClientScopes=function(filter){
 return (kcAdminClientHandler.clients.listDefaultClientScopes(filter));
}



/**
 * ***************************** - listOptionalClientScopes - *******************************
 * The method is used to retrieve all optional client scopes currently assigned to a specific client.
 * Optional scopes are those that a client can request explicitly but are not automatically applied.
 *
 *  @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The client ID of the client whose optional client scopes you want to list.
 */
exports.listOptionalClientScopes=function(filter){
 return (kcAdminClientHandler.clients.listOptionalClientScopes(filter));
}



/**
 * ***************************** - addOptionalClientScope - *******************************
 * The method is used to assign an optional client scope to a specific client.
 * Optional scopes are not automatically applied during login unless explicitly requested by the client in the scope parameter.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The internal client ID of the client
 *     - clientScopeId: [required] The ID of the client scope you want to assign as optional.
 */
exports.addOptionalClientScope=function(filter){
 return (kcAdminClientHandler.clients.addOptionalClientScope(filter));
}



/**
 * ***************************** - listScopeMappings - *******************************
 * This method is used to list all scope mappings (roles assigned via scopes) for a given client in Keycloak.
 * This includes realm-level roles and client-level roles that are mapped to the client.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The ID of the client whose scope mappings you want to list.
 */
exports.listScopeMappings=function(filter){
 return (kcAdminClientHandler.clients.listScopeMappings(filter));
}



/**
 * ***************************** - listAvailableClientScopeMappings - *******************************
 * The method is used to list the client roles that are available to be mapped (but not yet assigned) to a specific client in Keycloak.
 * This helps you discover which client roles you can still add as scope mappings.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the target client (the one receiving the scope mappings).
 *     - client: [required] The client ID of the source client (the one that owns the roles to be mapped).
 */
exports.listAvailableClientScopeMappings=function(filter){
 return (kcAdminClientHandler.clients.listAvailableClientScopeMappings(filter));
}



/**
 * ***************************** - addClientScopeMappings - *******************************
 * The method is used to assign client roles (from a source client) to another client as scope mappings.
 * This means the target client will inherit these roles when requesting tokens.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The ID of the target client (the one receiving the scope mappings).
 *      - client: [required] The client ID of the source client (the one that owns the roles to be mapped).
 *      - roles: [required] An array of role representations(RoleRepresentation) to be mapped. At minimum, each role needs its id and name.
 *           - id: [required] The role ID
 *           - name: [required] The role name
 *           - {other RoleRepresentation fields}
 */
exports.addClientScopeMappings=function(filter){
 return (kcAdminClientHandler.clients.addClientScopeMappings(filter));
}



/**
 * ***************************** - listClientScopeMappings - *******************************
 * The method is used to list all client role mappings assigned to a client.
 * It shows which roles from another client (source) are already mapped to the target client.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the target client (where roles are mapped)
 *     - client: [required] The ID of the source client (the one that owns the roles being mapped)
 */
exports.listClientScopeMappings=function(filter){
 return (kcAdminClientHandler.clients.listClientScopeMappings(filter));
}


/**
 * ***************************** - listCompositeClientScopeMappings - *******************************
 * The method is used to list both direct and composite (inherited) client role mappings that are assigned to a target client.
 * It differs from listClientScopeMappings because it expands composite roles and shows all roles that are effectively available to the client.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the target client (the one receiving the mappings)
 *     - client: [required] The ID of the source client (the one that owns the roles)
 */
exports.listCompositeClientScopeMappings=function(filter){
 return (kcAdminClientHandler.clients.listCompositeClientScopeMappings(filter));
}


/**
 * ***************************** - delClientScopeMappings - *******************************
 * The method is used to remove one or more client role mappings from a target client.
 * It is the reverse of clients.addClientScopeMappings
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] ID of the target client (the client losing the roles)
 *      - client: [required] ID of the source client (the client where the roles are defined)
 *      - roles: [required] array of RoleRepresentation roles to remove. Each role needs at least id or name
 *           - id: [required] The role ID
 *           - name: [required] The role name
 *           - {other RoleRepresentation fields}
 */
exports.delClientScopeMappings=function(filter){
 return (kcAdminClientHandler.clients.delClientScopeMappings(filter));
}



/**
 * ***************************** - listAvailableRealmScopeMappings - *******************************
 * The method is used to retrieve all realm-level roles that are available to be assigned to a specific client.
 * These are roles defined at the realm level that the client does not yet have mapped, allowing you to see what can be added.
 * @parameters:
 *  filter: JSON structure that defines the filter parameters:
 *      - id: [required] The ID of the client for which you want to list available realm-level role mappings.
 */
exports.listAvailableRealmScopeMappings=function(filter){
 return (kcAdminClientHandler.clients.listAvailableRealmScopeMappings(filter));
}


/**
 * ***************************** - listAvailableRealmScopeMappings - *******************************
 * The method is used to retrieve all realm-level roles that are available to be assigned to a specific client.
 * These are roles defined at the realm level that the client does not yet have mapped, allowing you to see what can be added.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client for which you want to list available realm-level role mappings.
 */
exports.listAvailableRealmScopeMappings=function(filter){
 return (kcAdminClientHandler.clients.listAvailableRealmScopeMappings(filter));
}


/**
 * ***************************** - listRealmScopeMappings - *******************************
 * The method retrieves the realm-level roles currently assigned to a client as part of its scope mappings.
 * This shows which realm roles the client is allowed to request on behalf of users.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The client ID whose realm-level scope mappings you want to list
 */
exports.listRealmScopeMappings=function(filter){
 return (kcAdminClientHandler.clients.listRealmScopeMappings(filter));
}



/**
 * ***************************** - listCompositeRealmScopeMappings - *******************************
 * The method retrieves all composite realm-level roles associated with a client through its scope mappings.
 * This includes not only the roles directly mapped to the client, but also roles inherited through composite roles.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The client ID whose composite realm scope mappings you want to list
 */
exports.listCompositeRealmScopeMappings=function(filter){
 return (kcAdminClientHandler.clients.listCompositeRealmScopeMappings(filter));
}



/**
 * ***************************** - addRealmScopeMappings - *******************************
 * The method is used to assign realm-level role mappings to a specific client.
 * This effectively grants the client access to the specified realm roles.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The client ID that will receive the new realm-level role mappings.
 * - roles: [required] An array of realm roles to be mapped to the client. Each role object typically contains at least id and name
 */
exports.addRealmScopeMappings=function(filter,roles){
 return (kcAdminClientHandler.clients.addRealmScopeMappings(filter,roles));
}



/**
 * ***************************** - delRealmScopeMappings - *******************************
 * The method removes realm-level roles from a client’s scope mappings.
 * This is the opposite of clients.addRealmScopeMappings.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The client ID whose realm role mapping must be removed.
 * - roles: [required] An array of role objects you want to remove. Each role object must at least contain the id or name field.
 */
exports.delRealmScopeMappings=function(filter,roles){
 return (kcAdminClientHandler.clients.delRealmScopeMappings(filter,roles));
}


/**
 * ***************************** - listSessions - *******************************
 * The method retrieves active user sessions for a specific client.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The client ID whose session must be retrieved
 *      - first:[optional] pagination field. First result index for pagination.
 *      - max: [optional] pagination field. Maximum number of results.
 */
exports.listSessions=function(filter){
 return (kcAdminClientHandler.clients.listSessions(filter));
}



/**
 * ***************************** - listOfflineSessions - *******************************
 * The method retrieves offline sessions associated with a given client.
 * Offline sessions are created when a client uses offline tokens (refresh tokens with offline_access scope)
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The client ID whose session must be retrieved
 *     - first:[optional] pagination field. First result index for pagination.
 *     - max: [optional] pagination field. Maximum number of results.
 */
exports.listOfflineSessions=function(filter){
 return (kcAdminClientHandler.clients.listOfflineSessions(filter));
}


/**
 * ***************************** - getSessionCount - *******************************
 * The method retrieves the number of active user sessions for a given client.
 * This includes online sessions, not offline sessions (those are retrieved with listOfflineSessions).
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The client ID whose session must be retrieved
 */
exports.getSessionCount=function(filter){
 return (kcAdminClientHandler.clients.getSessionCount(filter));
}





/**
 * ***************************** - getOfflineSessionCount - *******************************
 * The method retrieves the number of offline sessions associated with a given client.
 * Offline sessions represent sessions where the user has a valid offline token, typically used for long-lived access
 * without requiring active login.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client for which you want to count offline sessions.
 */
exports.getOfflineSessionCount=function(filter){
 return (kcAdminClientHandler.clients.getOfflineSessionCount(filter));
}




/**
 * ***************************** - addClusterNode - *******************************
 * The method is used to register a cluster node for a specific Keycloak client.
 * This is relevant in scenarios where you are running Keycloak in a clustered environment and want to synchronize
 * client sessions and node information across multiple instances.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client for which you want to add a cluster node.
 *     - node: [required] The name or identifier of the cluster node to register.
 */
exports.addClusterNode=function(filter){
 return (kcAdminClientHandler.clients.addClusterNode(filter));
}



/**
 * ***************************** - deleteClusterNode - *******************************
 * The method in Keycloak Admin Client is used to remove a previously registered cluster node for a specific client.
 * This is useful in clustered environments when a node is no longer active or should be deregistered from the
 * client session synchronization.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The ID of the client for which you want to remove a cluster node.
 *      - node: [required] The name or identifier of the cluster node to remove.
 */
exports.deleteClusterNode=function(filter){
 return (kcAdminClientHandler.clients.deleteClusterNode(filter));
}



/**
 * ***************************** - generateAndDownloadKey - *******************************
 * The method is used to generate a new cryptographic key for a client and download it.
 * This is typically used for clients that require client credentials, JWT signing, or encryption.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The ID of the client for which you want to generate the key
 *      - attr: [required] The name of the client attribute where the generated key will be saved
 * - config: JSON structure that defines the configuration parameters
 *      - format: [required] Keystore format. Must be "JKS" or "PKCS12"
 *      - keyAlias: [required] Alias of the key in the keystore
 *      - keyPassword: [required] Password of the key in the keystore
 *      - storePassword: [required] keystore password
 *      - realmAlias: [optional] Alias of the realm
 *      - realmCertificate: [optional] Indicates whether the realm certificate should be added to the keystore. Set to true to include it
 */
exports.generateAndDownloadKey=function(filter,config){
 return (kcAdminClientHandler.clients.generateAndDownloadKey(filter,config));
}





/**
 * ***************************** - generateKey - *******************************
 * The method is used to generate a new cryptographic key for a client without automatically downloading it.
 * This is useful for creating new signing or encryption keys associated with a client directly within Keycloak.
 * Unlike clients.generateAndDownloadKey, this method only generates the key and stores it in Keycloak. It does not return the key material to the caller
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client for which you want to generate the key
 *     - attr: [required] The name of the client attribute where the generated key will be saved
 */
exports.generateKey=function(filter){
 return (kcAdminClientHandler.clients.generateKey(filter));
}


/**
 * ***************************** - getKeyInfo - *******************************
 * The method is used to retrieve metadata about the keys associated with a specific client.
 * It does not return the actual key material but provides information such as the key type, provider, algorithm, and status.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client whose key information should be retrieved
 *     - attr: [optional] The name of the client attribute to get
 */
exports.getKeyInfo=function(filter){
 return (kcAdminClientHandler.clients.getKeyInfo(filter));
}



/**
 * ***************************** - downloadKey - *******************************
 * The method Downloads a client’s cryptographic key (certificate) from Keycloak.
 * This is typically used when you need to retrieve the public certificate of a client for token validation, signing, or encryption purposes.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The ID of the client whose key information should be downloaded
 *      - attr: [optional] Specifies which key/certificate to download. Common values include:
 *           - "jwt.credential": default JWT signing key.
 *           - "saml.signing": SAML signing certificate.
 *           - "rsa-generated": generated RSA key pair.
 * - config: JSON structure that defines the configuration parameters
 *      - format: [required] Keystore format. Must be "JKS" or "PKCS12"
 *      - keyAlias: [required] Alias of the key in the keystore
 *      - keyPassword: [required] Password of the key in the keystore
 *      - storePassword: [required] keystore password
 *      - realmAlias: [optional] Alias of the realm
 *      - realmCertificate: [optional] Indicates whether the realm certificate should be added to the keystore. Set to true to include it
 */
exports.downloadKey=function(filter,config){
 return (kcAdminClientHandler.clients.downloadKey(filter,config));
}




/**
 * ***************************** - createAuthorizationScope - *******************************
 * The method in the Keycloak Admin Client is used to create a new authorization scope for a specific client.
 * Authorization scopes are part of Keycloak’s Authorization Services and represent fine-grained permissions
 * that can later be linked to resources and policies.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] TThe ID of the client for which the scope will be created
 * - scopeRepresentation:[required] The details of the new authorization scope as:
 *     - name: [required] The unique name of the scope.
 *     - displayName: [optional] A human-friendly name for UI purposes
 *     - iconUri [optional] A URI pointing to an icon representing the scope
 *     - {other scope representation fields}
 */
exports.createAuthorizationScope=function(filter,scopeRepresentation){
 return (kcAdminClientHandler.clients.createAuthorizationScope(filter,scopeRepresentation));
}



/**
 * ***************************** - listAllScopes - *******************************
 * The method is used to retrieve all available scopes for a specific client.
 * This includes both default scopes and optional scopes that can be assigned to the client.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client whose scopes you want to list
 */
exports.listAllScopes=function(filter){
 return (kcAdminClientHandler.clients.listAllScopes(filter));
}



/**
 * ***************************** - updateAuthorizationScope - *******************************
 * The method is used to update an existing authorization scope for a specific client.
 * Authorization scopes define permissions that can be used in policies and permissions for the client’s resources.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The ID of the client to which the scope belongs
 *      - scopeId [required] The ID of the authorization scope to update
 * - AuthorizationScopeRepresentation [required]: JSON structure that defines the authorization scope representation update
 * - name: The new name of the scope
 *      - displayName: The human-readable name of the scope
 *      - iconUri: Optional URI for an icon representing the scope
 *      - {other attributes}: Additional attributes for the scope
 */
exports.updateAuthorizationScope=function(filter,AuthorizationScopeRepresentation){
 return (kcAdminClientHandler.clients.updateAuthorizationScope(filter,AuthorizationScopeRepresentation));
}





/**
 * ***************************** - getAuthorizationScope - *******************************
 * The method is used to retrieve the details of a specific authorization scope associated with a client.
 * Authorization scopes define permissions that can be applied to resources and policies in Keycloak.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The ID of the client to which the scope belongs
 *      - scopeId [required] The ID of the authorization scope to retrieve
 */
exports.getAuthorizationScope=function(filter){
 return (kcAdminClientHandler.clients.getAuthorizationScope(filter));
}



/**
 * ***************************** - listAllResourcesByScope - *******************************
 * The method is used to retrieve all resources associated with a specific authorization scope for a given client.
 * This allows you to see which resources are governed by a particular scope in the client’s authorization settings.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The ID of the client to which the scope belongs
 *      - scopeId [required] The ID of the authorization scope whose associated resources you want to list.
 */
exports.listAllResourcesByScope=function(filter){
 return (kcAdminClientHandler.clients.listAllResourcesByScope(filter));
}



/**
 * ***************************** - listAllPermissionsByScope - *******************************
 * The method is used to retrieve all permissions associated with a specific authorization scope for a given client.
 * This is helpful for understanding which permissions (policies and rules) are applied when a particular scope is used.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client to query
 *     - scopeId [required] The ID of the authorization scope whose associated permissions you want to list
 */
exports.listAllPermissionsByScope=function(filter){
 return (kcAdminClientHandler.clients.listAllPermissionsByScope(filter));
}


/**
 * ***************************** - listPermissionScope - *******************************
 * The method is used to retrieve all scopes associated with a specific permission for a given client.
 * This allows you to see which scopes a permission controls, helping you manage fine-grained access rules
 * in Keycloak’s Authorization Services (UMA 2.0) framework.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client whose permission scopes you want to list
 *     - permissionId [optional] The ID of the permission whose scopes should be retrieved
 *     - name: [optional] The name of the permission whose scopes should be retrieved
 */
exports.listPermissionScope=function(filter){
 return (kcAdminClientHandler.clients.listPermissionScope(filter));
}



/**
 * ***************************** - importResource - *******************************
 * The method is used to import a resource into a client.
 * This is part of Keycloak’s Authorization Services (UMA 2.0) and allows you to programmatically define
 * resources that a client can protect with policies and permissions.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client to which the resource should be imported
 * - resource [required]  The resource representation object. This typically includes attributes like name, uris, type, scopes, and other Keycloak resource configuration options.
 */
exports.importResource=function(filter,resource){
 return (kcAdminClientHandler.clients.importResource(filter,resource));
}



/**
 * ***************************** - exportResource - *******************************
 * The method is used to export a resource from a client.
 * This allows you to retrieve the full configuration of a resource, including its URIs, scopes,
 * and associated permissions, which can then be backed up, replicated, or modified externally.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client from which to export the resource
 *     - resourceId: [optional] The ID of the resource you want to export
 */
exports.exportResource=function(filter){
 return (kcAdminClientHandler.clients.exportResource(filter));
}




/**
 * ***************************** - createResource - *******************************
 * The method is used to create a new resource under a specific client.
 * A resource represents a protected entity in Keycloak’s authorization services, such as a REST endpoint,
 * a document, or any application-specific asset. This allows you to manage fine-grained access control via policies and permissions.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client where the resource will be created
 * - resourceRepresentation: [required] An object representing the resource configuration. Typical fields defined in https://www.keycloak.org/docs-api/latest/rest-api/index.html#ResourceRepresentation include:
 *     - name: [required] The human-readable name of the resource.
 *     - uris: [optional] Array of URI patterns or paths representing the resource.
 *     - scopes: [optional] Array of scopes associated with the resource.
 *     - type: [optional] Type/category of the resource.
 *     - owner: [optional] Defines the owner of the resource
 */
exports.createResource=function(filter,resourceRepresentation){
 return (kcAdminClientHandler.clients.createResource(filter,resourceRepresentation));
}




/**
 * ***************************** - getResource - *******************************
 * The method is used to retrieve a specific resource of a client by its ID.
 * Resources in Keycloak represent protected entities, such as APIs, documents, or any application-specific assets,
 * that can have associated scopes, policies, and permissions for fine-grained access control.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client that owns the resource
 *     - resourceId: [required] The ID of the resource you want to retrieve
 */
exports.getResource=function(filter){
 return (kcAdminClientHandler.clients.getResource(filter));
}



/**
 * ***************************** - getResourceServer - *******************************
 * The method is used to retrieve the resource server settings of a client.
 * A resource server in Keycloak represents a client that is enabled with Authorization Services,
 * meaning it can define resources, scopes, permissions, and policies for fine-grained access control.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client whose resource server configuration you want to retrieve
 */
exports.getResourceServer=function(filter){
 return (kcAdminClientHandler.clients.getResourceServer(filter));
}



/**
 * ***************************** - updateResourceServer - *******************************
 * The method is used to update the configuration of a client’s resource server.
 * A resource server defines authorization settings such as resources, scopes, permissions,
 * and policies that control fine-grained access to protected assets.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *      - id: [required] The ID of the client whose resource server configuration should be updated
 * - resourceServerRepresentation: [required] An object representing the resource server configuration such as:
 *      - policyEnforcementMode: [optional] Defines how authorization policies are enforced (ENFORCING, PERMISSIVE, or DISABLED)
 *      - decisionStrategy: [optional] The decision strategy for policies (UNANIMOUS, AFFIRMATIVE, or CONSENSUS)
 *      - {Other} : resource server settings depending on your authorization model (resources, scopes, and permissions)
 */
exports.updateResourceServer=function(filter,resourceServerRepresentation){
 return (kcAdminClientHandler.clients.updateResourceServer(filter,resourceServerRepresentation));
}



/**
 * ***************************** - listPermissionsByResource - *******************************
 * The method is used to retrieve all permissions associated with a specific resource within a client’s resource server.
 * This is part of the Keycloak Authorization Services API and helps administrators inspect which permissions are linked to a given protected resource.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client (the resource server)
 *     - resourceId: [required] The ID of the resource for which to list permissions
 */
exports.listPermissionsByResource=function(filter){
 return (kcAdminClientHandler.clients.listPermissionsByResource(filter));
}



/**
 * ***************************** - createPermission - *******************************
 * The method is used to create a new permission for a client.
 * Permissions define which users or roles can access specific resources or scopes within the client,
 * based on policies you configure. This is part of Keycloak’s Authorization Services (UMA 2.0) framework.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client for which the permission will be created
 *     - type: [required] Type of the permission (resource or scope)
 * - permissionRepresentation:[required] An object describing the permission. Common fields include:
 *     - name: [required]  The name of the permission
 *     - resources: [optional] Array of resource IDs this permission applies to (for resource type)
 *     - scopes: [optional] Array of scope IDs this permission applies to (for scope type)
 *     - policies [required] Array of policy IDs associated with this permission
 */
exports.createPermission=function(filter,permissionRepresentation){
 return (kcAdminClientHandler.clients.createPermission(filter,permissionRepresentation));
}



/**
 * ***************************** - findPermissions - *******************************
 * The method is used to search for permissions within a client’s resource server.
 * Permissions in Keycloak represent rules that define how policies are applied to resources or scopes,
 * and this method allows you to list and filter them based on specific criteria.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client (the resource server) where permissions are defined
 *     - name: [optional] Filter permissions by name
 *     - type: [optional] Filter by permission type (e.g., "resource" or "scope")
 *     - resource: [optional] Filter by the resource ID
 *     - scope: [optional] Filter by scope ID
 *     - first: [optional] Index of the first result for pagination
 *     - max: [optional] Maximum number of results to return
 */
exports.findPermissions=function(filter){
 return (kcAdminClientHandler.clients.findPermissions(filter));
}




/**
 * ***************************** - updateFineGrainPermission - *******************************
 * The method updates the fine-grained admin permissions configuration for a specific client.
 * Fine-grained permissions allow you to control which users/roles can manage different aspects of a client
 * (e.g., who can manage roles, protocol mappers, or scope assignments).
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client (the resource server) where permissions are defined
 * - status: JSON structure that defines the fine grain permission
 *     - enabled: [required] Whether fine-grained permissions should be enabled or disabled.
 */
exports.updateFineGrainPermission=function(filter,status){
 return (kcAdminClientHandler.clients.updateFineGrainPermission(filter,status));
}


/**
 * ***************************** - listFineGrainPermissions - *******************************
 * The method retrieves the current fine-grained admin permission settings for a given client.
 * This is useful for checking which permissions are configured (e.g., managing roles, protocol mappers, or client scopes).
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client (the resource server) where permissions are defined
 */
exports.listFineGrainPermissions=function(filter){
 return (kcAdminClientHandler.clients.listFineGrainPermissions(filter));
}



/**
 * ***************************** - getAssociatedScopes - *******************************
 * The method is used to retrieve all scopes associated with a specific permission within a client’s resource server.
 * In Keycloak’s Authorization Services, permissions can be linked to one or more scopes to define the contexts in which they apply. This method allows you to query those associations.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client whose permission scopes you want to list
 *     - permissionId: [required] The ID of the permission whose associated scopes you want to retrieve
 */
exports.getAssociatedScopes=function(filter){
 return (kcAdminClientHandler.clients.getAssociatedScopes(filter));
}



/**
 * ***************************** - getAssociatedPolicies - *******************************
 * The method is used to retrieve all policies associated with a specific permission within a client’s resource server.
 * In Keycloak Authorization Services, permissions can be tied to one or more policies that define the conditions under which access is granted. This method lets you fetch those policy associations
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client whose permission policies you want to list
 *     - permissionId: [required] The ID of the permission whose associated policies you want to retrieve.
 */
exports.getAssociatedPolicies=function(filter){
 return (kcAdminClientHandler.clients.getAssociatedPolicies(filter));
}



/**
 * ***************************** - getAssociatedResources - *******************************
 * The method is used to retrieve all resources linked to a specific permission in a client’s resource server.
 * In Keycloak Authorization Services, permissions can be scoped to one or more resources (such as APIs, endpoints, or domain-specific entities). This method allows you to query those resource associations.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client whose permission resource you want to list
 *     - permissionId: [required] The ID of the permission for which you want to fetch associated resources
 */
exports.getAssociatedResources=function(filter){
 return (kcAdminClientHandler.clients.getAssociatedResources(filter));
}


/**
 * ***************************** - listScopesByResource - *******************************
 * The method is used to list all authorization scopes associated with a specific resource in a client’s resource server.
 * This allows administrators to understand which scopes are directly linked to a protected resource and therefore which permissions can be applied to it.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client (the resource server).
 *     - resourceId: [required] The ID of the resource for which to list scopes.
 */
exports.listScopesByResource=function(filter){
 return (kcAdminClientHandler.clients.listScopesByResource(filter));
}



/**
 * ***************************** - listResources - *******************************
 * The method is used to retrieve all resources defined in a client’s resource server.
 * Resources represent protected entities (such as APIs, files, or services) that can be associated with scopes and permissions in Keycloak’s authorization services.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client (the resource server)
 *     - deep: [optional] If true, returns detailed information about each resource
 *     - first: [optional] Index of the first resource to return (for pagination)
 *     - max: [optional] Maximum number of resources to return (for pagination)
 *     - name: [optional] Filters resources by name
 *     - uri: [optional] Filters resources by URI
 *    - owner: [optional] Filters resources by owner
 */
exports.listResources=function(filter){
 return (kcAdminClientHandler.clients.listResources(filter));
}



/**
 * ***************************** - updateResource - *******************************
 * The method is used to update an existing resource in a client’s resource server.
 * Resources represent protected entities (APIs, files, services, etc.) that can be secured with scopes and permissions under Keycloak’s Authorization Services
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client (the resource server)
 *     - resourceId: [required] The ID of the resource you want to update.
 * - resourceRepresentation: JSON structure that defines the resource representation to update
 *     - name: [optional] The updated name of the resource
 *     - displayName: [optional] A human-readable name for the resource
 *     - uris: [optional] Updated list of URIs associated with the resource
 *     - scopes: [optional] Updated list of scopes linked to the resource
 *     - ownerManagedAccess: [optional] Indicates whether the resource is managed by its owner
 *     - {attributes} : [optional] Custom attributes for the resource
 */
exports.updateResource=function(filter,resourceRepresentation){
 return (kcAdminClientHandler.clients.updateResource(filter,resourceRepresentation));
}



/**
 * ***************************** - createPolicy - *******************************
 * The method is used to create a new policy for a client’s resource server under Keycloak’s Authorization Services.
 * Policies define the rules that determine whether access should be granted or denied to a given resource, scope, or permission.
 * They can be based on users, roles, groups, conditions, or custom logic.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client (the resource server) where the policy will be created.
 *     - type: [required] The policy type. Examples include:
 *         - "role" – grants access based on roles.
 *         - "user" – grants access based on users.
 *         - "group" – grants access based on groups.
 *         - "js" – uses custom JavaScript logic.
 *         - "time" – defines time-based conditions.
 * - policyRepresentation: JSON structure that defines the policy:
 *     - name: [required] The name of the policy.
 *     - description: [optional] A human-readable description of the policy.
 *     - logic: [optional] Either "POSITIVE" (default, grants access if the condition is met) or "NEGATIVE" (denies access if the condition is met).
 *     - decisionStrategy: [optional] Defines how multiple policies are evaluated: "AFFIRMATIVE", "UNANIMOUS", or "CONSENSUS".
 *     - {Other Config}: [optional]  Configuration object depending on  the chosen policy type. For example, a role policy requires role details.
 */
exports.createPolicy=function(filter,policyRepresentation){
 return (kcAdminClientHandler.clients.createPolicy(filter,policyRepresentation));
}




/**
 * ***************************** - listDependentPolicies - *******************************
 * The method is used to list all policies that depend on a given policy within a client’s resource server.
 * This is useful when you want to understand how a policy is referenced by other policies, permissions, or configurations, helping you manage complex authorization structures.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client (the resource server) where the policy exists.
 *     - policyId: [required] The ID of the policy for which you want to list dependent policies.
 */
exports.listDependentPolicies=function(filter){
 return (kcAdminClientHandler.clients.listDependentPolicies(filter));
}




/**
 * ***************************** - evaluateGenerateAccessToken - *******************************
 * The method is used to generate or simulate an access token for a specific client, typically for testing or evaluating the token
 * contents without performing a full user login. This can help you verify client roles, scopes, and protocol mappers included in the token
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] ID of the client for which you want to generate or evaluate the access token
 */
exports.evaluateGenerateAccessToken=function(filter){
 return (kcAdminClientHandler.clients.evaluateGenerateAccessToken(filter));
}




/**
 * ***************************** - evaluateGenerateIdToken - *******************************
 * The method is used to generate or simulate an ID token for a specific client, usually for testing or evaluating the token without
 * performing a full user login. This allows you to verify which claims, scopes, and protocol mappers are included in the ID
 * token for the client.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] ID of the client for which you want to generate or evaluate the ID token
 */
exports.evaluateGenerateIdToken=function(filter){
 return (kcAdminClientHandler.clients.evaluateGenerateIdToken(filter));
}



/**
 * ***************************** - evaluateGenerateUserInfo - *******************************
 * The method is used to generate or simulate a UserInfo response for a specific client, typically for testing or evaluating what
 * user information would be returned by the UserInfo endpoint for that client. This helps verify which claims are included in the
 * UserInfo response without performing a full login flow.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The ID of the client for which you want to generate the UserInfo response
 */
exports.evaluateGenerateUserInfo=function(filter){
 return (kcAdminClientHandler.clients.evaluateGenerateUserInfo(filter));
}




/**
 * ***************************** - evaluateListProtocolMapper - *******************************
 * The method is used to retrieve or evaluate the protocol mappers associated with a specific client.
 * Protocol mappers define how user information (claims) is mapped into tokens (like ID tokens or access tokens) for a client.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] ID of the client for which you want to list or evaluate protocol mappers.
 */
exports.evaluateListProtocolMapper=function(filter){
 return (kcAdminClientHandler.clients.evaluateListProtocolMapper(filter));
}



/**
 * ***************************** - addProtocolMapper - *******************************
 * The method allows you to add a single protocol mapper to a specific client.
 * Protocol mappers define how data from user/client models is added to tokens (e.g., access token, ID token, or SAML assertion)..
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The internal client ID of the client
 * - protocolMapperRepresentation: The protocol mapper definition, typically matching this structure:
 *     - name : protocol mapper name
 *     - protocol (e.g., "openid-connect" or "saml")
 *     - protocolMapper (e.g., "oidc-usermodel-property-mapper")
 *     - consentRequired
 *     - config (object)
 *         -  user.attribute
 *         -  claim.name
 *         -  jsonType.label
 *         -  id.token.claim
 *         -  access.token.claim
 *         - {others}
 *     - {others}
 */
exports.addProtocolMapper=function(filter,protocolMapperRepresentation){
 return (kcAdminClientHandler.clients.addProtocolMapper(filter,protocolMapperRepresentation));
}



/**
 * ***************************** - updateProtocolMapper - *******************************
 *The method is used to update an existing protocol mapper for a specific client in Keycloak.
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The internal client ID of the client
 *     - mapperId: [required] The ID of the protocol mapper to be updated.
 * - protocolMapperRepresentation: The protocol mapper definition, typically matching this structure:
 *     - name: protocol mapper name
 *     - protocol (e.g., "openid-connect" or "saml")
 *     - protocolMapper (e.g., "oidc-usermodel-property-mapper")
 *     - consentRequired
 *     - config (object)
 *          -  user.attribute
 *          -  claim.name
 *          -  jsonType.label
 *          -  id.token.claim
 *          -  access.token.claim
 *          - {other}
 *    - {other}
 */
exports.updateProtocolMapper=function(filter,protocolMapperRepresentation){
 return (kcAdminClientHandler.clients.updateProtocolMapper(filter,protocolMapperRepresentation));
}





/**
 * ***************************** - addMultipleProtocolMappers - *******************************
 * The method allows you to add several protocol mappers at once to a specific client.
 * Protocol mappers define how data from the user or client model is transformed and included in tokens
 * issued by Keycloak (e.g., access tokens, ID tokens, SAML assertions).
 * This batch operation is efficient when you want to configure multiple mappings without multiple API calls.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The internal client ID of the client
 * - protocolMapperRepresentation: An array of protocol mapper objects. Each object must conform to the ProtocolMapperRepresentation structure, which typically includes:
 * - name: protocol mapper name
 *     - protocol (e.g., "openid-connect" or "saml")
 *     - protocolMapper (e.g., "oidc-usermodel-property-mapper")
 *     - consentRequired
 *     - config (object)
 *          -  user.attribute
 *          -  claim.name
 *          -  jsonType.label
 *          -  id.token.claim
 *          -  access.token.claim
 *          - {other}
 *    - {other}
 */
exports.addMultipleProtocolMappers=function(filter,protocolMapperRepresentation){
 return (kcAdminClientHandler.clients.addMultipleProtocolMappers(filter,protocolMapperRepresentation));
}





/**
 * ***************************** - findProtocolMapperByName - *******************************
 * This method helps locate a protocol mapper within a specific client based on its protocol type (e.g. openid-connect) and the mapper name.
 * It is particularly useful when you want to verify if a mapper exists or fetch its full configuration.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The internal client ID of the client
 *     - name: [required] The name of the protocol mapper to look up. (usually "openid-connect" or "saml").
 */
exports.findProtocolMapperByName=function(filter){
 return (kcAdminClientHandler.clients.findProtocolMapperByName(filter));
}


/**
 * ***************************** - findProtocolMappersByProtocol - *******************************
 * The method returns all protocol mappers associated with a client, filtered by a specific protocol (e.g., "openid-connect" or "saml").
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The internal client ID of the client
 *     - protocol: [required] The protocol for which you want to fetch mappers. Common values:
 *          - "openid-connect"
 *          - "saml"
 */
exports.findProtocolMappersByProtocol=function(filter){
 return (kcAdminClientHandler.clients.findProtocolMappersByProtocol(filter));
}



/**
 * ***************************** - findProtocolMapperById - *******************************
 * The method retrieves the details of a specific protocol mapper by its ID for a given client.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The internal client ID of the client
 *     - mapperId: [required] The ID of the protocol mapper you want to fetch.
 */
exports.findProtocolMapperById=function(filter){
 return (kcAdminClientHandler.clients.findProtocolMapperById(filter));
}




/**
 * ***************************** - listProtocolMappers - *******************************
 * The method is used to retrieve all protocol mappers associated with a specific client.
 * Protocol mappers define how user and role information is included in tokens such as access tokens, ID tokens, or SAML assertions.
 * This method is useful for inspecting or managing the token contents of a client.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The internal ID of the client whose protocol mappers you want to list
 */
exports.listProtocolMappers=function(filter){
 return (kcAdminClientHandler.clients.listProtocolMappers(filter));
}




/**
 * ***************************** - delProtocolMapper - *******************************
 * The method is used to delete a specific protocol mapper from a client.
 * Protocol mappers are used to include specific user or role information in tokens (e.g. access tokens, ID tokens).
 * This method is useful when you want to remove an existing mapper from a client configuration.
 *
 * @parameters:
 * - filter: JSON structure that defines the filter parameters:
 *     - id: [required] The internal client ID of the client
 *     - mapperId: [required] The ID of the protocol mapper to delete
 */
exports.delProtocolMapper=function(filter){
 return (kcAdminClientHandler.clients.delProtocolMapper(filter));
}

