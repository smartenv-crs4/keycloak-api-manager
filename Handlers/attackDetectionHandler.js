/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The Attack Detection entity provides functionality for managing brute force attack detection
 * in Keycloak. This allows you to detect and prevent brute force login attempts, lock users,
 * and clear login failures.
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler = null;

exports.setKcAdminClient = function(kcAdminClient) {
    kcAdminClientHandler = kcAdminClient;
}

/**
 * ***************************** - getBruteForceStatus - *******************************
 * Get brute force detection status in the current realm context.
 * 
 * @parameters:
 * - filter: (object, optional) request filter object.
 *    - realm: (string, optional) Realm override for this call.
 * @returns: Array of user brute force status objects
 */
exports.getBruteForceStatus = function(filter) {
    return kcAdminClientHandler.attackDetection.findAll(filter);
}

/**
 * ***************************** - getUserBruteForceStatus - *******************************
 * Get brute force detection status for one user.
 * 
 * @parameters:
 * - filter: (object, required) request filter object.
 *    - id: (string, required) User ID.
 *    - realm: (string, optional) Realm override for this call.
 * @returns: User brute force status object
 */
exports.getUserBruteForceStatus = function(filter) {
    return kcAdminClientHandler.attackDetection.findOne(filter);
}

/**
 * ***************************** - clearUserLoginFailures - *******************************
 * Clear all login failures for a specific user
 * 
 * @parameters:
 * - filter: (object, required) request filter object.
 *    - id: (string, required) User ID.
 *    - realm: (string, optional) Realm override for this call.
 * @returns: Promise
 */
exports.clearUserLoginFailures = function(filter) {
    return kcAdminClientHandler.attackDetection.del(filter);
}

/**
 * ***************************** - clearAllLoginFailures - *******************************
 * Clear all login failures for all users in a realm
 * 
 * @parameters:
 * - filter: (object, optional) request filter object.
 *    - realm: (string, optional) Realm override for this call.
 * @returns: Promise
 */
exports.clearAllLoginFailures = function(filter) {
    return kcAdminClientHandler.attackDetection.delAll(filter);
}
