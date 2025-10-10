/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The components entity allows you to manage Keycloak components, which are configuration entities
 * such as user federation providers, authenticators, protocol mappers, themes, and more.
 * Components in Keycloak are modular and pluggable, and this API lets you create, read, update,
 * and delete them programmatically.
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler=null;
exports.setKcAdminClient=function(kcAdminClient){
 kcAdminClientHandler=kcAdminClient;
}


/**
 * ***************************** - CREATE - *******************************
 * The method creates a new component in a Keycloak realm.
 * Components are modular providers in Keycloak, such as user federation providers (LDAP, Kerberos), authenticators, identity providers, or other pluggable extensions.
 *
 * @parameters:
 * - componentRepresentation: An object representing the component to create.
 *      - name: [required] A human-readable name for the component.
 *      - providerId: [required] The provider ID (e.g., "ldap", "kerberos", "totp").
 *      - providerType: [required] The type/class of the provider (e.g., "org.keycloak.storage.UserStorageProvider").
 *      - parentId: [optional] The ID of the parent component (if hierarchical).
 *      - config: [optional] A map of configuration options, where each property is an array of strings (Keycloak convention). Example:
 *          - enabled: ["true"],
 *          - connectionUrl: ["ldap://ldap.example.com"],
 *          - bindDn: ["cn=admin,dc=example,dc=com"],
 *          - bindCredential: ["secret"],
 *          - usersDn: ["ou=users,dc=example,dc=com"]
 *
 */
exports.create=function(componentRepresentation){
 return (kcAdminClientHandler.components.create(componentRepresentation));
}



/**
 * ***************************** - update - *******************************
 * The method updates an existing component in a Keycloak realm.
 * Components represent pluggable extensions such as user federation providers (LDAP, Kerberos),
 * protocol mappers, authenticator factories, or other custom integrations.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The unique ID of the component to update.
 * - componentRepresentation: An object representing the component to update.
 *     - name: [required] A human-readable name for the component.
 *     - providerId: [required] The provider ID (e.g., "ldap", "kerberos", "totp").
 *     - providerType: [required] The type/class of the provider (e.g., "org.keycloak.storage.UserStorageProvider").
 *     - parentId: [optional] The ID of the parent component (if hierarchical).
 *     - config: [optional] A map of configuration options, where each property is an array of strings (Keycloak convention). Example:
 *          - enabled: ["true"],
 *          - connectionUrl: ["ldap://ldap.example.com"],
 *          - bindDn: ["cn=admin,dc=example,dc=com"],
 *          - bindCredential: ["secret"],
 *          - usersDn: ["ou=users,dc=example,dc=com"]
 */
exports.update=function(filters, componentRepresentation){
 return (kcAdminClientHandler.components.update(filters, componentRepresentation));
}




/**
 * ***************************** - findOne - *******************************
 * The method retrieves a single component from a realm by its ID.
 * Components in Keycloak represent pluggable providers such as LDAP user federation, authenticators, protocol mappers, or other extensions.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The unique ID of the component to retrieve.
 */
exports.findOne=function(filter){
 return (kcAdminClientHandler.components.findOne(filter));
}



/**
 * ***************************** - find - *******************************
 * The method retrieves a list of components in a Keycloak realm.
 * You can optionally filter components by their parent ID and/or provider type (e.g., LDAP user federation providers, authenticators, protocol mappers).
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - {builtin attribute}: To find components by builtin attributes such as name, id
 *     - max: A pagination parameter used to define the maximum number of components to return (limit).
 *     - first: A pagination parameter used to define the number of components to skip before starting to return results (offset/limit).
 */
exports.find=function(filter){
 return (kcAdminClientHandler.components.find(filter));
}



/**
 * ***************************** - del - *******************************
 * The method deletes a specific component from a Keycloak realm.
 * Components include user federation providers (e.g., LDAP, Kerberos), authenticator providers, protocol mappers, or other pluggable extensions.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The unique ID of the component to delete.
 */
exports.del=function(filter){
 return (kcAdminClientHandler.components.del(filter));
}


/**
 * ***************************** - listSubComponents - *******************************
 * The method retrieves all sub-components of a given parent component in a Keycloak realm.
 * This is useful when working with hierarchical components, for example:
 * - LDAP storage provider and protocol mappers as sub-components
 * - Authenticator factories with nested components
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the parent component.
 *     - type: [optional] Filters sub-components by their provider type (e.g., "org.keycloak.protocol.mapper.ProtocolMapper").
 */
exports.listSubComponents=function(filter){
 return (kcAdminClientHandler.components.listSubComponents(filter));
}
