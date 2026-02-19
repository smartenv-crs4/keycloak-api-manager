/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The Organizations entity (Keycloak 25+) allows managing organizations for multi-tenancy.
 * Organizations provide a way to group users, identity providers, and domains together,
 * enabling better isolation and management of different organizational units.
 * 
 * NOTE: Some Organizations APIs are not fully supported by @keycloak/keycloak-admin-client
 * so this handler uses direct REST API calls for those endpoints.
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler = null;

exports.setKcAdminClient = function(kcAdminClient) {
    kcAdminClientHandler = kcAdminClient;
}

/**
 * Helper function to make direct API calls to Keycloak
 */
async function makeDirectApiCall(method, endpoint, body = null) {
    const baseUrl = kcAdminClientHandler.baseUrl;
    const realmName = kcAdminClientHandler.realmName;
    const accessToken = kcAdminClientHandler.accessToken;
    
    const url = `${baseUrl}/admin/realms/${realmName}${endpoint}`;
    
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.errorMessage || errorJson.error || errorText;
        } catch (e) {
            errorMessage = errorText;
        }
        throw new Error(errorMessage || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Handle empty responses (DELETE, PUT requests may return 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }
    
    const responseText = await response.text();
    if (!responseText) {
        return null;
    }
    
    return JSON.parse(responseText);
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
exports.update = async function(filter, organizationRepresentation) {
    const { id } = filter;
    // Keycloak requires full object for PUT, so we fetch current and merge
    const current = await exports.findOne(filter);
    const merged = { ...current, ...organizationRepresentation };
    return await makeDirectApiCall('PUT', `/organizations/${id}`, merged);
}

/**
 * ***************************** - del - *******************************
 * Delete an organization
 * 
 * @parameters:
 * - filter: parameter with organization ID
 *   - id: (string, required) - Organization ID
 */
exports.del = async function(filter) {
    const { id } = filter;
    return await makeDirectApiCall('DELETE', `/organizations/${id}`);
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
exports.addMember = async function(filter) {
    const { id, userId } = filter;
    return await makeDirectApiCall('POST', `/organizations/${id}/members`, { userId });
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
exports.listMembers = async function(filter) {
    const { id, first, max } = filter;
    let endpoint = `/organizations/${id}/members`;
    const params = [];
    if (first !== undefined) params.push(`first=${first}`);
    if (max !== undefined) params.push(`max=${max}`);
    if (params.length > 0) endpoint += `?${params.join('&')}`;
    return await makeDirectApiCall('GET', endpoint);
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
exports.delMember = async function(filter) {
    const { id, userId } = filter;
    return await makeDirectApiCall('DELETE', `/organizations/${id}/members/${userId}`);
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
exports.addIdentityProvider = async function(filter) {
    const { id, alias } = filter;
    return await makeDirectApiCall('POST', `/organizations/${id}/identity-providers`, { alias });
}

/**
 * ***************************** - listIdentityProviders - *******************************
 * List identity providers linked to an organization
 * 
 * @parameters:
 * - filter: parameter with organization ID
 *   - id: (string, required) - Organization ID
 */
exports.listIdentityProviders = async function(filter) {
    const { id } = filter;
    return await makeDirectApiCall('GET', `/organizations/${id}/identity-providers`);
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
exports.delIdentityProvider = async function(filter) {
    const { id, alias } = filter;
    return await makeDirectApiCall('DELETE', `/organizations/${id}/identity-providers/${alias}`);
}
