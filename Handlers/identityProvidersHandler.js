/**
 * **************************************************************************************************
 * **************************************************************************************************
 * identityProviders lets you manage Identity Providers (IdPs) configured in a realm.
 * These are providers like Google, Facebook, GitHub, SAML, OIDC, etc.
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler=null;
exports.setKcAdminClient=function(kcAdminClient){
 kcAdminClientHandler=kcAdminClient;
}

/**
 * ***************************** - create - *******************************
 * The method is used to create a new Identity Provider (IdP) in a Keycloak realm.
 * An IdP allows users to authenticate via external providers such as Google, Facebook, GitHub,
 * or another SAML/OIDC provider.
 * This method requires specifying an alias, the provider type, and configuration settings such as client ID, client secret, and any other provider-specific options.
 * @parameters:
 * - identityProvidersRepresentation: parameter provided as a JSON object containing the configuration of the Identity Provider
 *      - alias: [required] Unique name for the IdP within the realm.
 *      - providerId: [required] Type of provider (google, facebook, oidc, saml, etc.).
 *      - enabled: [optional] Whether the IdP is enabled. Default is true.
 *      - displayName: [optional] Display name for the login page.
 *      - trustEmail: [optional] Whether to trust the email from the IdP.
 *      - storeToken: [optional] Whether to store the token from the IdP.
 *      - linkOnly: [optional] If true, the IdP can only link accounts.
 *      - firstBrokerLoginFlowAlias: [optional] Flow to use on first login.
 *      - config : [optional] Provider-specific configuration, e.g., client ID, client secret, endpoints, etc.
 */
exports.create=function(identityProvidersRepresentation){
 return (kcAdminClientHandler.identityProviders.create(identityProvidersRepresentation));
}

/**
 * ***************************** - createMapper - *******************************
 * The method creates a new mapper for an existing Identity Provider in the current realm.
 * The mapper defines how attributes, roles, or claims from the Identity Provider are mapped to the Keycloak user model.
 * @parameters:
 * - mapperParams: parameter provided as a JSON object containing the fields to create a new mapper
 *       - alias: [required] The alias of the Identity Provider to which the mapper will be attached.
 *       - identityProviderMapper: [required] The mapper configuration object, which includes details like the mapper type, name, and configuration values
 */
exports.createMapper=function(mapperParams){
 return (kcAdminClientHandler.identityProviders.createMapper(mapperParams));
}


/**
 * ***************************** - findMappers - *******************************
 * The method retrieves all mappers associated with a specific Identity Provider in the current realm.
 * These mappers define how attributes, roles, or claims from the external Identity Provider are mapped to the Keycloak user model.
 * @parameters:
 * - filter: pparameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] TThe alias of the Identity Provider whose mappers you want to fetch.
 */
exports.findMappers=function(filter){
 return (kcAdminClientHandler.identityProviders.findMappers(filter));
}

/**
 * ***************************** - delMapper - *******************************
 * The method deletes a specific mapper associated with an Identity Provider in the current realm.
 * This is useful when you need to remove a mapping rule that translates attributes, roles, or claims from the external Identity Provider into Keycloak.
 * @parameters:
 * - filter: pparameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias of the Identity Provider that owns the mapper.
 *     - id : [required] The unique ID of the mapper to be deleted
 */
exports.delMapper=function(filter){
 return (kcAdminClientHandler.identityProviders.delMapper(filter));
}


/**
 * ***************************** - findOneMapper - *******************************
 * The method retrieves the details of a specific mapper associated with an Identity Provider in the current realm.
 * This allows you to inspect a mapper’s configuration, such as how attributes or claims from the
 * external Identity Provider are mapped into Keycloak.
 * @parameters:
 * - filter: pparameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias of the Identity Provider
 *     - id: [required] The unique ID of the mapper to retrieve
 */
exports.findOneMapper=function(filter){
 return (kcAdminClientHandler.identityProviders.findOneMapper(filter));
}


/**
 * ***************************** - del - *******************************
 * The method removes an Identity Provider from the current realm.
 * This action deletes the provider configuration, including all its associated mappers and settings.
 * After deletion, users will no longer be able to authenticate using that Identity Provider.
 * @parameters:
 * - filter: pparameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias of the Identity Provider you want to delete.
 */
exports.del=function(filter){
 return (kcAdminClientHandler.identityProviders.del(filter));
}


/**
 * ***************************** - findOne - *******************************
 * The method retrieves the configuration details of a specific Identity Provider in the current realm.
 * It is useful when you need to inspect the provider’s settings, such as its alias, display name,
 * authentication flow, or other configuration parameters.
 * @parameters:
 * - filter: pparameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias of the Identity Provider you want to find.
 */
exports.findOne=function(filter){
 return (kcAdminClientHandler.identityProviders.findOne(filter));
}

/**
 * ***************************** - find - *******************************
 * The method retrieves a list of all configured Identity Providers in the current realm.
 * It allows you to see which providers (e.g., Google, GitHub, SAML, etc.)
 * are available and get their basic configuration details.
 */
exports.find=function(){
 return (kcAdminClientHandler.identityProviders.find());
}


/**
 * ***************************** - update - *******************************
 * The method updates the configuration of a specific Identity Provider in the current realm.
 * It allows you to modify settings such as client ID, secret, authorization URLs, or any custom configuration fields exposed by the provider.
 * @parameters:
 * - filter: pparameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias of the Identity Provider to update.
 * - identityProviderRepresentation: An object containing the updated configuration fields:
 *     - alias: [required] The alias of the Identity Provider.
 *     - providerId: [required] The provider type (e.g., "google", "saml").
 *     - {Other optional fields like displayName, config object}
 */
exports.update=function(filter,identityProviderRepresentation){
 return (kcAdminClientHandler.identityProviders.update(filter,identityProviderRepresentation));
}


/**
 * ***************************** - findFactory - *******************************
 * The method retrieves information about a specific Identity Provider factory available in Keycloak.
 * A factory represents a provider type (e.g., "oidc", "saml", "github") and contains metadata about how that provider can be configured.
 * This is useful when you want to check what configuration options are supported before creating or updating an Identity Provider.
 * @parameters:
 * - filter: pparameter provided as a JSON object that accepts the following filter:
 *     - providerId: [required] The ID of the Identity Provider factory to look up (e.g., "oidc", "saml", "google").
 */
exports.findFactory=function(filter){
 return (kcAdminClientHandler.identityProviders.findFactory(filter));
}


/**
 * ***************************** - findMappers - *******************************
 * The method retrieves all mappers associated with a specific Identity Provider in Keycloak.
 * Mappers define how information from the external Identity Provider (e.g., Google, SAML, GitHub) is mapped into Keycloak attributes, roles, or claims.
 * This is useful to list all transformations and mappings applied to users authenticating via that provider.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias of the Identity Provider (set when the provider was created)
 */
exports.findMappers=function(filter){
 return (kcAdminClientHandler.identityProviders.findMappers(filter));
}


/**
 * ***************************** - findOneMapper - *******************************
 * The method retrieves a single mapper associated with a specific Identity Provider in Keycloak.
 * It’s useful when you need to inspect the configuration of a mapper before updating or deleting it.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias of the Identity Provider
 *     - id: [required] The unique ID of the mapper to fetch
 */
exports.findOneMapper=function(filter){
 return (kcAdminClientHandler.identityProviders.findOneMapper(filter));
}



/**
 * ***************************** - updateMapper - *******************************
 * The method updates an existing mapper for a given Identity Provider in Keycloak.
 * Mappers define how attributes, roles, or claims from an external Identity Provider (e.g., Google, GitHub, SAML)
 * are mapped into Keycloak user attributes or tokens.
 * This method allows you to change the configuration of an existing mapper (e.g., modify the claim name, attribute name, or role assignment).
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias of the Identity Provider (set during IdP creation).
 *     - id: [required] The ID of the mapper to update.
 * - mapperRepresentation: parameter provided as a JSON object that represent the updated mapper configuration object.
 *     - id : [optional] The mapper ID.
 *     - name: [optional] The mapper name.
 *     - identityProviderAlias: [optional] The IdP alias.
 *     - identityProviderMapper: [optional] The type of mapper (e.g., "oidc-user-attribute-idp-mapper").
 *     - config: [optional] The new mapping configuration.
 */
exports.updateMapper=function(filter,mapperRepresentation){
 return (kcAdminClientHandler.identityProviders.updateMapper(filter,mapperRepresentation));
}



/**
 * ***************************** - importFromUrl - *******************************
 * The method lets you import an Identity Provider configuration directly from a metadata URL (e.g., OIDC discovery document or SAML metadata XML).
 * This saves you from manually entering configuration details, since Keycloak can auto-fill them from the provided URL.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - fromUrl : [required] The URL of the IdP metadata (OIDC discovery endpoint or SAML metadata).
 *     - providerId : [required]The type of IdP (e.g., "oidc", "saml").
 *     - trustEmail: [optional] Whether to automatically trust emails from this IdP.
 *     - alias: [optional] Alias for the Identity Provider (unique name).
 */
exports.importFromUrl=function(filter){
 return (kcAdminClientHandler.identityProviders.importFromUrl(filter));
}

/**
 * ***************************** - updatePermission - *******************************
 * The method allows you to enable or disable fine-grained admin permissions for a specific Identity Provider in Keycloak.
 * When enabled, Keycloak creates client roles (scopes) that let you define which users or groups can view or manage the Identity Provider.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias of the Identity Provider.
 * - permissionRepresentation: parameter provided as a JSON object that represent the updated permission object.
 *     - enabled: [optional] true to enable permissions, false to disable.
 *     - realm: [optional] The realm where the IdP is defined.
 *     - {other permisssion fields}
 */
exports.updatePermission=function(filter,permissionRepresentation){
 return (kcAdminClientHandler.identityProviders.updatePermission(filter,permissionRepresentation));
}


/**
 * ***************************** - listPermissions - *******************************
 * The method retrieves the current fine-grained permission settings for a specific Identity Provider in Keycloak.
 * It returns whether permissions are enabled and, if so, which scope roles are associated with managing and viewing the Identity Provider.
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias of the Identity Provider.
 *     - realm: [optional] The realm where the IdP is defined.
 */
exports.listPermissions=function(filter){
 return (kcAdminClientHandler.identityProviders.listPermissions(filter));
}
