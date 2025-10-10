const Keycloak = require("keycloak-connect");
/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The roles entity refers to Keycloak's roles management functionality, part of the Admin REST API.
 * It allows you to create, update, inspect, and delete both realm-level and client-level roles.
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler=null;
exports.setKcAdminClient=function(kcAdminClient){
 kcAdminClientHandler=kcAdminClient;
}

/**
 * ***************************** - CREATE - *******************************
 * Create a new role
 * @parameters:
 * - role_dictionary: A JSON object representing a role dictionary as defined in Keycloak
 */
exports.create=function(role_dictionary){
 return (kcAdminClientHandler.roles.create(role_dictionary));
}



/**
 * ***************************** - createComposite - *******************************
 * Create a new composite role. Composite roles in Keycloak are roles that combine other roles,
 * allowing you to group multiple permissions into a single, higher-level role.
 * A composite role can include roles from the same realm as well
 * as roles from different clients.
 * When you assign a composite role to a user, they automatically inherit all the roles it contains.
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *      - roleId: [required] The id of the role to which composite roles will be added.
 *
 * - roles: (Array<RoleRepresentation>) [required] A list of roles to be added as composites. Each RoleRepresentation typically includes:
 *      - id: [required] The role’s unique ID.
 *      - name: [required] The role’s name.
 *      - containerId: [optional] The realm or client that owns the role.
 *      - clientRole: [optional] Whether the role belongs to a client.
 */
exports.createComposite=function(filters,roles){
 return (kcAdminClientHandler.roles.createComposite(filters,roles));
}




/**
 * ***************************** - find - *******************************
 * Get all realm roles and return a JSON
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *      - realm (string, optional: if set globally in the client): The realm from which to retrieve roles.
 *      - first (number, optional): Index of the first result to return (used for pagination).
 *      - max (number, optional): Maximum number of results to return.
 *      - name (string, optional): Search string to filter roles by name.
 */
exports.find=function(filters){
 return (kcAdminClientHandler.roles.find(filters));
}


/**
 * ***************************** - findOneByName - *******************************
 * get a role by name
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - name (string, required) — The exact name of the role to retrieve.
 *     - realm (string, optional if set globally) — The realm where the role is defined.
 */
exports.findOneByName=function(filters){
 return (kcAdminClientHandler.roles.findOneByName(filters));
}



/**
 * ***************************** - findOneById - *******************************
 * Get a role by its Id
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - Id (string, required) — The Id of the role to retrieve.
 *     - realm (string, optional if set globally) — The realm where the role is defined.
 */
exports.findOneById=function(filters){
 return (kcAdminClientHandler.roles.findOneById(filters));
}


/**
 * ***************************** - updateByName - *******************************
 * Update a role by its name
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - name (string, required) — The exact name of the role to retrieve.
 *     - realm (string, optional if set globally) — The realm where the role is defined.
 * - role_dictionary: A JSON object representing a role dictionary as defined in Keycloak
 */
exports.updateByName=function(filters,role_dictionary){
 return (kcAdminClientHandler.roles.updateByName(filters,role_dictionary));
}



/**
 * ***************************** - updateById - *******************************
 * Update a role by its Id
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - name (string, required) — The exact name of the role to retrieve.
 *     - realm (string, optional if set globally) — The realm where the role is defined.
 * - role_dictionary: A JSON object representing a role dictionary as defined in Keycloak
 */
exports.updateById=function(filters,role_dictionary){
 return (kcAdminClientHandler.roles.updateById(filters,role_dictionary));
}


/**
 * ***************************** - delByName - *******************************
 * Delete a role by its name
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - name (string, required) — The exact name of the role to retrieve.
 *     - realm (string, optional if set globally) — The realm where the role is defined.
 */
exports.delByName=function(filters){
 return (kcAdminClientHandler.roles.delByName(filters));
}

/**
 * ***************************** - findUsersWithRole - *******************************
 * Find all users associated with a specific role
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - name: (string, optional) — The exact name of the role to retrieve.
 *     - id: (string, optional) — The Id of the role to retrieve.
 *     - realm: (string, optional if set globally) — The realm where the role is defined.
 */
exports.findUsersWithRole=function(filters){
 return (kcAdminClientHandler.roles.findUsersWithRole(filters));
}



/**
 * ***************************** - getCompositeRoles - *******************************
 * Find all composite roles associated with a specific role.
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - name: (string, optional) — The exact name of the role to retrieve.
 *     - id: (string, optional) — The Id of the role to retrieve.
 */
exports.getCompositeRoles=function(filters){
 return (kcAdminClientHandler.roles.getCompositeRoles(filters));
}

/**
 * ***************************** - getCompositeRolesForRealm - *******************************
 * The getCompositeRolesForRealm function  is used to retrieve all realm-level roles that are
 * associated with a given composite role.
 * When a role is defined as composite, it can include other roles either from the same
 * realm or from different clients. This specific method returns only the realm-level roles
 * that have been added to the composite role. It requires the roleId of the target role as a
 * parameter and returns an array of RoleRepresentation objects. If the role is not composite
 * or has no associated realm roles, the result will be an empty array. This method is useful
 * for understanding and managing hierarchical role structures within a realm in Keycloak.
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - roleId: (string, required) — The Id of the role to retrieve
 */
exports.getCompositeRolesForRealm=function(filters){
 return (kcAdminClientHandler.roles.getCompositeRolesForRealm(filters));
}


/**
 * ***************************** - getCompositeRolesForClient - *******************************
 * The getCompositeRolesForClient function is used to retrieve all client-level roles that are
 * associated with a given composite role.
 * Composite roles in Keycloak can include roles from different clients,
 * and this method specifically returns the roles belonging to a specified client that
 * are part of the composite role. It requires the roleId of the composite role
 * and the clientId of the client whose roles you want to retrieve. The function returns an array of
 * RoleRepresentation objects representing the client roles included in the composite.
 * This helps manage and inspect client-specific role hierarchies within the composite role structure in Keycloak.
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - roleId: (string, required) — The Id of the role to retrieve
 *     - clientId: (string, required) — The Id of the client to search for composite roles
 *
 */
exports.getCompositeRolesForClient=function(filters){
 return (kcAdminClientHandler.roles.getCompositeRolesForClient(filters));
}
