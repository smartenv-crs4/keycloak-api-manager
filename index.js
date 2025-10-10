var express = require('express');
var conf=require('./config').conf;
var responseinterceptor = require('responseinterceptor');
var Keycloak =require('keycloak-connect');
var session=require('express-session');
//const {default: KcAdminClient} = require("@keycloak/keycloak-admin-client");
var keycloakAdminClient=require('@keycloak/keycloak-admin-client').default;
var keycloak = null;
var ready=false;
var readyQueue=[];
var kcAdminClient=null;
var realmHandler=require('./realmsHandler');
var usersHandler=require('./usersHandler');
var clientsHandler=require('./clientsHandler');
var clientScopesHandler=require('./clientScopesHandler');


/**
 * ***************************** - ENGLISH - *******************************
 * Async Configuration function for the Keycloak adapter in an Express application.
 * It must be called at app startup, before defining any protected routes.
 * It returns a promise
 *
 * Parameters:
 * - app: Express application instance (e.g., const app = express();)
 * - keyCloakConfig: JSON object containing the Keycloak client configuration.
 *     This can be obtained from the Keycloak admin console:
 *     Clients → [client name] → Installation → "Keycloak OIDC JSON" → Download
 *     Example:
 *     {
 *       "realm": "realm-name",
 *       "auth-server-url": "https://keycloak.example.com/",
 *       "ssl-required": "external",
 *       "resource": "client-name",
 *       "credentials": { "secret": "secret-code" },
 *       "confidential-port": 0
 *     }
 * - keyCloakOptions: advanced configuration options for the adapter.
 *     Main supported options:
 *     - session: Express session configuration (as in express-session)
 *     - scope: authentication scopes (e.g., 'openid profile email offline_access')
 *         Note: to use offline_access, the client must have the option enabled and
 *         the user must have the offline_access role.
 *     - idpHint: to suggest an identity provider to Keycloak during login
 *     - cookies: to enable cookie handling
 *     - realmUrl: to override the realm URL
 *
 * - adminClientCredentials: [Optional] Advanced configuration for setting up the realm-admin user or client,
 *   which will be used as the administrator to manage Keycloak via API.
 *   This is required in order to use the administrative functions exposed by this library.
 *   If this parameter is not provided, it will not be possible to use the administrative functions of Keycloak
 *   exposed by this adapter. In fact, exports.kcAdminClient will be null, so any attempt to call
 *   keycloakAdapter.kcAdminClient will result in a runtime error due to access on an undefined object
 *
 *     Main supported options:
 *     -baseUrl
 *     - realmName: [Optional] A String that specifies the realm to authenticate against, if different from the keyCloakConfig.realm parameter.
 *       If you intend to use Keycloak administrator credentials, this should be set to 'master'.
 *     - scope: [Optional] A string that specifies The OAuth2 scope requested during authentication (optional).
 *              Typically not required for administrative clients. example:openid profile
 *    - requestOptions: [Optional] JSON parameters to configure HTTP requests (such as custom headers, timeouts, etc.).
 *      It is compatible with the Fetch API standard. Fetch request options
 *      https://developer.mozilla.org/en-US/docs/Web/API/fetch#options
 *    - username: [Optional] string username. Required when using the password grant type.
 *    - password: [Optional] string password. Required when using the password grant type.
 *    - grantType: The OAuth2 grant type used for authentication.
 *      Possible values: 'password', 'client_credentials', 'refresh_token', etc.
 *    - clientId: string containing the client ID configured in Keycloak. Required for all grant types.
 *    - clientSecret: [Optional] string containing the client secret of the client. Required for client_credentials or confidential clients.
 *    - totp: string for Time-based One-Time Password (TOTP) for multi-factor authentication (MFA), if enabled for the user.
 *    - offlineToken: [Optional] boolean value. If true, requests an offline token (used for long-lived refresh tokens). Default is false.
 *    - refreshToken: [Optional] string containing a valid refresh token to request a new access token when using the refresh_token grant type.
 */
exports.configure=async function(adminClientCredentials){
        let configAdminclient={
            baseUrl:adminClientCredentials.baseUrl,
            realmName:adminClientCredentials.realmName
        }
        kcAdminClient=  new keycloakAdminClient(configAdminclient);
        delete adminClientCredentials.baseUrl;
        delete adminClientCredentials.realmName;
        await kcAdminClient.auth(adminClientCredentials);

        realmHandler.setKcAdminClient(kcAdminClient);
        exports.realms=realmHandler;

        usersHandler.setKcAdminClient(kcAdminClient);
        exports.users=usersHandler;

        clientsHandler.setKcAdminClient(kcAdminClient);
        exports.clients=clientsHandler;

        clientScopesHandler.setKcAdminClient(kcAdminClient);
        exports.clientScopes=clientScopesHandler;


        //exports = kcAdminClient;
};



//**************************************************
//**************************************************
//**************************************************
//**************************************************





### `entity identityProviders`
identityProviders lets you manage Identity Providers (IdPs) configured in a realm.
    These are providers like Google, Facebook, GitHub, SAML, OIDC, etc.

#### `entity identityProviders functions`

##### `function identityProviders.create(identityProvidersRappresentation)`
The method is used to create a new Identity Provider (IdP) in a Keycloak realm.
    An IdP allows users to authenticate via external providers such as Google, Facebook, GitHub,
    or another SAML/OIDC provider.
    This method requires specifying an alias, the provider type, and configuration settings such as client ID, client secret, and any other provider-specific options.
    @parameters:
- identityProvidersRappresentation: parameter provided as a JSON object containing the configuration of the Identity Provider
- alias: [required] Unique name for the IdP within the realm.
- providerId: [required] Type of provider (google, facebook, oidc, saml, etc.).
- enabled: [optional] Whether the IdP is enabled. Default is true.
- displayName: [optional] Display name for the login page.
- trustEmail: [optional] Whether to trust the email from the IdP.
- storeToken: [optional] Whether to store the token from the IdP.
- linkOnly: [optional] If true, the IdP can only link accounts.
- firstBrokerLoginFlowAlias: [optional] Flow to use on first login.
- config : [optional] Provider-specific configuration, e.g., client ID, client secret, endpoints, etc.
    ```js
 // create a gidentity provider
 keycloakAdapter.kcAdminClient.identityProviders.create({
    alias: "google",
    providerId: "google",
    enabled: true,
    displayName: "Google Login",
    trustEmail: true,
    storeToken: false,
    config: {
        clientId: "GOOGLE_CLIENT_ID",
        clientSecret: "GOOGLE_CLIENT_SECRET",
        defaultScope: "openid email profile",
    },
});

console.log("Created Identity Provider:", newIdP);
 ```


##### `function identityProviders.createMapper(mapperParams)`
The method creates a new mapper for an existing Identity Provider in the current realm.
    The mapper defines how attributes, roles, or claims from the Identity Provider are mapped to the Keycloak user model.
    @parameters:
- mapperParams: parameter provided as a JSON object containing the fields to create a new mapper
- alias: [required] The alias of the Identity Provider to which the mapper will be attached.
- identityProviderMapper: [required] The mapper configuration object, which includes details like the mapper type, name, and configuration values
    ```js
 // create a mapper
 keycloakAdapter.kcAdminClient.identityProviders.createMapper({
     alias: 'currentIdpAlias',
     identityProviderMapper: {
         name: "email-mapper",
         identityProviderMapper: "oidc-user-attribute-idp-mapper",
         config: {
             "user.attribute": "email",
             "claim": "email",
             "syncMode": "INHERIT",
         },
     },
 });

 ```



##### `function identityProviders.findMappers(filter)`
The method retrieves all mappers associated with a specific Identity Provider in the current realm.
    These mappers define how attributes, roles, or claims from the external Identity Provider are mapped to the Keycloak user model.
    @parameters:
- filter: pparameter provided as a JSON object that accepts the following filter:
    - alias: [required] TThe alias of the Identity Provider whose mappers you want to fetch.
    ```js
 // find a mapper
 const  mappers= await keycloakAdapter.kcAdminClient.identityProviders.findMappers({
     alias: 'currentIdpAlias',
     
 });


console.log(mappers);

 ```


##### `function identityProviders.delMapper(filter)`
The method deletes a specific mapper associated with an Identity Provider in the current realm.
    This is useful when you need to remove a mapping rule that translates attributes, roles, or claims from the external Identity Provider into Keycloak.
    @parameters:
- filter: pparameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider that owns the mapper.
- id : [required] The unique ID of the mapper to be deleted.
    ```js
 // delete a mapper
 await keycloakAdapter.kcAdminClient.identityProviders.delMapper({
     alias: 'currentIdpAlias',
     id: 'mapperId'
 });

console.log("Mapper deleted successfully");
```



##### `function identityProviders.findOneMapper(filter)`
The method retrieves the details of a specific mapper associated with an Identity Provider in the current realm.
    This allows you to inspect a mapper’s configuration, such as how attributes or claims from the external Identity Provider are mapped into Keycloak.
    @parameters:
- filter: pparameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider.
- id: [required] The unique ID of the mapper to retrieve.
    ```js
 // find a mapper
 const  mapper= await keycloakAdapter.kcAdminClient.identityProviders.findOneMapper({
     alias: 'currentIdpAlias',
     id: 'mapperId'
 });

console.log("Mapper details:", mapper);
```


##### `function identityProviders.del(filter)`
The method removes an Identity Provider from the current realm.
    This action deletes the provider configuration, including all its associated mappers and settings.
    After deletion, users will no longer be able to authenticate using that Identity Provider.
    @parameters:
- filter: pparameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider you want to delete.
```js
 // delete 
 await keycloakAdapter.kcAdminClient.identityProviders.del({
     alias: 'currentIdpAlias'
 });

console.log(`Identity Provider deleted successfully`);
```


##### `function identityProviders.findOne(filter)`
The method retrieves the configuration details of a specific Identity Provider in the current realm.
    It is useful when you need to inspect the provider’s settings, such as its alias, display name, authentication flow, or other configuration parameters.
    @parameters:
- filter: pparameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider you want to find.
    ```js
 // find one 
 const  idp= await keycloakAdapter.kcAdminClient.identityProviders.findOne({
     alias: 'currentIdpAlias'
 });

if (idp) {
    console.log("Identity Provider details:", idp);
} else {
    console.log(`Identity Provider with alias currentIdpAlias not found`);
}
```


##### `function identityProviders.find()`
The method retrieves a list of all configured Identity Providers in the current realm.
    It allows you to see which providers (e.g., Google, GitHub, SAML, etc.) are available and get their basic configuration details.

    ```js
 // find 
 const  provider= await keycloakAdapter.kcAdminClient.identityProviders.find();

console.log("Configured Identity Providers:");
providers.forEach((provider) => {
    console.log(`Alias: ${provider.alias}, Provider ID: ${provider.providerId}`);
});
```


##### `function identityProviders.update(filter,identityProviderRepresentation)`
The method updates the configuration of a specific Identity Provider in the current realm.
    It allows you to modify settings such as client ID, secret, authorization URLs, or any custom configuration fields exposed by the provider.
    @parameters:
- filter: pparameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider to update.
- identityProviderRepresentation: An object containing the updated configuration fields:
    - alias: [required] The alias of the Identity Provider.
- providerId: [required] The provider type (e.g., "google", "saml").
- Other optional fields like displayName, config object, etc.
    ```js
 // update one 
 await keycloakAdapter.kcAdminClient.identityProviders.update(
     { alias: 'currentIdpAlias' },
     {
         // alias and providerId are required to update
        alias: 'idp.alias',
        providerId: 'idp.providerId',
        displayName: "test",
    }
);
```


##### `function identityProviders.findFactory(filter)`
The method retrieves information about a specific Identity Provider factory available in Keycloak.
    A factory represents a provider type (e.g., "oidc", "saml", "github") and contains metadata about how that provider can be configured.
    This is useful when you want to check what configuration options are supported before creating or updating an Identity Provider.
    @parameters:
- filter: pparameter provided as a JSON object that accepts the following filter:
    - providerId: [required] The ID of the Identity Provider factory to look up (e.g., "oidc", "saml", "google").
    ```js
 // find factory 
 const factory= await keycloakAdapter.kcAdminClient.identityProviders.findFactory({
     providerId: "oidc",
 });

console.log("Factory details:", factory);
```




##### `function identityProviders.findMappers(filter)`
The method retrieves all mappers associated with a specific Identity Provider in Keycloak.
    Mappers define how information from the external Identity Provider (e.g., Google, SAML, GitHub) is mapped into Keycloak attributes, roles, or claims.
    This is useful to list all transformations and mappings applied to users authenticating via that provider.
    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider (set when the provider was created).
```js
 // find one 
 const mappers= await keycloakAdapter.kcAdminClient.identityProviders.findMappers({
     alias: "google",
 });

console.log("Mappers for Google IdP:", mappers);
```


##### `function identityProviders.findOneMapper(filter)`
The method retrieves a single mapper associated with a specific Identity Provider in Keycloak.
    It’s useful when you need to inspect the configuration of a mapper before updating or deleting it.
    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider.
- id: [required] The unique ID of the mapper to fetch.
    ```js
 // find one 
 const mapper= await keycloakAdapter.kcAdminClient.identityProviders.findOneMapper({
     alias: "google",
     id: "1234-abcd-5678-efgh",
 });

if (mapper) {
    console.log("Mapper found:", mapper);
} else {
    console.log("Mapper not found");
}
```


##### `function identityProviders.updateMapper(filter,mapperRepresentation)`
The method updates an existing mapper for a given Identity Provider in Keycloak.
    Mappers define how attributes, roles, or claims from an external Identity Provider (e.g., Google, GitHub, SAML) are mapped into Keycloak user attributes or tokens.
    This method allows you to change the configuration of an existing mapper (e.g., modify the claim name, attribute name, or role assignment).
@parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider (set during IdP creation).
- id: [required] The ID of the mapper to update.
- mapperRepresentation: parameter provided as a JSON object that represent the updated mapper configuration object.
- id : [optional] The mapper ID.
- name: [optional] The mapper name.
- identityProviderAlias: [optional] The IdP alias.
- identityProviderMapper: [optional] The type of mapper (e.g., "oidc-user-attribute-idp-mapper").
- config: [optional] The new mapping configuration.
    ```js
 // update one Mapper
 const mappers= await keycloakAdapter.kcAdminClient.identityProviders.updateMapper(
     {
         alias: "google",
         id: "1234-abcd-5678-efgh", // Mapper ID
     },
     {
         id: "1234-abcd-5678-efgh",
         name: "Updated Google Mapper",
         identityProviderAlias: "google",
         identityProviderMapper: "oidc-user-attribute-idp-mapper",
         config: {
             "claim": "email",
             "user.attribute": "updatedEmail",
         },
     }
 );

console.log("Mapper updated successfully!");
```



##### `function identityProviders.importFromUrl(filter,mapperRepresentation)`
The method lets you import an Identity Provider configuration directly from a metadata URL (e.g., OIDC discovery document or SAML metadata XML).
This saves you from manually entering configuration details, since Keycloak can auto-fill them from the provided URL.
    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - fromUrl : [required] The URL of the IdP metadata (OIDC discovery endpoint or SAML metadata).
- providerId : [required]The type of IdP (e.g., "oidc", "saml").
- trustEmail: [optional] Whether to automatically trust emails from this IdP.
- alias: [optional] Alias for the Identity Provider (unique name).
```js
 // import one Mapper
 const mappers= await keycloakAdapter.kcAdminClient.identityProviders.importFromUrl({
     fromUrl: "https://accounts.google.com/.well-known/openid-configuration",
     providerId: "oidc",
     alias: "google",
     trustEmail: true,
 });

console.log("Imported IdP:", importedIdp);
```


##### `function identityProviders.updatePermission(filter,permissionRepresentation)`
The method allows you to enable or disable fine-grained admin permissions for a specific Identity Provider in Keycloak.
    When enabled, Keycloak creates client roles (scopes) that let you define which users or groups can view or manage the Identity Provider.
    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider.
- permissionRepresentation: parameter provided as a JSON object that represent the updated permission object.
- enabled: [optional] true to enable permissions, false to disable.
- realm: [optional] The realm where the IdP is defined.
- other permisssion fields
    ```js
 // import one permission
 const updatedPermissions= await keycloakAdapter.kcAdminClient.identityProviders.updatePermission(
     { alias: "google"},
     { enabled: true }
 );

console.log("Updated permission:", updatedPermissions);
```


##### `function identityProviders.listPermissions(filter)`
The method retrieves the current fine-grained permission settings for a specific Identity Provider in Keycloak.
    It returns whether permissions are enabled and, if so, which scope roles are associated with managing and viewing the Identity Provider.
    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias of the Identity Provider.
- realm: [optional] The realm where the IdP is defined.
    ```js
 // import one permission
 const permissions= await keycloakAdapter.kcAdminClient.identityProviders.listPermissions({
     alias: "google",
     realm: "myrealm",
 });

console.log("Current permissions:", permissions);
```




### `entity groups`
The groups entity allows you to manage groups in a Keycloak realm.
    Groups are collections of users and can have roles and attributes assigned to them.
    Groups help organize users and assign permissions in a scalable way

#### `entity groups functions`
##### `function create(groupRappresentation)`
Create a new group in the current realme
    ```js
 // create a group called my-group
 keycloakAdapter.kcAdminClient.groups.create({name: "my-group"});
 ```


##### `function find(filter)`
find method is used to retrieve a list of groups in a specific realm.
    It supports optional filtering parameters.
    Searching by attributes is only available from Keycloak > 15
@parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - {builtin attribute}: To find groips by builtin attributes such as name, id
- max: A pagination parameter used to define the maximum number of groups to return (limit).
    - first: A pagination parameter used to define the number of groups to skip before starting to return results (offset/limit).
    ```js
 // find a 100 groups
const groups = await keycloakAdapter.kcAdminClient.groups.find({ max: 100 });
if(groups) console.log('Groups found:', groups);
else console.log('Groups not found');

// find a 100 groups and skip the first 50
groups = await keycloakAdapter.kcAdminClient.groups.find({ max: 100, first:50 });
if(groups) console.log('Groups found:', groups);
else console.log('Groups not found');
 ```

##### `function findOne(filter)`
findOne is method used to retrieve a specific group's details by their unique identifier (id) within a given realm.
It returns the full group representation if the group exists.
    ```js
 // find a group with id:'group-id'
const group = await keycloakAdapter.kcAdminClient.groups.findOne({ id: 'group-id' });
if(group) console.log('Group found:', group);
else console.log('Group not found');
 ```


##### `function del(filter)`
Deletes a group from the realm.
    Return a promise that resolves when the group is successfully deleted. No content is returned on success.
    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: The ID of the group to delete.
```js
 // delete a group with id:'group-id'
const group = await keycloakAdapter.kcAdminClient.groups.del({ id: 'group-id' });
 ```


##### `function count(filter)`
Retrieves the total number of groups present in the specified realm.
    This is useful for pagination, reporting, or general statistics regarding group usage in a Keycloak realm.
    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - realm: [optional] The name of the realm. If omitted, the default realm is used.
- search: [optional] A text string to filter the group count by name.
    ```js
 // count groups
const result = await keycloakAdapter.kcAdminClient.groups.count();
console.log('Total groups:', result.count);

 // count groups with filter
const result = await keycloakAdapter.kcAdminClient.groups.count({ search: "cool-group" });
console.log('Total cool-group groups:', result.count);

 ```



##### `function update(filter,groupRepresentation)`
Updates an existing group’s information in a Keycloak realm.
    You can modify the group’s name, attributes, or hierarchy by providing the group ID and the updated data.
    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The unique ID of the group you want to update.
- realm: [optional] The realm name
- groupRepresentation:An object representing the new state of the group. You can update properties such as:
    - name: [optional] New name of the group
- attributes: [optional] Custom attributes up field
- path: [optional] full path of the group
- subGroups: [optional] List of child groups (can also be updated separately)
- description: [optional] the new group Description
- other [optional] group descriprion fields
    ```js
 // update single group
await keycloakAdapter.kcAdminClient.groups.update(
    { id: 'group-id' },
    { name: "another-group-name", description: "another-group-description" },
);
```


##### `function listSubGroups(filter)`
Retrieves a paginated list of direct subgroups for a specified parent group.
    This method is useful when navigating hierarchical group structures within a Keycloak realm.
    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - parentId: [required] ID of the parent group whose subgroups you want to list.
- first: [optional] Index of the first result for pagination (default is 0).
- max: [optional] Maximum number of results to return.
- briefRepresentation: [optional] If true, returns a lightweight version of each group (default is true).
- realm: [optional] Realm name.
    ```js
 // list 10 subgroups
await keycloakAdapter.kcAdminClient.groups.listSubGroups({
    parentId: 'gropd-id',
    first: 0,
    max: 10,
    briefRepresentation: false,
});
```



##### `function addRealmRoleMappings(role_mapping)`
Adds one or more realm-level roles to a specific group.
    This operation grants all users within that group the associated realm roles, effectively assigning permissions at a group level.
    @parameters:
- role_mapping: parameter provided as a JSON object that accepts the following parameters:
    - id: [required] 	The ID of the group to which roles will be added.
- roles: [required] An array of role(RoleRepresentation) objects to assign.

    ```js
 // add a role to group
await keycloakAdapter.kcAdminClient.groups.addRealmRoleMappings({
    id: 'gropd-id',
    // at least id and name should appear
    roles: [{
        id: 'role-id',
        name: 'role-name'
    }]
});
```



##### `function listAvailableRealmRoleMappings(filters)`
Retrieves all available realm-level roles that can be assigned to a specific group but are not yet assigned.
    This helps in identifying which roles are still eligible for addition to the group.
    @parameters:
- filters: parameter provided as a JSON object that accepts the following parameters:
    - id: [required] The ID of the group you want to inspect.

    Return an array of RoleRepresentation objects representing the assignable realm roles for the group.

    ```js
 // list available role-mappings
const availableRoles= await keycloakAdapter.kcAdminClient.groups.listAvailableRealmRoleMappings({
    id: 'gropd-id'
});
console.log('Available realm roles for group:', availableRoles);
```


##### `function listRoleMappings(filters)`
Retrieves all role mappings for a specific group, including both realm roles and client roles.
    This method is useful for understanding the complete set of roles that are assigned to a group.
    @parameters:
- filters: parameter provided as a JSON object that accepts the following parameters:
    - id: [required] The ID of the group whose roles to fetch

Return an object with two arrays:
    - realmMappings: realm-level roles assigned to the group.
- clientMappings: a map of client IDs to the client-level roles assigned for each client.

    ```js
 // list role-mappings
const roleMappings= await keycloakAdapter.kcAdminClient.groups.listRoleMappings({
    id: 'gropd-id'
});
console.log('Realm roles:', roleMappings.realmMappings);
console.log('Client roles:', roleMappings.clientMappings);
```


##### `function listRealmRoleMappings(filters)`
Returns the list of realm-level roles that are directly assigned to a specific group.
    These roles are defined at the realm level and are not tied to any specific client.
    @parameters:
- filters: parameter provided as a JSON object that accepts the following parameters:
    - id: [required] TThe ID of the group to retrieve roles for

    Return An array of RoleRepresentation objects

    ```js
 // list realm role-mappings of group
const realmRoles= await keycloakAdapter.kcAdminClient.groups.listRealmRoleMappings({
    id: 'gropd-id'
});
console.log('Realm roles assigned to group:', realmRoles.map(role => role.name));
```


##### `function listCompositeRealmRoleMappings(filters)`
Retrieves all composite realm-level roles assigned to a group.
    This includes both directly assigned roles and those inherited through composite roles.
    @parameters:
- filters: parameter provided as a JSON object that accepts the following parameters:
    - id: [required] TThe ID of the group to retrieve roles for

    Return An array of RoleRepresentation objects that includes all realm roles, both directly assigned and inherited via composite roles.

    ```js
 // List realm composite role-mappings of group
const compositeRealmRoles= await keycloakAdapter.kcAdminClient.groups.listCompositeRealmRoleMappings({
    id: 'gropd-id'
});
console.log('All (composite) realm roles for group:', compositeRealmRoles.map(role => role.name));
```


##### `function delRealmRoleMappings(filters)`
Removes one or more realm-level roles from a group's role mappings.
This operation only affects roles that are directly assigned.
    Composite roles inherited indirectly will not be removed.
    @parameters:
- filters: parameter provided as a JSON object that accepts the following parameters:
    - id: [required] TThe ID of the group to retrieve roles for
    - roles: [required] Array of roles to be removed

    ```js
 // Delete realm role-mappings from group
await keycloakAdapter.kcAdminClient.groups.delRealmRoleMappings({
    id: 'gropd-id',
    // at least id and name should appear
    roles: [{
        id: 'role-id',
        name: 'role-name'
    }]
});
```


##### `function addClientRoleMappings(filters)`
Assigns one or more client-level roles to a specific group.
    This allows all users belonging to that group to inherit the specified roles for a given client.
    @parameters:
- filters: parameter provided as a JSON object that accepts the following parameters:
    - id: [required] The ID of the group
- clientUniqueId: [required] The internal ID of the client
- roles: [required] Array of client roles to assign to the group

    ```js
 // add a client role to group
await keycloakAdapter.kcAdminClient.groups.addClientRoleMappings({
    id: 'gropd-id',
    clientUniqueId:'internal-client-id',
    // at least id and name should appear
    roles: [{
        id: 'role-id',
        name: 'role-name'
    }]
});
```


##### `function listAvailableClientRoleMappings(filters)`
Retrieves the list of client roles that are available to be assigned to a specific group but are not currently mapped.
    This is useful when you want to show assignable roles for a group in a specific client context.
    @parameters:
- filters: parameter provided as a JSON object that accepts the following parameters:
    - id: [required] The ID of the group
- clientUniqueId: [required] The internal ID of the client

    ```js
 // list available client role-mappings for group
const availableRoles= await keycloakAdapter.kcAdminClient.groups.listAvailableClientRoleMappings({
    id: 'gropd-id',
    clientUniqueId:'internal-client-id',
});
console.log('Available roles:', availableRoles);
```


##### `function listClientRoleMappings(filters)`
Retrieves the list of client roles that are currently assigned (mapped) to a specific group for a given client.
    This allows you to see which roles from a client the group already has.
    @parameters:
- filters: parameter provided as a JSON object that accepts the following parameters:
    - id: [required] The ID of the group
- clientUniqueId: [required] The internal ID of the client

    ```js
 // list client role-mappings of group
const availableRoles= await keycloakAdapter.kcAdminClient.groups.listClientRoleMappings({
    id: 'gropd-id',
    clientUniqueId:'internal-client-id',
});
console.log('Assigned client roles:', availableRoles);
```


##### `function listCompositeClientRoleMappings(filters)`
Retrieves the list of composite client roles assigned to a specific group.
    Composite roles are roles that aggregate other roles, so this method returns client roles that include one or more roles grouped under a composite role assigned to the group.
    @parameters:
- filters: parameter provided as a JSON object that accepts the following parameters:
    - id: [required] The ID of the group
- clientUniqueId: [required] The internal ID of the client

    ```js
 // list composite client role-mappings for group
const compositeClientRoles= await keycloakAdapter.kcAdminClient.groups.listCompositeClientRoleMappings({
    id: 'gropd-id',
    clientUniqueId:'internal-client-id',
});
console.log('Composite client roles assigned to group:', compositeClientRoles);
```


##### `function delClientRoleMappings(filters)`
Removes specific client role mappings from a group.
    This function deletes one or more client roles that were assigned to the group, effectively revoking those client roles from the group.
    @parameters:
- filters: parameter provided as a JSON object that accepts the following parameters:
    - id: [required] The ID of the group
- clientUniqueId: [required] The internal ID of the client
- roles: An array of role objects(RoleRepresentation) representing the client roles to be removed

    ```js
 // delete the created role
await keycloakAdapter.kcAdminClient.groups.delClientRoleMappings({
    id: 'gropd-id',
    clientUniqueId:'internal-client-id',
    roles: [
        {
            id: 'role-id',
            name: 'role-name'
    }]
});
```






### `entity roles`
The roles entity refers to Keycloak's roles management functionality, part of the Admin REST API.
It allows you to create, update, inspect, and delete both realm-level and client-level roles.

#### `entity roles functions`
##### `function create(role_dictionary)`
Create a new role
    ```js
 // create a role name called my-role
 keycloakAdapter.kcAdminClient.roles.create({name:'my-role'});
 ```
##### `function createComposite(params: { roleId: string }, payload: RoleRepresentation[]`
Create a new composite role
Composite roles in Keycloak are roles that combine other roles, allowing you to group multiple permissions
into a single, higher-level role. A composite role can include roles from the same realm as well
as roles from different clients. When you assign a composite role to a user,
    they automatically inherit all the roles it contains.


    ```js
 // create a  composite role where "admin" include anche "reader".
const adminRole = await client.roles.findOneByName({ name: 'admin' });
const readerRole = await client.roles.findOneByName({ name: 'reader' });

await client.roles.createComposite({ roleId: adminRole.id }, [readerRole]);
 ```

##### `function find()`
get all realm roles and return a JSON
    ```js
 keycloakAdapter.kcAdminClient.roles.find();
 ```
##### `function findOneByName(filter)`
get a role by name
    ```js
 // get information about 'my-role' role
 keycloakAdapter.kcAdminClient.roles.findOneByName({ name: 'my-role' });
 ```

##### `function findOneById(filter)`
get a role by its Id
    ```js
 // get information about 'my-role-id' role
 keycloakAdapter.kcAdminClient.roles.findOneById({ id: 'my-role-id' });
 ```

##### `function updateByName(filter,role_dictionary)`
update a role by its name
    ```js
 // update 'my-role' role with a new description
 keycloakAdapter.kcAdminClient.roles.updateByName({ name: 'my-role' }, {description:"new Description"});
 ```

##### `function updateById(filter,role_dictionary)`
update a role by its id
    ```js
 // update role by id 'my-role-id' with a new description
 keycloakAdapter.kcAdminClient.roles.updateById({ id: 'my-role-id' }, {description:"new Description"});
 ```

##### `function delByName(filter)`
delete a role by its name
    ```js
 // delete role  'my-role' 
 keycloakAdapter.kcAdminClient.roles.delByName({ name: 'my-role' });
 ```

##### `function findUsersWithRole(filter)`
Find all users associated with a specific role.
    ```js
 // Find all users associated with role named 'my-role' 
 keycloakAdapter.kcAdminClient.roles.findUsersWithRole({ name: 'my-role' });
 ```

##### `function getCompositeRoles({id:roleid})`
Find all composite roles associated with a specific id.
    ```js
 // Find all composite role named 'my-role' and id 'my-role-id' 
 keycloakAdapter.kcAdminClient.roles.getCompositeRoles({ id: 'my-role-id' });
 ```

##### `function getCompositeRolesForRealm({roleId:roleid})`
The getCompositeRolesForRealm function  is used to
retrieve all realm-level roles that are associated with a given composite role.
    When a role is defined as composite, it can include other roles either from the same
realm or from different clients. This specific method returns only the realm-level roles
that have been added to the composite role. It requires the roleId of the target role as a
parameter and returns an array of RoleRepresentation objects. If the role is not composite
or has no associated realm roles, the result will be an empty array. This method is useful
for understanding and managing hierarchical role structures within a realm in Keycloak.
    ```js
const compositeRoles = await keycloakAdapter.kcAdminClient.roles.getCompositeRolesForRealm({ roleId: 'role-id' });
console.log('admin composite roles:', compositeRoles.map(r => r.name));
 
 ```

##### `function getCompositeRolesForClient({roleId:'roleid', clientId:'clientId'})`
The getCompositeRolesForClient function is used to retrieve
all client-level roles that are associated with a given composite role.
    Composite roles in Keycloak can include roles from different clients,
    and this method specifically returns the roles belonging to a specified client that
are part of the composite role. It requires the roleId of the composite role
and the clientId of the client whose roles you want to retrieve. The function returns an array of
RoleRepresentation objects representing the client roles included in the composite.
    This helps manage and inspect client-specific role hierarchies within the composite role structure in Keycloak.
    ```js
const compositeRoles = await keycloakAdapter.kcAdminClient.roles.getCompositeRolesForClient({
    roleId: 'compositeRole-Id',
    clientId: 'client-Id'
});
console.log('admin composite roles fo client whith Id:clientId:', compositeRoles.map(r => r.name));
 
 ```




### `entity components`
The components entity allows you to manage Keycloak components, which are configuration entities such as user federation providers, authenticators, protocol mappers, themes, and more.
    Components in Keycloak are modular and pluggable, and this API lets you create, read, update, and delete them programmatically.

#### `entity components functions`

##### `function create(comoponentReppresentation)`
The method creates a new component in a Keycloak realm.
    Components are modular providers in Keycloak, such as user federation providers (LDAP, Kerberos), authenticators, identity providers, or other pluggable extensions.

    @parameters:
- comoponentReppresentation: An object representing the component to create.
- name: [required] A human-readable name for the component.
- providerId: [required] The provider ID (e.g., "ldap", "kerberos", "totp").
- providerType: [required] The type/class of the provider (e.g., "org.keycloak.storage.UserStorageProvider").
- parentId: [optional] The ID of the parent component (if hierarchical).
- config: [optional] A map of configuration options, where each property is an array of strings (Keycloak convention).
```js
 // create a component called my-ldap
 const newComponent= await keycloakAdapter.kcAdminClient.components.create({
     name: "my-ldap",
     providerId: "ldap",
     providerType: "org.keycloak.storage.UserStorageProvider",
     parentId: null,
     config: {
         enabled: ["true"],
         connectionUrl: ["ldap://ldap.example.com"],
         bindDn: ["cn=admin,dc=example,dc=com"],
         bindCredential: ["secret"],
         usersDn: ["ou=users,dc=example,dc=com"]
     }
 });

console.log("Created component:", newComponent);
 ```


##### `function update(comoponentReppresentation)`
The method updates an existing component in a Keycloak realm.
    Components represent pluggable extensions such as user federation providers (LDAP, Kerberos), protocol mappers, authenticator factories, or other custom integrations.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The unique ID of the component to update.
- comoponentReppresentation: An object representing the component to update.
- name: [required] A human-readable name for the component.
- providerId: [required] The provider ID (e.g., "ldap", "kerberos", "totp").
- providerType: [required] The type/class of the provider (e.g., "org.keycloak.storage.UserStorageProvider").
- parentId: [optional] The ID of the parent component (if hierarchical).
- config: [optional] A map of configuration options, where each property is an array of strings (Keycloak convention).
```js
 // update a component
 await keycloakAdapter.kcAdminClient.components.update(
     {id:'component-id'},
     {
     name: "my-ldap",
     providerId: "ldap",
     providerType: "org.keycloak.storage.UserStorageProvider",
     parentId: null,
     config: {
         enabled: ["true"],
         connectionUrl: ["ldap://ldap.example.com"],
         bindDn: ["cn=admin,dc=example,dc=com"],
         bindCredential: ["secret"],
         usersDn: ["ou=users,dc=example,dc=com"]
     }
 });

console.log("Component updated successfully");
 ```


##### `function findOne(filter)`
The method retrieves a single component from a realm by its ID.
    Components in Keycloak represent pluggable providers such as LDAP user federation, authenticators, protocol mappers, or other extensions.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The unique ID of the component to retrieve.
    ```js
// find one by Id
component = await keycloakAdapter.kcAdminClient.components.findOne({
    id: "component-id",
});

if (component) {
    console.log("Component found:", component);
} else {
    console.log("Component not found");
}

```

##### `function find(filter)`
The method retrieves a list of components in a Keycloak realm.
    You can optionally filter components by their parent ID and/or provider type (e.g., LDAP user federation providers, authenticators, protocol mappers).

@parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - {builtin attribute}: To find components by builtin attributes such as name, id
- max: A pagination parameter used to define the maximum number of components to return (limit).
    - first: A pagination parameter used to define the number of components to skip before starting to return results (offset/limit).
    ```js
// find by Id
component = await keycloakAdapter.kcAdminClient.components.find({
    id: "component-id",
});

if (component) {
    console.log("Component found:", component);
} else {
    console.log("Component not found");
}

```


##### `function del(filter)`
The method deletes a specific component from a Keycloak realm.
    Components include user federation providers (e.g., LDAP, Kerberos), authenticator providers, protocol mappers, or other pluggable extensions.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The unique ID of the component to delete.
```js
// del one by Id
await keycloakAdapter.kcAdminClient.components.del({
    id: "component-id",
});

console.log("Component deleted successfully");
 ```


##### `function listSubComponents(filter)`
The method retrieves all sub-components of a given parent component in a Keycloak realm.
    This is useful when working with hierarchical components, for example:
- LDAP storage provider and protocol mappers as sub-components
- Authenticator factories with nested components

@parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the parent component.
- type: [optional] Filters sub-components by their provider type (e.g., "org.keycloak.protocol.mapper.ProtocolMapper").
    ```js
// del one by Id
const subComponents= await keycloakAdapter.kcAdminClient.components.listSubComponents({
    id: "component-id", 
    type: "org.keycloak.protocol.mapper.ProtocolMapper",
});

console.log("Sub-components:", subComponents);
 ```


### `entity authenticationManagement`
The authenticationManagement entity provides methods to manage authentication flows, executions, and related settings within a Keycloak realm.
    ìThese operations let you:
- Create and manage authentication flows (e.g., browser flow, direct grant flow).
- Add and configure executions (authenticators, forms, conditions).
- Update execution requirements (e.g., REQUIRED, ALTERNATIVE, DISABLED).
- Handle form providers and authenticator configuration.
- Manage bindings (set a realm’s browser flow, direct grant flow, etc.).

Common Use Cases:
    - Defining custom login flows.
- Adding 2FA authenticators (e.g., OTP, WebAuthn) to flows.
- Configuring conditional executions (e.g., "only if user has role X").
- Assigning authentication flows to realm bindings (browser, reset credentials, etc.).

#### `entity authenticationManagement functions`

##### `function deleteRequiredAction(filter)`
The method deletes a required action from a Keycloak realm.
    Required actions are tasks that users must complete after login, such as:
    - Updating their password
- Verifying their email
- Configuring OTP
- Accepting terms and conditions

By deleting a required action, it will no longer be available for assignment to users.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The unique alias of the required action to delete (e.g., "UPDATE_PASSWORD").
    ```js
// del one by Id
const subComponents= await keycloakAdapter.kcAdminClient.authenticationManagement.deleteRequiredAction({
    alias: "UPDATE_PROFILE",
});

console.log("Required action deleted successfully");

 ```


##### `function registerRequiredAction(actionRepresentation)`
The method registers a new required action in a Keycloak realm.
    Required actions are tasks that users may be forced to perform during authentication (e.g., verify email, update password, configure OTP, or a custom scripted action).
This method is typically used after checking available actions via getUnregisteredRequiredActions.

    @parameters:
- actionRepresentation: The representation of the required action to register.
- providerId: [required] Unique ID of the required action (e.g., "terms_and_conditions").
- name: [required] Display name of the required action.
- description : [optional] Human-readable description of the action.
- defaultAction: [optional] Whether the action should be enabled by default.
- enabled: [optional] Whether the action is active.
- priority: [optional] Determines the execution order among required actions.
- config: [optional] Extra configuration options (usually empty for built-in actions).
```js
// register required action
const subComponents= await keycloakAdapter.kcAdminClient.authenticationManagement.registerRequiredAction({
    providerId: "terms_and_conditions",
    name: "Terms and Conditions",
    description: "Require user to accept terms before continuing",
    enabled: true,
    defaultAction: false,
    priority: 50,
    config: {}
});

console.log("Required action registered successfully");

 ```


##### `function getUnregisteredRequiredActions(filter)`
The method retrieves all available required actions that exist in Keycloak but are not yet registered in a given realm.
    This is useful if you want to see which built-in or custom required actions can still be added to the realm (e.g., custom scripts, OTP setup, email verification).

```js
// get unregistered required actions
const unregistered= await keycloakAdapter.kcAdminClient.authenticationManagement.getUnregisteredRequiredActions();

console.log("Unregistered required actions:", unregistered);

 ```

##### `function getRequiredActions(filter)`
The method retrieves all required actions that are currently registered and available in a given Keycloak realm.
    Required actions are tasks that users may be required to perform during authentication, such as:
    - Updating password
- Verifying email
- Configuring OTP
- Accepting terms and conditions
- others...

```js
// get required actions
const requiredActions= await keycloakAdapter.kcAdminClient.authenticationManagement.getRequiredActions();

console.log("Registered required actions:", requiredActions);

 ```

##### `function getRequiredActionForAlias(filter)`
The method retrieves a single required action in a Keycloak realm by its alias.
    Required actions are tasks that users may be forced to complete during authentication, such as update password, verify email, or configure OTP.
    This method is useful when you want details about a specific required action without listing all actions.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The unique alias of the required action to retrieve (e.g., "UPDATE_PASSWORD").
    ```js
// get required action for alias
const requiredAction= await keycloakAdapter.kcAdminClient.authenticationManagement.getRequiredActionForAlias({
    alias:'UPDATE_PASSWORD'
});

console.log("Required action for alias details:", requiredAction);

 ```

##### `function lowerRequiredActionPriority(filter)`
The method lowers the priority of a registered required action in a Keycloak realm.
    Priority determines the order in which required actions are executed for a user during authentication. Lowering the priority moves the action further down the execution order.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action to modify.
    ```js
// Lower required action priority
await keycloakAdapter.kcAdminClient.authenticationManagement.lowerRequiredActionPriority({
    alias:'UPDATE_PASSWORD'
});

console.log("Required action priority lowered successfully");

 ```

##### `function raiseRequiredActionPriority(filter)`
The method raises the priority of a registered required action in a Keycloak realm.
    Priority determines the order in which required actions are executed for a user during authentication.
    Raising the priority moves the action higher in the execution order, meaning it will be executed sooner.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action to modify.
    ```js
// raise required action priority
await keycloakAdapter.kcAdminClient.authenticationManagement.raiseRequiredActionPriority({
    alias:'UPDATE_PASSWORD'
});

console.log("Required action priority raised successfully");

 ```

##### `function getRequiredActionConfigDescription(filter)`
The method retrieves the configuration description for a specific required action in a Keycloak realm.
    This includes details about the configurable options available for that required action, such as which fields can be set, their types, and any default values.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action.
    ```js
// Get required action config description
const configDescription= await keycloakAdapter.kcAdminClient.authenticationManagement.getRequiredActionConfigDescription({
    alias: "CONFIGURE_OTP",
});

console.log("Required action config description:", configDescription);

 ```


##### `function getRequiredActionConfig(filter)`
The method retrieves the current configuration for a specific required action in a Keycloak realm.
    This allows you to see the settings that have been applied to a required action, such as OTP policies, password requirements, or any custom configurations.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action.
    ```js
// Get required action config
const config= await keycloakAdapter.kcAdminClient.authenticationManagement.getRequiredActionConfig({
    alias: "CONFIGURE_OTP",
});

console.log("Required action current config:", config);

 ```

##### `function removeRequiredActionConfig(filter)`
The method deletes the configuration of a specific required action in a Keycloak realm.
    This removes any customized settings for the action, effectively resetting it to its default behavior.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action.
    ```js
// Remove required action config
await keycloakAdapter.kcAdminClient.authenticationManagement.removeRequiredActionConfig({
    alias: "CONFIGURE_OTP",
});

console.log("Required action configuration removed successfully");

 ```

##### `function updateRequiredAction(filter,actionRepresentation)`
The method updates an existing required action in a Keycloak realm.
    Required actions are tasks that users may be required to perform during authentication, such as:
    - Updating password
- Verifying email
- Configuring OTP
- Accepting terms and conditions
- Others...

This method allows you to modify attributes such as enabled, defaultAction, priority, or configuration of a required action.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action to update.
- actionRepresentation: The updated representation of the required action.
- providerId: [required] Unique ID of the required action (alias).
- name: [required] Display name of the action.
- description: [optional] Human-readable description.
- enabled: [optional] Whether the action is active.
- defaultAction: [optional] Whether the action is assigned to new users by default.
- priority: [optional] Execution order among required actions.
- config: [optional] Extra configuration.

    ```js
// update required action
const requiredAction= await keycloakAdapter.kcAdminClient.authenticationManagement.updateRequiredAction(
    { alias: "VERIFY_EMAIL" },
    {
        providerId: "VERIFY_EMAIL",
        name: "Verify Email",
        description: "Require user to verify their email before login",
        enabled: true,
        defaultAction: false,
        priority: 20,
        config: {}
    }
);

console.log("Required action updated successfully");

 ```

##### `function updateRequiredActionConfig(filter,actionConfigRepresentation)`
The method updates the configuration of a specific required action in a Keycloak realm.
    This allows you to modify settings such as OTP policies, password requirements, or other parameters of built-in or custom required actions.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - alias: [required] The alias (providerId) of the required action to update.
- actionRepresentation: The configuration object to update.


    ```js
// update required action config
const requiredAction= await keycloakAdapter.kcAdminClient.authenticationManagement.updateRequiredActionConfig(
    { alias: "VERIFY_EMAIL" },
    {
        max_auth_age: "301",
        otpPolicyDigits: ["8"],
        otpPolicyAlgorithm: ["HmacSHA256"]
    }
);

console.log("Required action configuration updated successfully");

 ```


##### `function getClientAuthenticatorProviders()`
The method retrieves all client authenticator providers available in a Keycloak realm.
    Client authenticators are used to verify clients during authentication, such as:
    - Client ID and secret authentication
- JWT or X.509 certificate authentication
- Custom client authenticators

This method is useful for configuring client authentication flows and assigning authenticators to specific clients.


    ```js
// Get client authenticator providers
const clientAuthenticators= await keycloakAdapter.kcAdminClient.authenticationManagement.getClientAuthenticatorProviders();

console.log("Client authenticator providers:", clientAuthenticators);

 ```


##### `function getFormActionProviders()`
The method retrieves all form action providers available in a Keycloak realm.
    Form action providers are used during authentication flows to perform specific actions in forms, such as:
    - OTP validation
- Password update
- Terms and conditions acceptance
- Custom scripted form actions

This method is useful for configuring authentication flows that require specific user interactions.

    ```js
// Get form action providers
const formActions= await keycloakAdapter.kcAdminClient.authenticationManagement.getFormActionProviders();

console.log("Form action providers:", formActions);

 ```

##### `function getAuthenticatorProviders()`
The method retrieves all authenticator providers available in a Keycloak realm.
    Authenticators are used in authentication flows to verify users or perform specific steps during login, such as:
    - Username/password verification
- OTP verification
- WebAuthn authentication
- Custom authenticators

This method is useful for configuring authentication flows and adding or replacing authenticators.

    ```js
// Get authenticator providers
const authenticators= await keycloakAdapter.kcAdminClient.authenticationManagement.getAuthenticatorProviders();


console.log("Authenticator providers:", authenticators);

 ```


##### `function getFormProviders()`
The method retrieves all form providers available in a Keycloak realm.
    Form providers are used in authentication flows to render or handle user-facing forms, such as:
    - Login forms
- Registration forms
- OTP input forms
- Terms and conditions acceptance

This method is useful for configuring authentication flows that require user interaction through forms.

    ```js
// Get form providers
const forms= await keycloakAdapter.kcAdminClient.authenticationManagement.getFormProviders();



console.log("Form providers:", forms);

 ```

##### `function getFlows()`
The method retrieves all authentication flows in a Keycloak realm.
    Authentication flows define the sequence of authenticators and required actions that users must complete during login or other authentication events.

    This method allows you to inspect existing flows, including built-in flows like browser, direct grant, or registration, as well as custom flows.

    ```js
// Get flows
const flows= await keycloakAdapter.kcAdminClient.authenticationManagement.getFlows();

console.log("Authentication flows:", flows);

 ```

##### `function createFlow(flowRepresentation)`
The method retrieves a specific authentication flow in a Keycloak realm by its id.
    Authentication flows define the sequence of authenticators and required actions that users must complete during login or other authentication events.
    This method is useful for inspecting or modifying a particular flow.

    @parameters:
- flowRepresentation: The representation of the new flow. A typical AuthenticationFlowRepresentation includes:
    - alias : [required] Human-readable alias for the flow.
- providerId: [required] Type of flow ("basic-flow", "client-flow", etc.).
- description: [optional] Description of the flow.
- topLevel: [optional] Whether this is a top-level flow (default: true).
- builtIn: [optional] Whether this is a built-in flow (default: false).
- authenticationExecutions: [optional] Executions to include in the flow.

    ```js
// Create flow
await keycloakAdapter.kcAdminClient.authenticationManagement.createFlow({
    alias: "custom-browser-flow",
    description: "Custom browser authentication flow",
    providerId: "basic-flow",
    topLevel: true,
    builtIn: false,
    authenticationExecutions: []
});

console.log("Authentication flow created successfully");

 ```


##### `function updateFlow(filter, flowRepresentation)`
The method updates an existing authentication flow in a Keycloak realm.
    This allows you to modify attributes such as the flow’s description, alias, top-level status, or other properties.

    @parameters:
filter: Parameter provided as a JSON object that accepts the following filter:
    - flowId: [required] The id of the source flow to update.
- flowRepresentation: The representation of the flow to update. A typical AuthenticationFlowRepresentation includes:
    - alias : [required] Human-readable alias for the flow.
- providerId: [required] Type of flow ("basic-flow", "client-flow", etc.).
- description: [optional] Description of the flow.
- topLevel: [optional] Whether this is a top-level flow (default: true).
- builtIn: [optional] Whether this is a built-in flow (default: false).
- authenticationExecutions: [optional] Executions to include in the flow.

    ```js
// Update flow
await keycloakAdapter.kcAdminClient.authenticationManagement.updateFlow(
    { flowId:'flow-id' },
    {
        alias: "custom-browser-flow",
        description: "Custom browser authentication flow",
        providerId: "basic-flow",
        topLevel: true,
        builtIn: false,
        authenticationExecutions: []
    }
);

console.log("Flow updated successfully");

 ```


##### `function deleteFlow(filter)`
The method deletes an existing authentication flow in a Keycloak realm.
    Deleting a flow removes it completely, including all its executions and subflows.
    This is typically used to remove custom flows that are no longer needed.

    @parameters:
filter: Parameter provided as a JSON object that accepts the following filter:
    - flowId: [required] The id of the source flow to update.

    ```js
// Delete flow
await keycloakAdapter.kcAdminClient.authenticationManagement.deleteFlow({ 
    flowId:'flow-id' 
});

console.log("Authentication flow deleted successfully");

 ```

##### `function copyFlow(filter)`
The method duplicates an existing authentication flow in a Keycloak realm.
    This is useful for creating a custom flow based on an existing built-in or custom flow, preserving all executions and subflows.

    @parameters:
- filter: Parameter provided as a JSON object that accepts the following filter:
    - flow: [required] The alias of the source flow to copy.
- newName: [required] The alias of the new copied flow.

    ```js
// Copy flow
await keycloakAdapter.kcAdminClient.authenticationManagement.copyFlow({
    flow: "browser",
    newName: "custom-browser-flow"
});

console.log("Authentication flow copied successfully");

 ```


##### `function getFlow(filter)`
The method retrieves a specific authentication flow in a Keycloak realm by its id.
    Authentication flows define the sequence of authenticators and required actions that users must complete during login or other authentication events.
    This method is useful for inspecting or modifying a particular flow.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - flowId: [required] The id of the authentication flow to retrieve

    ```js
// Get flows
const flow= await keycloakAdapter.kcAdminClient.authenticationManagement.getFlow({
    flowId:'flow.id'
});

console.log("Authentication flow:", flow);

 ```

##### `function getExecutions(filter)`
The method retrieves all authentication executions for a specific authentication flow in a Keycloak realm.
    Executions define the individual steps or actions within a flow, such as:
    - Username/password verification
- OTP validation
- Terms acceptance
- Subflows

This method is useful to inspect or modify the steps of a flow.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - flow: [required] The alias of the authentication flow whose executions you want to retrieve.

    ```js
// Get executions
const executions= await keycloakAdapter.kcAdminClient.authenticationManagement.getExecutions({
    flow:'browser'
});

console.log("Authentication flow executions:", executions);

 ```



##### `function addExecutionToFlow(filter)`
The method adds a new execution (step) to an existing authentication flow in a Keycloak realm.
    Executions define the individual actions or authenticators in a flow, such as username/password verification, OTP validation, or custom authenticators.
    This method allows you to extend a flow with additional steps or subflows.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - flow: [required] The alias of the authentication flow to which the execution will be added.
- provider: [required] The authenticator or subflow to add (e.g., "auth-otp-form").
- requirement: [optional] "REQUIRED" | "ALTERNATIVE" | "DISABLED"
- priority: [optional] Number representing the execution order
- authenticatorFlow: [optional] Boolean indicating if the execution is a nested flow

    ```js
// add execution to flow
await keycloakAdapter.kcAdminClient.authenticationManagement.addExecutionToFlow({
    flow: "browser",
    provider: "auth-otp-form",
});

console.log("Execution added to authentication flow successfully");

 ```

##### `function addFlowToFlow(filter)`
The method adds an existing authentication flow as a subflow to another authentication flow in a Keycloak realm.
    This allows you to nest flows, creating complex authentication sequences where one flow can call another as a step.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - flow: [required] The alias of the parent authentication flow.
- alias: [required] The alias (name) of the new subflow.
- type: [required] Type of the flow (e.g., "basic-flow", "client-flow").
- provider: [required] The provider ID of the flow (e.g., "registration-page-form").
- description: [optional] A human-readable description of the subflow.

    ```js
// add flow to flow
const flow= await keycloakAdapter.kcAdminClient.authenticationManagement.addFlowToFlow({
    flow: "browser",
    alias: "subFlow",
    description: "",
    provider: "registration-page-form",
    type: "basic-flow",
});

console.log("Subflow added:", flow);

 ```


##### `function updateExecution(filter,executionRepresentation)`
The method updates an existing execution (step) within an authentication flow in a Keycloak realm.
    Executions are individual authenticators or subflows within a flow, and this method allows you to modify their requirement, priority, or other settings.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - flow: [required] The alias of the authentication flow containing the execution.
- executionRepresentation: The updated execution object. Typical fields in AuthenticationExecutionInfoRepresentation:
- id: [required] The ID of the execution.
- requirement: [optional] "REQUIRED" | "ALTERNATIVE" | "DISABLED"
- priority: [optional] Execution order within the flow
- authenticator: [optional] Authenticator ID (if changing the execution type)
- authenticatorFlow: [optional] Whether the execution is a nested flow


    ```js
// Update execution
await keycloakAdapter.kcAdminClient.authenticationManagement.updateExecution(
    { flow: "browser" },
    {
        id: "exec1-abc",
        requirement: "ALTERNATIVE",
        priority: 10,
    }
);

console.log("Execution updated successfully");

 ```


##### `function delExecution(filter)`
The method deletes an existing execution (step) from an authentication flow in a Keycloak realm.
    Executions are individual authenticators or subflows within a flow, and this method removes them completely from the flow.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the execution to delete.


```js
// Dell execution
await keycloakAdapter.kcAdminClient.authenticationManagement.delExecution({
    id: "exececution-id"
});

console.log("Execution deleted successfully");

 ```


##### `function raisePriorityExecution(filter)`
The method increases the priority of an execution within an authentication flow in a Keycloak realm.
    Increasing the priority moves the execution earlier in the flow sequence, affecting the order in which authenticators or subflows are executed.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] he ID of the execution whose priority will be raised.


    ```js
// raise priority execution
await keycloakAdapter.kcAdminClient.authenticationManagement.raisePriorityExecution({
    id: "exececution-id"
});

console.log("Execution priority raised successfully");

 ```

##### `function lowerPriorityExecution(filter)`
The method decreases the priority of an execution within an authentication flow in a Keycloak realm.
    Lowering the priority moves the execution later in the flow sequence, affecting the order in which authenticators or subflows are executed.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] he ID of the execution whose priority will be lowered.


    ```js
// lower priority execution
await keycloakAdapter.kcAdminClient.authenticationManagement.lowerPriorityExecution({
    id: "exececution-id"
});

console.log("Execution priority lowered successfully");
 ```


##### `function createConfig(filter)`
The method creates a configuration for a specific execution (step) within an authentication flow in a Keycloak realm.
    Configurations allow you to customize the behavior of an authenticator or required action, such as OTP policies, password requirements, or custom parameters.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the execution or required action to configure.
- alias: [required] The alias (name) of the configuration.
- config: [optional] The payload can also include a config object with key-value pairs for configuration parameters.


    ```js
// Create config
const config= await keycloakAdapter.kcAdminClient.authenticationManagement.createConfig({
    id: 'execution-id',
    alias: "test",
});

console.log("Configuration created:", config);
```


##### `function getConfig(filter)`
The method retrieves the configuration of a specific required action or execution within an authentication flow in a Keycloak realm.
    Configurations define additional settings for authenticators or required actions, such as OTP policies, password rules, or custom parameters.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the execution or required action whose configuration you want to retrieve.


    ```js
// Get config
const config= await keycloakAdapter.kcAdminClient.authenticationManagement.getConfig({
    id: 'execution-id',
});


console.log("Configuration retrieved:", config);
```


##### `function updateConfig(filter)`
The method updates the configuration of a specific required action or execution within an authentication flow in a Keycloak realm.
    This allows you to modify existing settings, such as OTP policies, password rules, or any custom parameters, without creating a new configuration.

@parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the existing configuration.
- config: [required] Key-value pairs representing the new configuration parameters.


    ```js
// Update config
await keycloakAdapter.kcAdminClient.authenticationManagement.updateConfig({
    id: 'config-id',
    config:{
        defaultProvider: "stringa"
    }
});


console.log("Configuration updated successfully");
```


##### `function delConfig(filter)`
The method deletes a configuration associated with a specific required action or execution within an authentication flow in a Keycloak realm.
    This is useful for removing obsolete or unwanted settings from a required action or execution.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - id: [required] The ID of the existing configuration.


    ```js
// del config
await keycloakAdapter.kcAdminClient.authenticationManagement.delConfig({
    id: 'config-id',
});


console.log("Configuration deleted successfully");
```


##### `function getConfigDescription(filter)`
The method retrieves the configuration description for a specific authenticator or required action in a Keycloak realm.

    This provides metadata and guidance about the configuration options available for the authenticator, such as:
    - Names of configuration properties
- Types (string, boolean, list, etc.)
- Default values
- Help texts or descriptions

This is useful for dynamically generating forms for configuring required actions or authenticators.

    @parameters:
- filter: parameter provided as a JSON object that accepts the following filter:
    - providerId: [required] The ID of the authenticator or required action whose configuration description you want to retrieve.


    ```js
// Get config description
const configDescription= await keycloakAdapter.kcAdminClient.authenticationManagement.getConfigDescription({
    providerId: 'provider-id',
});


console.log("Configuration description:", configDescription);
```

## 📝 License

This project is licensed under the MIT License.

Copyright (c) 2025 CRS4, aromanino, gporruvecchio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙋‍♂️ Contributions

Contributions, issues and feature requests are welcome!

    1. Fork the project
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

---

## 👨‍💻 Maintainer

Developed and maintained by [CRS4 Microservice Core Team ([cmc.smartenv@crs4.it](mailto:cmc.smartenv@crs4.it))] – feel free to reach out for questions or suggestions.

    Design and development
------
    Alessandro Romanino ([a.romanino@gmail.com](mailto:a.romanino@gmail.com))<br>
Guido Porruvecchio ([guido.porruvecchio@gmail.com](mailto:guido.porruvecchio@gmail.com))






//**************************************************
//**************************************************
//**************************************************
//**************************************************




/*
 <table><tbody>
 <tr><th align="left">Alessandro Romanino</th><td><a href="https://github.com/aromanino">GitHub/aromanino</a></td><td><a href="mailto:a.romanino@gmail.com">mailto:a.romanino@gmail.com</a></td></tr>
 <tr><th align="left">Guido Porruvecchio</th><td><a href="https://github.com/gporruvecchio">GitHub/porruvecchio</a></td><td><a href="mailto:guido.porruvecchio@gmail.com">mailto:guido.porruvecchio@gmail.com</a></td></tr>
 </tbody></table>
 * */




