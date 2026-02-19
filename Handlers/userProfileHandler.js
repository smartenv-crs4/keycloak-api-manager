/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The User Profile entity (Keycloak 15+) allows managing declarative user profile configuration.
 * This modern approach replaces the legacy attribute-based user management with a more
 * structured and type-safe configuration model.
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler = null;

exports.setKcAdminClient = function(kcAdminClient) {
    kcAdminClientHandler = kcAdminClient;
}

/**
 * ***************************** - getConfiguration - *******************************
 * Get the user profile configuration for a realm
 * 
 * @parameters:
 * - filter: [optional] parameter
 *   - realm: (string, optional) - The realm name
 * @returns: User profile configuration object with attributes, groups, etc.
 */
exports.getConfiguration = async function(filter) {
    // Direct API call for better compatibility
    const realm = filter?.realm || kcAdminClientHandler.realmName;
    const baseUrl = kcAdminClientHandler.baseUrl;
    const token = kcAdminClientHandler.accessToken;
    
    const url = `${baseUrl}admin/realms/${realm}/users/profile`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get user profile: ${error}`);
    }
    
    return response.json();
}

/**
 * ***************************** - updateConfiguration - *******************************
 * Update the user profile configuration
 * 
 * @parameters:
 * - filter: [optional] parameter
 *   - realm: (string, optional) - The realm name
 * - userProfileConfig: User profile configuration object
 *   - attributes: (array) - List of attribute configurations
 *     - name: (string) - Attribute name
 *     - displayName: (string) - Display name
 *     - validations: (object) - Validation rules
 *     - permissions: (object) - View/edit permissions
 *     - required: (object) - Required scopes
 *   - groups: (array) - Attribute groups
 *   - unmanagedAttributePolicy: (string) - Policy for unmanaged attributes
 */
exports.updateConfiguration = async function(filter, userProfileConfig) {
    // Direct API call for better compatibility
    const realm = filter?.realm || kcAdminClientHandler.realmName;
    const baseUrl = kcAdminClientHandler.baseUrl;
    const token = kcAdminClientHandler.accessToken;
    
    const url = `${baseUrl}admin/realms/${realm}/users/profile`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.strasync function(filter) {
    // Direct API call for better compatibility
    const realm = filter?.realm || kcAdminClientHandler.realmName;
    const baseUrl = kcAdminClientHandler.baseUrl;
    const token = kcAdminClientHandler.accessToken;
    
    const url = `${baseUrl}admin/realms/${realm}/users/profile/metadata`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get user profile metadata: ${error}`);
    }
    
    return response.json(
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update user profile: ${error}`);
    }
    
    return response.status === 204 ? undefined : response.json();
}

/**
 * ***************************** - getMetadata - *******************************
 * Get metadata about the user profile
 * Returns information about available validators, attribute types, etc.
 * 
 * @parameters:
 * - filter: [optional] parameter
 *   - realm: (string, optional) - The realm name
 * @returns: Metadata object with validators, attribute config, etc.
 */
exports.getMetadata = function(filter) {
    return kcAdminClientHandler.users.getProfileMetadata(filter);
}
