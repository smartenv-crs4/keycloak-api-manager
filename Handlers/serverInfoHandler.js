/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The Server Info entity provides information about the Keycloak server instance,
 * including available providers, themes, system info, memory usage, and enabled features.
 * This is useful for monitoring, diagnostics, and understanding server capabilities.
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler = null;

exports.setKcAdminClient = function(kcAdminClient) {
    kcAdminClientHandler = kcAdminClient;
}

/**
 * ***************************** - getInfo - *******************************
 * Get comprehensive server information
 * 
 * @returns: Object containing:
 *   - systemInfo: System and environment information
 *   - memoryInfo: Memory usage statistics
 *   - profileInfo: Active profile information
 *   - themes: Available themes
 *   - providers: Available SPI providers
 *   - protocolMapperTypes: Available protocol mapper types
 *   - builtinProtocolMappers: Built-in protocol mappers
 *   - clientInstallations: Available client installation formats
 *   - componentTypes: Available component types
 *   - passwordPolicies: Available password policy types
 *   - enums: Various enum values used in Keycloak
 *   - cryptoInfo: Cryptographic information
 */
exports.getInfo = function() {
    return kcAdminClientHandler.serverInfo.find();
}
