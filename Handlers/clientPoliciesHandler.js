/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The Client Policies entity (Keycloak 12+) provides governance and security policies
 * for client applications. Client policies allow administrators to enforce security
 * requirements, configure client behavior, and ensure compliance across all clients.
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler = null;

exports.setKcAdminClient = function(kcAdminClient) {
    kcAdminClientHandler = kcAdminClient;
}

/**
 * ***************************** - getPolicies - *******************************
 * Get all client policies for a realm
 * 
 * @parameters:
 * - filter: [optional] parameter
 *   - realm: (string, optional) - The realm name
 * @returns: Object containing policies array
 */
exports.getPolicies = function(filter) {
    return kcAdminClientHandler.clientPolicies.listPolicies(filter);
}

/**
 * ***************************** - updatePolicies - *******************************
 * Update client policies configuration
 * 
 * @parameters:
 * - filter: [optional] parameter
 *   - realm: (string, optional) - The realm name
 * - policiesRepresentation: Object with policies array
 *   - policies: (array) - Array of policy objects
 *     - name: (string) - Policy name
 *     - description: (string) - Policy description
 *     - enabled: (boolean) - Whether policy is enabled
 *     - conditions: (array) - Conditions that trigger the policy
 *     - profiles: (array) - Profiles to apply when policy matches
 */
exports.updatePolicies = async function(filter, policiesRepresentation) {
    // Direct API call since @keycloak/keycloak-admin-client doesn't support this
    const realm = filter?.realm || kcAdminClientHandler.realmName;
    const baseUrl = kcAdminClientHandler.baseUrl;
    const token = kcAdminClientHandler.accessToken;
    
    const url = `${baseUrl}/admin/realms/${realm}/client-policies/policies`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(policiesRepresentation)
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update client policies: ${error}`);
    }
    
    return response.status === 204 ? undefined : response.json();
}

/**
 * ***************************** - getProfiles - *******************************
 * Get all client profiles for a realm
 * 
 * @parameters:
 * - filter: [optional] parameter
 *   - realm: (string, optional) - The realm name
 * @returns: Object containing profiles array
 */
exports.getProfiles = function(filter) {
    return kcAdminClientHandler.clientPolicies.listProfiles(filter);
}

/**
 * ***************************** - updateProfiles - *******************************
 * Update client profiles configuration
 * 
 * @parameters:
 * - filter: [optional] parameter
 *   - realm: (string, optional) - The realm name
 * - profilesRepresentation: Object with profiles array
 *   - profiles: (array) - Array of profile objects
 *     - name: (string) - Profile name
 *     - description: (string) - Profile description
 *     - executors: (array) - Executors that enforce security requirements
 *       - executor: (string) - Executor type
 *       - configuration: (object) - Executor-specific configuration
 */
exports.updateProfiles = async function(filter, profilesRepresentation) {
    // Direct API call since @keycloak/keycloak-admin-client doesn't support this
    const realm = filter?.realm || kcAdminClientHandler.realmName;
    const baseUrl = kcAdminClientHandler.baseUrl;
    const token = kcAdminClientHandler.accessToken;
    
    const url = `${baseUrl}/admin/realms/${realm}/client-policies/profiles`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profilesRepresentation)
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update client profiles: ${error}`);
    }
    
    return response.status === 204 ? undefined : response.json();
}
