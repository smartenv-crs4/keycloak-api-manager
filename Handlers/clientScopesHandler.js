/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The clientScopes resource allows you to manage client scopes in Keycloak.
 * Client scopes are reusable sets of protocol mappers and role scope mappings which
 * can be assigned to clients to define what information about the user is included in tokens and
 * what roles are available
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler=null;
exports.setKcAdminClient=function(kcAdminClient){
 kcAdminClientHandler=kcAdminClient;
}


/**
 * ***************************** - CREATE - *******************************
 * create method is used to create a new client scope in a Keycloak realm.
 * A client scope defines a set of protocol mappers and roles that can be applied to clients,
 * such as during login or token generation.
 */
exports.create=function(scopeRepresentation){
 return (kcAdminClientHandler.clientScopes.create(scopeRepresentation ));
}



/**
 * ***************************** - update - *******************************
 * The method updates the configuration of an existing client scope in a realm.
 * You can modify properties such as the scope’s name, description, attributes, or protocol mappers.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The unique ID of the client scope to update.
 *     - realm: [optional] The realm where the client scope exists.
 * - scopeRepresentation: The updated client scope object.
 *     - name: [optional] The name of the scope
 *     - description: [optional] The scope description
 *     - {other scope fields}
 */
exports.update=function(filter,scopeRepresentation){
 return (kcAdminClientHandler.clientScopes.update(filter,scopeRepresentation ));
}



/**
 * ***************************** - del - *******************************
 * The method deletes a client scope from a realm in Keycloak.
 * Once deleted, the client scope will no longer be available for assignment to clients (either as default, optional, or manually).
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The unique ID of the client scope to delete.
 *     - realm: [optional] The realm where the client scope is defined.
 */
exports.del=function(filter){
 return (kcAdminClientHandler.clientScopes.del(filter));
}


/**
 * ***************************** - delByName - *******************************
 * This method removes a client scope from the realm using its unique name.
 * It's an alternative to deleting by ID when the scope's name is known.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - name: [required] The name of the client scope to delete. This must match exactly with the registered name in the realm.
 */
exports.delByName=function(filter){
 return (kcAdminClientHandler.clientScopes.delByName(filter));
}



/**
 * ***************************** - find - *******************************
 * The method retrieves the list of client scopes defined in a realm.
 * Client scopes represent a set of protocol mappers and roles that can be assigned to clients, either as default, optional, or manually added.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - realm: [optional] The realm where client scopes are defined.
 *     - search: [optional] A search string to filter client scopes by name.
 *     - first: [optional] Index of the first result (for pagination).
 *     - max: [optional] Maximum number of results to return
 */
exports.find=function(filter){
 return (kcAdminClientHandler.clientScopes.find(filter));
}

/**
 * ***************************** - findOne - *******************************
 * The method retrieves the details of a specific client scope in a realm by its unique identifier (ID).
 * It’s useful when you need the full configuration of a particular client scope, including protocol mappers and assigned roles.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *      - id: [required] The unique ID of the client scope.
 *      - realm: [optional] The realm where the client scope is defined
 */
exports.findOne=function(filter){
 return (kcAdminClientHandler.clientScopes.findOne(filter));
}


/**
 * ***************************** - findOneByName - *******************************
 * The method is used to retrieve a specific client scope by its name.
 * This is useful when you know the name of a client scope and want to fetch its full details,
 * including its ID, protocol, and other settings.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - name: [required] The name of the client scope you're searching for.
 */
exports.findOneByName=function(filter){
 return (kcAdminClientHandler.clientScopes.findOneByName(filter));
}


/**
 * ***************************** - listDefaultClientScopes - *******************************
 * The method retrieves the list of default client scopes configured in a realm.
 * Default client scopes are automatically assigned to newly created clients
 * in that realm (for example, profile, email, roles)
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - realm: [optional] The realm where the client scopes are defined.
 *     - first: [optional] Index of the first result (for pagination).
 *     - max: [optional] Maximum number of results to return.
 */
exports.listDefaultClientScopes=function(filter){
 return (kcAdminClientHandler.clientScopes.listDefaultClientScopes(filter));
}



/**
 * ***************************** - addDefaultClientScope - *******************************
 * The method adds a client scope to the list of default client scopes of a realm in Keycloak.
 * Default client scopes are automatically assigned to all newly created clients within the realm.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope to add as a default.
 *     - realm: [optional] The realm where the client scopes are defined.
 */
exports.addDefaultClientScope=function(filter){
 return (kcAdminClientHandler.clientScopes.addDefaultClientScope(filter));
}


/**
 * ***************************** - delDefaultClientScope - *******************************
 * The method removes a client scope from the list of default client scopes of a realm in Keycloak.
 * Default client scopes are automatically assigned to newly created clients in that realm.
 * Removing one prevents it from being included by default.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope to remove from the default list.
 *     - realm:: [optional] The realm where the client scope is defined.
 */
exports.delDefaultClientScope=function(filter){
 return (kcAdminClientHandler.clientScopes.delDefaultClientScope(filter));
}


/**
 * ***************************** - listDefaultOptionalClientScopes - *******************************
 * The method retrieves the list of default optional client scopes in a realm.
 * Optional client scopes are available for clients to select but are not automatically applied when a new client is created.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - realm:: [optional] The realm where the client scope is defined
 */
exports.listDefaultOptionalClientScopes=function(filter){
 return (kcAdminClientHandler.clientScopes.listDefaultOptionalClientScopes(filter));
}

/**
 * ***************************** - addDefaultOptionalClientScope - *******************************
 * The method adds a client scope to the list of default optional client scopes in a realm.
 * Optional client scopes are available to clients for selection but are not automatically applied when a new client is created.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope to add as a default optional scope.
 *     - realm:: [optional] The realm where the client scope is defined
 */
exports.addDefaultOptionalClientScope=function(filter){
 return (kcAdminClientHandler.clientScopes.addDefaultOptionalClientScope(filter));
}


/**
 * ***************************** - delDefaultOptionalClientScope - *******************************
 * The method removes a client scope from the list of default optional client scopes of a realm in Keycloak.
 * Optional client scopes are scopes that can be assigned to clients on demand.
 * By default, they are available to clients but not automatically applied unless explicitly selected.
 * Removing one prevents it from being listed as optional for new clients.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope to remove from the optional list.
 *     - realm:: [optional] The realm where the client scope is defined.
 */
exports.delDefaultOptionalClientScope=function(filter){
 return (kcAdminClientHandler.clientScopes.delDefaultOptionalClientScope(filter));
}


/**
 * ***************************** - findProtocolMapperByName - *******************************
 * The method retrieves a protocol mapper from a specific client scope by its name.
 * Protocol mappers define how user attributes, roles, or other data are mapped into tokens (ID token, access token, or user info) in Keycloak.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope to search within.
 *     - realm: [optional] The realm where the client scope is defined.
 *     - name: [optional] The name of the protocol mapper to find
 */
exports.findProtocolMapperByName=function(filter){
 return (kcAdminClientHandler.clientScopes.findProtocolMapperByName(filter));
}

/**
 * ***************************** - findProtocolMapper - *******************************
 * The method retrieves a specific protocol mapper from a client scope in a realm, using its mapper ID.
 * Protocol mappers define how user attributes, roles, or other information are mapped into tokens (ID token, access token, or user info) in Keycloak.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope containing the protocol mapper.
 *     - mapperId: [required] The ID of the protocol mapper to retrieve.
 *     - realm: [optional] The realm where the client scope is defined.
 */
exports.findProtocolMapper=function(filter){
 return (kcAdminClientHandler.clientScopes.findProtocolMapper(filter));
}

/**
 * ***************************** - findProtocolMappersByProtocol - *******************************
 * The method retrieves all protocol mappers of a given protocol (e.g., openid-connect or saml) for a specific client scope in a realm.
 * This is useful when you want to filter protocol mappers by the authentication protocol they are associated with.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope to search within.
 *     - protocol: [required] The protocol to filter by (e.g., "openid-connect", "saml").
 *     - realm: [optional] The realm where the client scope is defined.
 */
exports.findProtocolMappersByProtocol=function(filter){
 return (kcAdminClientHandler.clientScopes.findProtocolMappersByProtocol(filter));
}


/**
 * ***************************** - delProtocolMapper - *******************************
 * The method deletes a protocol mapper from a specific client scope in a realm.
 * Protocol mappers define how user attributes, roles, or other information are mapped into tokens (ID token, access token, or user info) in Keycloak.
 * Deleting a mapper removes its configuration from the client scope.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope containing the protocol mapper
 *     - mapperId: [required] The ID of the protocol mapper to delete
 *     - realm: [optional] The realm where the client scope is defined
 */
exports.delProtocolMapper=function(filter){
 return (kcAdminClientHandler.clientScopes.delProtocolMapper(filter));
}

/**
 * ***************************** - listProtocolMappers - *******************************
 * The method retrieves all protocol mappers associated with a specific client scope in a realm.
 * Protocol mappers define how user attributes, roles, or other data are mapped into tokens (ID token, access token, or user info) in Keycloak.
 *  @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope to list protocol mappers from.
 *     - realm: [optional] The realm where the client scope is defined.
 */
exports.listProtocolMappers=function(filter){
 return (kcAdminClientHandler.clientScopes.listProtocolMappers(filter));
}



/**
 * ***************************** - addMultipleProtocolMappers - *******************************
 * The method adds multiple protocol mappers to a specific client scope in a realm.
 * Protocol mappers define how user attributes, roles, or other data are mapped into tokens (ID token, access token, or user info) in Keycloak.
 * With this method, you can configure several mappers in a single request.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope where the protocol mappers should be added.
 *     - realm: [optional] The realm where the client scope is defined.
 * - protocolMappers: An array of protocol mapper definitions to add. Each ProtocolMapperRepresentation typically includes:
 *     - name: [required] The mapper’s name.
 *     - protocol: [required] Usually "openid-connect" or "saml".
 *     - protocolMapper: [required] The mapper type, e.g., "oidc-usermodel-property-mapper".
 *     - config: [optional] Mapper-specific configuration (e.g., user attribute, claim name, JSON type). example:
 *           - "user.attribute": "email"
 *           - "claim.name": "email"
 *           - "jsonType.label": "String"
 *     - consentRequired: [optional] Whether user consent is required
 */
exports.addMultipleProtocolMappers=function(filter,protocolMappers){
 return (kcAdminClientHandler.clientScopes.addMultipleProtocolMappers(filter,protocolMappers));
}




/**
 * ***************************** - addProtocolMapper - *******************************
 * The method adds a single protocol mapper to a specific client scope in a realm.
 * Protocol mappers define how user attributes, roles, or other information are mapped into tokens (ID token, access token, or user info) in Keycloak.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *      - id: [required] The ID of the client scope where the protocol mapper should be added.
 *      - realm: [optional] The realm where the client scope is defined.
 * - protocolMapper: A protocol mapper definitions to add.
 *      - name: [required] The mapper’s name.
 *      - protocol: [required] Usually "openid-connect" or "saml".
 *      - protocolMapper: [required] The mapper type, e.g., "oidc-usermodel-property-mapper".
 *      - config: [optional] Mapper-specific configuration (e.g., user attribute, claim name, JSON type). example:
 *           - "user.attribute": "email"
 *           - "claim.name": "email"
 *           - "jsonType.label": "String"
 *      - consentRequired: [optional] Whether user consent is required.
 */
exports.addProtocolMapper=function(filter,protocolMapper){
 return (kcAdminClientHandler.clientScopes.addProtocolMapper(filter,protocolMapper));
}


/**
 * ***************************** - updateProtocolMapper - *******************************
 * The method updates an existing protocol mapper in a specific client scope of a realm.
 * Protocol mappers define how user attributes, roles, or other information are mapped into tokens (ID token, access token, or user info).
 * With this method, you can modify an existing mapper’s configuration.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope where the protocol mapper should be updated.
 *     - mapperId: [required] The ID of the protocol mapper to update.
 *     - realm: [optional] The realm where the client scope is defined.
 * - protocolMapper: The updated definition of the protocol mapper.
 *     - name: [required] The mapper’s name.
 *     - protocol: [required] Usually "openid-connect" or "saml".
 *     - protocolMapper: [required] The mapper type, e.g., "oidc-usermodel-property-mapper".
 *     - config: [optional] Mapper-specific configuration (e.g., user attribute, claim name, JSON type). example:
 *           - "user.attribute": "email"
 *           - "claim.name": "email"
 *           - "jsonType.label": "String"
 *     - consentRequired: [optional] Whether user consent is required.
 */
exports.updateProtocolMapper=function(filter,protocolMapper){
 return (kcAdminClientHandler.clientScopes.updateProtocolMapper(filter,protocolMapper));
}


/**
 * ***************************** - listScopeMappings - *******************************
 * The method retrieves all scope mappings for a given client scope in a realm.
 * Scope mappings define which roles (from realm roles or client roles) are granted to a client scope.
 * These roles determine the permissions and access tokens issued for clients using this scope.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope to list scope mapping.
 *     - realm: [optional] The realm where the client scope is defined.
 */
exports.listScopeMappings=function(filter){
 return (kcAdminClientHandler.clientScopes.listScopeMappings(filter));
}


/**
 * ***************************** - listAvailableClientScopeMappings - *******************************
 * The method retrieves the list of available client roles that can be mapped to a given client scope but are not yet assigned.
 * This helps identify which roles from a specific client are still available to be added to the client scope.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope to list available scope mapping.
 *     - client: [required] The client ID (client UUID or client identifier) from which to list available roles
 *     - realm: [optional] The realm where the client scope is defined
 */
exports.listAvailableClientScopeMappings=function(filter){
 return (kcAdminClientHandler.clientScopes.listAvailableClientScopeMappings(filter));
}


/**
 * ***************************** - addClientScopeMappings - *******************************
 * The method adds one or more client roles from a specific client to a given client scope in a realm.
 * This means the client scope will include the selected roles, and any client using this scope will inherit these permissions in its tokens.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] ID of the client scope.
 *     - client: [required] The client ID (client UUID or client identifier) whose roles are being mapped.
 *     - realm : [optional] The realm where the client scope is defined.
 * - RoleRepresentation: An array of role definitions to add. Each RoleRepresentation typically includes(or at least their id and/or name):
 *     - id : [optional] The role ID.
 *     - name : [optional] The role name.
 *     - description: [optional] A description of the role.
 *     - clientRole: [optional]: Whether this role belongs to a client.
 *     - containerId: [optional] The ID of the client containing the role.
 */
exports.addClientScopeMappings=function(filter,roleRepresentation){
 return (kcAdminClientHandler.clientScopes.addClientScopeMappings(filter,roleRepresentation));
}



/**
 * ***************************** - delClientScopeMappings - *******************************
 * The method removes one or more client role mappings from a given client scope in a realm.
 * This allows you to revoke previously assigned client roles so they are no longer included in the client scope.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] ID of the client scope.
 *     - client: [required] The client ID (client UUID or client identifier) from which the roles are being removed.
 *     - realm : [optional] The realm where the client scope is defined.
 * - roleRepresentation: An array of role objects (or at least their id and/or name) to be removed from the client scope.
 *     - id : [optional] The role ID
 *     - name : [optional] The role name
 *     - description: [optional] A description of the role
 *     - clientRole: [optional]: Whether this role belongs to a client
 *     - containerId: [optional] The ID of the client containing the role
 */
exports.delClientScopeMappings=function(filter,roleRepresentation){
 return (kcAdminClientHandler.clientScopes.delClientScopeMappings(filter,roleRepresentation));
}



/**
 * ***************************** - listClientScopeMappings - *******************************
 * The method retrieves all client roles from a specific client that are currently mapped to a given client scope in a realm.
 * This allows you to check which roles from a particular client are already included in the client scope.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope
 *     - client: [required]: The client ID (client UUID or client identifier) whose mapped roles you want to list
 *     - realm: [optional] The realm where the client scope is defined
 */
exports.listClientScopeMappings=function(filter){
 return (kcAdminClientHandler.clientScopes.listClientScopeMappings(filter));
}


/**
 * ***************************** - listCompositeClientScopeMappings - *******************************
 * The method retrieves all effective client roles mapped to a given client scope, including both directly assigned roles and those inherited via composite roles.
 * This is useful when you want to see the final set of roles available in a client scope, not just the ones explicitly mapped.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope.
 *     - client: [required]: The client ID (client UUID or client identifier) whose mapped roles you want to list.
 *     - realm: [optional] The realm where the client scope is defined.
 */
exports.listCompositeClientScopeMappings=function(filter){
 return (kcAdminClientHandler.clientScopes.listCompositeClientScopeMappings(filter));
}



/**
 * ***************************** - listAvailableRealmScopeMappings - *******************************
 * The method retrieves the list of realm roles that are available to be mapped to a given client scope but are not yet assigned.
 * This helps you determine which realm-level roles can still be added to the client scope.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope.
 *     - realm: [optional] The realm where the client scope is defined.
 */
exports.listAvailableRealmScopeMappings=function(filter){
 return (kcAdminClientHandler.clientScopes.listAvailableRealmScopeMappings(filter));
}


/**
 * ***************************** - addRealmScopeMappings - *******************************
 * The method adds one or more realm roles to a given client scope in a realm.
 * This means that any client using this client scope will inherit the specified realm-level roles in its tokens.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope.
 *     - realm: [optional] The realm where the client scope is defined.
 * - roleRepresentation: An array of realm role objects to add. Each RoleRepresentation typically includes:
 *     - id: [required] The role ID.
 *     - name: [required] The role name.
 *     - description: [optional] Description of the role.
 *     - clientRole: [optional] Should be false for realm roles.
 *     - containerId: [optional] The ID of the realm containing the role.
 */
exports.addRealmScopeMappings=function(filter,roleRepresentation){
 return (kcAdminClientHandler.clientScopes.addRealmScopeMappings(filter,roleRepresentation));
}



/**
 * ***************************** - delRealmScopeMappings - *******************************
 * The method removes one or more realm role mappings from a given client scope in a realm.
 * This revokes previously assigned realm roles, so clients using this scope will no longer inherit these permissions.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope.
 *     - realm: [optional] The realm where the client scope is defined.
 * - RoleRepresentation: Each role should include at least its id and/or name
 *     - id: [required] The role ID.
 *     - name: [required] The role name.
 *     - description: [optional] Description of the role.
 *     - clientRole: [optional] Should be false for realm roles.
 *     - containerId: [optional] The ID of the realm containing the role.
 */
exports.delRealmScopeMappings=function(filter,RoleRepresentation){
 return (kcAdminClientHandler.clientScopes.delRealmScopeMappings(filter,RoleRepresentation));
}





/**
 * ***************************** - listRealmScopeMappings - *******************************
 * The method retrieves all realm roles that are currently mapped to a given client scope in a realm.
 * This allows you to see which realm-level permissions are already assigned to the client scope.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope.
 *     - realm: [optional] The realm where the client scope is defined.
 */
exports.listRealmScopeMappings=function(filter){
 return (kcAdminClientHandler.clientScopes.listRealmScopeMappings(filter));
}


/**
 * ***************************** - listCompositeRealmScopeMappings - *******************************
 * The method retrieves all effective realm roles mapped to a given client scope, including both directly assigned roles and those inherited via composite roles.
 * This is useful to see the complete set of realm-level permissions a client scope provides.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the client scope.
 *     - realm: [optional] The realm where the client scope is defined.
 */
exports.listCompositeRealmScopeMappings=function(filter){
 return (kcAdminClientHandler.clientScopes.listCompositeRealmScopeMappings(filter));
}