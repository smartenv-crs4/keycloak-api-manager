/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The Organizations entity (Keycloak 25+) allows managing organizations for multi-tenancy.
 * Organizations provide a way to group users, identity providers, and domains together,
 * enabling better isolation and management of different organizational units.
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler = null;

exports.setKcAdminClient = function(kcAdminClient) {
    kcAdminClientHandler = kcAdminClient;
}

/**
 * ***************************** - create - *******************************
 * Create a new organization
 * 
 * @parameters:
 * - organizationRepresentation: An object representing the organization
 *   - name: [required] (string) - Organization name
 *   - displayName: [optional] (string) - Display name
 *   - url: [optional] (string) - Organization URL
 *   - domains: [optional] (array) - List of domains
 *   - attributes: [optional] (object) - Custom attributes
 */
exports.create = function(organizationRepresentation) {
    return kcAdminClientHandler.organizations.create(organizationRepresentation);
}

/**
 * ***************************** - find - *******************************
 * Get all organizations in a realm
 * 
 * @parameters:
 * - filter: [optional] parameter for filtering
 *   - realm: (string, optional) - The realm name
 *   - search: (string, optional) - Search string
 *   - first: (number, optional) - First result index
 *   - max: (number, optional) - Maximum results
 */
exports.find = function(filter) {
    return kcAdminClientHandler.organizations.find(filter);
}

/**
 * ***************************** - findOne - *******************************
 * Get a specific organization by ID
 * 
 * @parameters:
 * - filter: parameter with organization ID
 *   - id: (string, required) - Organization ID
 *   - realm: (string, optional) - The realm name
 */
exports.findOne = function(filter) {
    return kcAdminClientHandler.organizations.findOne(filter);
}

/**
 * ***************************** - update - *******************************
 * Update an organization
 * 
 * @parameters:
 * - filter: parameter with organization ID
 *   - id: (string, required) - Organization ID
 * - organizationRepresentation: Updated organization data
 */
exports.update = function(filter, organizationRepresentation) {
    return kcAdminClientHandler.organizations.update(filter, organizationRepresentation);
}

/**
 * ***************************** - del - *******************************
 * Delete an organization
 * 
 * @parameters:
 * - filter: parameter with organization ID
 *   - id: (string, required) - Organization ID
 */
exports.del = function(filter) {
    return kcAdminClientHandler.organizations.del(filter);
}

/**
 * ***************************** - addMember - *******************************
 * Add a user as member to an organization
 * 
 * @parameters:
 * - filter: parameter with organization ID and user ID
 *   - id: (string, required) - Organization ID
 *   - userId: (string, required) - User ID
 */
exports.addMember = function(filter) {
    return kcAdminClientHandler.organizations.addMember(filter);
}

/**
 * ***************************** - listMembers - *******************************
 * List all members of an organization
 * 
 * @parameters:
 * - filter: parameter with organization ID
 *   - id: (string, required) - Organization ID
 *   - first: (number, optional) - First result
 *   - max: (number, optional) - Max results
 */
exports.listMembers = function(filter) {
    return kcAdminClientHandler.organizations.listMembers(filter);
}

/**
 * ***************************** - delMember - *******************************
 * Remove a member from an organization
 * 
 * @parameters:
 * - filter: parameter with organization ID and user ID
 *   - id: (string, required) - Organization ID
 *   - userId: (string, required) - User ID
 */
exports.delMember = function(filter) {
    return kcAdminClientHandler.organizations.delMember(filter);
}

/**
 * ***************************** - addIdentityProvider - *******************************
 * Link an identity provider to an organization
 * 
 * @parameters:
 * - filter: parameter with organization ID and IDP alias
 *   - id: (string, required) - Organization ID
 *   - alias: (string, required) - Identity provider alias
 */
exports.addIdentityProvider = function(filter) {
    return kcAdminClientHandler.organizations.addIdentityProvider(filter);
}

/**
 * ***************************** - listIdentityProviders - *******************************
 * List identity providers linked to an organization
 * 
 * @parameters:
 * - filter: parameter with organization ID
 *   - id: (string, required) - Organization ID
 */
exports.listIdentityProviders = function(filter) {
    return kcAdminClientHandler.organizations.listIdentityProviders(filter);
}

/**
 * ***************************** - delIdentityProvider - *******************************
 * Unlink an identity provider from an organization
 * 
 * @parameters:
 * - filter: parameter with organization ID and IDP alias
 *   - id: (string, required) - Organization ID
 *   - alias: (string, required) - Identity provider alias
 */
exports.delIdentityProvider = function(filter) {
    return kcAdminClientHandler.organizations.delIdentityProvider(filter);
}
