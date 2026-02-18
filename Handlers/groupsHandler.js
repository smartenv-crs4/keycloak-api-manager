const Keycloak = require("keycloak-connect");
/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The groups entity allows you to manage groups in a Keycloak realm.
 * Groups are collections of users and can have roles and attributes assigned to them.
 * Groups help organize users and assign permissions in a scalable way
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler=null;
exports.setKcAdminClient=function(kcAdminClient){
 kcAdminClientHandler=kcAdminClient;
}

/**
 * ***************************** - CREATE - *******************************
 * Create a new group in the current realme
  * @parameters:
 * - groupRepresentation:An object representing the new state of the group. You can update properties such as:
 *     - name: [optional] New name of the group
 *     - attributes: [optional] Custom attributes up field
 *     - path: [optional] full path of the group
 *     - subGroups: [optional] List of child groups (can also be updated separately)
 *     - description: [optional] the new group Description
 *     - {other [optional] group description fields}
 */
exports.create=function(groupRepresentation){
 if(groupRepresentation && groupRepresentation.parentId){
  const { parentId, ...childGroupRepresentation } = groupRepresentation;
  return (kcAdminClientHandler.groups.createChildGroup(
   { id: parentId },
   childGroupRepresentation
  ));
 }
 return (kcAdminClientHandler.groups.create(groupRepresentation));
}



/**
 * ***************************** - find - *******************************
 * find method is used to retrieve a list of groups in a specific realm.
 * It supports optional filtering parameters.
 * Searching by attributes is only available from Keycloak > 15
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - {builtin attribute}: To find groups by builtin attributes such as name, id
 *     - max: A pagination parameter used to define the maximum number of groups to return (limit).
 *     - first: A pagination parameter used to define the number of groups to skip before starting to return results (offset/limit).
 */
exports.find=function(filter){
 return (kcAdminClientHandler.groups.find(filter));
}

/**
 * ***************************** - findOne - *******************************
 * findOne is method used to retrieve a specific group's details by their unique identifier (id) within a given realm.
 * It returns the full group representation if the group exists.
 * @parameters
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     -id: the group id
 */
exports.findOne=function(filter){
 return (kcAdminClientHandler.groups.findOne(filter));
}


/**
 * ***************************** - del - *******************************
 * Deletes a group from the realm.
 * Return a promise that resolves when the group is successfully deleted. No content is returned on success.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: The ID of the group to delete
 */
exports.del=function(filter){
 return (kcAdminClientHandler.groups.del(filter));
}


/**
 * ***************************** - count - *******************************
 * Retrieves the total number of groups present in the specified realm.
 * This is useful for pagination, reporting, or general statistics regarding group usage in a Keycloak realm.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - realm: [optional] The name of the realm. If omitted, the default realm is used.
 *     - search: [optional] A text string to filter the group count by name
 */
exports.count=function(filter){
 return (kcAdminClientHandler.groups.count(filter).then((response)=>{
     if(typeof response === 'number'){
      return response;
     }
     if(response && typeof response.count === 'number'){
      return response.count;
     }
     return 0;
 }));
}


/**
 * ***************************** - update - *******************************
 * Updates an existing group’s information in a Keycloak realm.
 * You can modify the group’s name, attributes, or hierarchy by providing the group ID and the updated data.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The unique ID of the group you want to update.
 *     - realm: [optional] The realm name
 * - groupRepresentation:An object representing the new state of the group. You can update properties such as:
 *     - name: [optional] New name of the group
 *     - attributes: [optional] Custom attributes up field
 *     - path: [optional] full path of the group
 *     - subGroups: [optional] List of child groups (can also be updated separately)
 *     - description: [optional] the new group Description
 *     - {other [optional] group description fields}
 */
exports.update=function(filter,groupRepresentation){
 return (kcAdminClientHandler.groups.update(filter,groupRepresentation));
}




/**
 * ***************************** - listSubGroups - *******************************
 * Retrieves a paginated list of direct subgroups for a specified parent group.
 * This method is useful when navigating hierarchical group structures within a Keycloak realm.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - parentId: [required] ID of the parent group whose subgroups you want to list.
 *     - first: [optional] Index of the first result for pagination (default is 0).
 *     - max: [optional] Maximum number of results to return.
 *     - briefRepresentation: [optional] If true, returns a lightweight version of each group (default is true).
 *     - realm: [optional] Realm name
 */
exports.listSubGroups=function(filter){
 return (kcAdminClientHandler.groups.listSubGroups(filter));
}


/**
 * ***************************** - addRealmRoleMappings - *******************************
 * Adds one or more realm-level roles to a specific group.
 * This operation grants all users within that group the associated realm roles,
 * effectively assigning permissions at a group level.
 * @parameters:
 * - role_mapping: parameter provided as a JSON object that accepts the following parameters:
 *     - id: [required] 	The ID of the group to which roles will be added.
 *     - roles: [required] An array of role(RoleRepresentation) objects to assign.
 */
exports.addRealmRoleMappings=function(role_mapping){
 return (kcAdminClientHandler.groups.addRealmRoleMappings(role_mapping));
}


/**
 * ***************************** - listAvailableRealmRoleMappings - *******************************
 * Retrieves all available realm-level roles that can be assigned to a specific group but are not yet assigned.
 * This helps in identifying which roles are still eligible for addition to the group.
 * Return an array of RoleRepresentation objects representing the assignable realm roles for the group.
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - id: [required] The ID of the group you want to inspect.
 */
exports.listAvailableRealmRoleMappings=function(filters){
 return (kcAdminClientHandler.groups.listAvailableRealmRoleMappings(filters));
}



/**
 * ***************************** - listRoleMappings - *******************************
 * Retrieves all role mappings for a specific group, including both realm roles and client roles.
 * This method is useful for understanding the complete set of roles that are assigned to a group.
 * Return an object with two arrays:
 *     - realmMappings: realm-level roles assigned to the group.
 *     - clientMappings: a map of client IDs to the client-level roles assigned for each client.
 *
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - id: [required] The ID of the group whose roles to fetch
 */
exports.listRoleMappings=function(filters){
 return (kcAdminClientHandler.groups.listRoleMappings(filters));
}



/**
 * ***************************** - listRealmRoleMappings - *******************************
 * Returns the list of realm-level roles that are directly assigned to a specific group.
 * These roles are defined at the realm level and are not tied to any specific client.
 * Return An array of RoleRepresentation objects
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - id: [required] TThe ID of the group to retrieve roles for
 */
exports.listRealmRoleMappings=function(filters){
 return (kcAdminClientHandler.groups.listRealmRoleMappings(filters));
}




/**
 * ***************************** - listCompositeRealmRoleMappings - *******************************
 * Retrieves all composite realm-level roles assigned to a group.
 * This includes both directly assigned roles and those inherited through composite roles.
 * Return An array of RoleRepresentation objects that includes all realm roles, both directly assigned and inherited via composite roles.
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - id: [required] TThe ID of the group to retrieve roles for
 */
exports.listCompositeRealmRoleMappings=function(filters){
 return (kcAdminClientHandler.groups.listCompositeRealmRoleMappings(filters));
}


/**
 * ***************************** - delRealmRoleMappings - *******************************
 * Removes one or more realm-level roles from a group's role mappings.
 * This operation only affects roles that are directly assigned.
 * Composite roles inherited indirectly will not be removed.
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - id: [required] TThe ID of the group to retrieve roles for
 *     - roles: [required] Array of roles to be removed
 */
exports.delRealmRoleMappings=function(filters){
 return (kcAdminClientHandler.groups.delRealmRoleMappings(filters));
}

/**
 * ***************************** - addClientRoleMappings - *******************************
 * Assigns one or more client-level roles to a specific group.
 * This allows all users belonging to that group to inherit the specified roles for a given client.
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - id: [required] The ID of the group
 *     - clientUniqueId: [required] The internal ID of the client
 *     - roles: [required] Array of client roles to assign to the group
 */
exports.addClientRoleMappings=function(filters){
 return (kcAdminClientHandler.groups.addClientRoleMappings(filters));
}


/**
 * ***************************** - listAvailableClientRoleMappings - *******************************
 * Retrieves the list of client roles that are available to be assigned to a specific group but are not currently mapped.
 * This is useful when you want to show assignable roles for a group in a specific client context.
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - id: [required] The ID of the group
 *     - clientUniqueId: [required] The internal ID of the client
 */
exports.listAvailableClientRoleMappings=function(filters){
 return (kcAdminClientHandler.groups.listAvailableClientRoleMappings(filters));
}

/**
 * ***************************** - listClientRoleMappings - *******************************
 * Retrieves the list of client roles that are currently assigned (mapped) to a specific group for a given client.
 * This allows you to see which roles from a client the group already has.
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - id: [required] The ID of the group
 *     - clientUniqueId: [required] The internal ID of the client
 */
exports.listClientRoleMappings=function(filters){
 return (kcAdminClientHandler.groups.listClientRoleMappings(filters));
}



/**
 * ***************************** - listCompositeClientRoleMappings - *******************************
 * Retrieves the list of composite client roles assigned to a specific group.
 * Composite roles are roles that aggregate other roles, so this method returns client roles that include one or more roles grouped under a composite role assigned to the group.
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - id: [required] The ID of the group
 *     - clientUniqueId: [required] The internal ID of the client
 */
exports.listCompositeClientRoleMappings=function(filters){
 return (kcAdminClientHandler.groups.listCompositeClientRoleMappings(filters));
}



/**
 * ***************************** - delClientRoleMappings - *******************************
 * Removes specific client role mappings from a group.
 * This function deletes one or more client roles that were assigned to the group, effectively
 * revoking those client roles from the group.
 * @parameters:
 * - filters: parameter provided as a JSON object that accepts the following parameters:
 *     - id: [required] The ID of the group
 *     - clientUniqueId: [required] The internal ID of the client
 *     - roles: An array of role objects(RoleRepresentation) representing the client roles to be removed
 */
exports.delClientRoleMappings=function(filters){
 return (kcAdminClientHandler.groups.delClientRoleMappings(filters));
}

