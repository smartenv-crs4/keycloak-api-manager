# Clients API

Comprehensive client administration: CRUD, roles, secrets, scopes, sessions, authorization services, keys, protocol mappers, and evaluation endpoints.

**Namespace:** `KeycloakManager.clients`

## 1) Client CRUD

### create(client_dictionary)
- **Required**: `client_dictionary.clientId` (string)
- **Optional**: `name`, `enabled`, `protocol`, `publicClient`, `secret`, `redirectUris`, `webOrigins`, `serviceAccountsEnabled`, `authorizationServicesEnabled`, etc.
- **Returns**: Promise<object>

### find(filter)
- **Optional**: `clientId`, `search`, `first`, `max`, `viewableOnly`
- **Returns**: Promise<Array<ClientRepresentation>>

### findOne(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<ClientRepresentation>

### update(filter, clientRepresentation)
- **Required**: `filter.id` (client UUID)
- **Required**: `clientRepresentation` (partial/full)
- **Returns**: Promise<void>

### del(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<void>

## 2) Client Roles

### createRole(role_parameters)
- **Required**: `role_parameters.id` (client UUID)
- **Required**: `role_parameters.name` (role name)
- **Optional**: `description`, `composite`, `attributes`
- **Returns**: Promise<object>

### findRole(filter)
- **Required**: `filter.id` (client UUID)
- **Required**: `filter.roleName` (role name)
- **Returns**: Promise<RoleRepresentation>

### updateRole(filter, roleRepresentation)
- **Required**: `filter.id` (client UUID)
- **Required**: `filter.roleName` (role name)
- **Required**: `roleRepresentation`
- **Returns**: Promise<void>

### delRole(filter)
- **Required**: `filter.id` (client UUID)
- **Required**: `filter.roleName` (role name)
- **Returns**: Promise<void>

### listRoles(filter)
- **Required**: `filter.id` (client UUID)
- **Optional**: `first`, `max`, `search`, `briefRepresentation`
- **Returns**: Promise<Array<RoleRepresentation>>

## 3) Secrets and Registration

### getClientSecret(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<{type,value}>

### generateNewClientSecret(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<{type,value}>

### generateRegistrationAccessToken(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<object>

### invalidateSecret(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<void>

## 4) Providers and Service Account

### getInstallationProviders(filter)
- **Required**: `filter.id` (client UUID)
- **Optional**: `filter.providerId` (specific provider, wrapper supports direct endpoint)
- **Returns**: Promise<Array|object|string>

### listPolicyProviders(filter)
- **Required**: `filter.id` (client UUID)
- **Optional**: policy provider filters depending on Keycloak version
- **Returns**: Promise<Array<object>>

### getServiceAccountUser(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<UserRepresentation>

## 5) Client Scopes on Client

### addDefaultClientScope(filter)
- **Required**: `filter.id` (client UUID)
- **Required**: `filter.clientScopeId` (scope UUID)
- **Returns**: Promise<void>

### delDefaultClientScope(filter)
- **Required**: `filter.id` (client UUID)
- **Required**: `filter.clientScopeId`
- **Returns**: Promise<void>

### addOptionalClientScope(filter)
- **Required**: `filter.id` (client UUID)
- **Required**: `filter.clientScopeId`
- **Returns**: Promise<void>

### delOptionalClientScope(filter)
- **Required**: `filter.id` (client UUID)
- **Required**: `filter.clientScopeId`
- **Returns**: Promise<void>

### listDefaultClientScopes(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<Array<ClientScopeRepresentation>>

### listOptionalClientScopes(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<Array<ClientScopeRepresentation>>

## 6) Scope Mappings (Client + Realm)

### listScopeMappings(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<object>

### listAvailableClientScopeMappings(filter)
- **Required**: `filter.id` (client UUID)
- **Required**: `filter.clientUniqueId` (target client UUID)
- **Returns**: Promise<Array<RoleRepresentation>>

### addClientScopeMappings(filter, roles)
- **Required**: `filter.id` (client UUID)
- **Required**: `filter.clientUniqueId`
- **Required**: `roles` (Array<{id,name}>)
- **Returns**: Promise<void>

### listClientScopeMappings(filter)
- **Required**: `filter.id`
- **Required**: `filter.clientUniqueId`
- **Returns**: Promise<Array<RoleRepresentation>>

### listCompositeClientScopeMappings(filter)
- **Required**: `filter.id`
- **Required**: `filter.clientUniqueId`
- **Returns**: Promise<Array<RoleRepresentation>>

### delClientScopeMappings(filter, roles)
- **Required**: `filter.id`
- **Required**: `filter.clientUniqueId`
- **Required**: `roles`
- **Returns**: Promise<void>

### listAvailableRealmScopeMappings(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<Array<RoleRepresentation>>

### listRealmScopeMappings(filter)
- **Required**: `filter.id`
- **Returns**: Promise<Array<RoleRepresentation>>

### listCompositeRealmScopeMappings(filter)
- **Required**: `filter.id`
- **Returns**: Promise<Array<RoleRepresentation>>

### addRealmScopeMappings(filter, roles)
- **Required**: `filter.id`
- **Required**: `roles`
- **Returns**: Promise<void>

### delRealmScopeMappings(filter, roles)
- **Required**: `filter.id`
- **Required**: `roles`
- **Returns**: Promise<void>

## 7) Sessions and Cluster

### listSessions(filter)
- **Required**: `filter.id` (client UUID)
- **Optional**: `first`, `max`
- **Returns**: Promise<Array<object>>

### listOfflineSessions(filter)
- **Required**: `filter.id` (client UUID)
- **Optional**: `first`, `max`
- **Returns**: Promise<Array<object>>

### getSessionCount(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<number|object>

### getOfflineSessionCount(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<number|object>

### addClusterNode(filter)
- **Required**: `filter.id` (client UUID)
- **Required**: `filter.node` (string)
- **Returns**: Promise<void>

### deleteClusterNode(filter)
- **Required**: `filter.id` (client UUID)
- **Required**: `filter.node` (string)
- **Returns**: Promise<void>

## 8) Client Keys

### generateAndDownloadKey(filter, config)
- **Required**: `filter.id` (client UUID)
- **Required**: `config` (key generation/download options)
- **Returns**: Promise<object|binary>

### generateKey(filter)
- **Required**: `filter.id` (client UUID)
- **Optional**: key provider settings
- **Returns**: Promise<object>

### getKeyInfo(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<object>

### downloadKey(filter, config)
- **Required**: `filter.id` (client UUID)
- **Required**: `config` (format / keystore params)
- **Returns**: Promise<object|binary>

## 9) Authorization Services - Scope APIs

### createAuthorizationScope(filter, scopeRepresentation)
- **Required**: `filter.id` (client UUID with authz enabled)
- **Required**: `scopeRepresentation.name`
- **Optional**: `displayName`, `iconUri`
- **Returns**: Promise<object>

### listAllScopes(filter)
- **Required**: `filter.id`
- **Optional**: `name`, `first`, `max`, `deep`, `exactName`, `owner`, `scope`
- **Returns**: Promise<Array<object>>

### updateAuthorizationScope(filter, AuthorizationScopeRepresentation)
- **Required**: `filter.id`
- **Required**: `filter.scopeId`
- **Required**: representation object
- **Returns**: Promise<void>

### getAuthorizationScope(filter)
- **Required**: `filter.id`
- **Required**: `filter.scopeId`
- **Returns**: Promise<object>

### listAllResourcesByScope(filter)
- **Required**: `filter.id`
- **Required**: `filter.scopeId`
- **Returns**: Promise<Array<object>>

### listAllPermissionsByScope(filter)
- **Required**: `filter.id`
- **Required**: `filter.scopeId`
- **Returns**: Promise<Array<object>>

### listPermissionScope(filter)
- **Required**: `filter.id`
- **Required**: `filter.permissionId`
- **Returns**: Promise<Array<object>>

## 10) Authorization Services - Resources

### importResource(filter, resource)
- **Required**: `filter.id`
- **Required**: `resource` (resource server import JSON)
- **Returns**: Promise<object>

### exportResource(filter)
- **Required**: `filter.id`
- **Returns**: Promise<object>

### createResource(filter, resourceRepresentation)
- **Required**: `filter.id`
- **Required**: `resourceRepresentation.name`
- **Optional**: `uris`, `scopes`, `owner`, `type`, `attributes`
- **Returns**: Promise<object>

### getResource(filter)
- **Required**: `filter.id`
- **Required**: `filter.resourceId`
- **Returns**: Promise<object>

### listResources(filter)
- **Required**: `filter.id`
- **Optional**: `name`, `uri`, `owner`, `type`, `scope`, `first`, `max`, `deep`, `matchingUri`
- **Returns**: Promise<Array<object>>

### updateResource(filter, resourceRepresentation)
- **Required**: `filter.id`
- **Required**: `filter.resourceId`
- **Required**: updated resource representation
- **Returns**: Promise<void>

### listPermissionsByResource(filter)
- **Required**: `filter.id`
- **Required**: `filter.resourceId`
- **Returns**: Promise<Array<object>>

### listScopesByResource(filter)
- **Required**: `filter.id`
- **Required**: `filter.resourceId`
- **Returns**: Promise<Array<object>>

## 11) Authorization Services - Policies and Permissions

### createPermission(filter, permissionRepresentation)
- **Required**: `filter.id`
- **Required**: permission representation (`name`, `type`, ...)
- **Returns**: Promise<object>

### findPermissions(filter)
- **Required**: `filter.id`
- **Optional**: `name`, `scope`, `resource`, `type`, `first`, `max`, `owner`
- **Returns**: Promise<Array<object>>

### createPolicy(filter, policyRepresentation)
- **Required**: `filter.id`
- **Required**: policy representation (`name`, `type`, `logic`, `decisionStrategy`, ...)
- **Returns**: Promise<object>

### listDependentPolicies(filter)
- **Required**: `filter.id`
- **Required**: `filter.policyId`
- **Returns**: Promise<Array<object>>

### getAssociatedScopes(filter)
- **Required**: `filter.id`
- **Required**: `filter.permissionId`
- **Returns**: Promise<Array<object>>

### getAssociatedPolicies(filter)
- **Required**: `filter.id`
- **Required**: `filter.permissionId`
- **Returns**: Promise<Array<object>>

### getAssociatedResources(filter)
- **Required**: `filter.id`
- **Required**: `filter.permissionId`
- **Returns**: Promise<Array<object>>

### updateFineGrainPermission(filter, status)
- **Required**: `filter.id` (client UUID)
- **Required**: `status` (boolean)
- **Returns**: Promise<object>

### listFineGrainPermissions(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<object>

## 12) Resource Server Settings

### getResourceServer(filter)
- **Required**: `filter.id` (client UUID)
- **Returns**: Promise<object>

### updateResourceServer(filter, resourceServerRepresentation)
- **Required**: `filter.id`
- **Required**: `resourceServerRepresentation`
- **Returns**: Promise<void>

## 13) Token / Mapper Evaluation

### evaluateGenerateAccessToken(filter)
- **Required**: `filter.id` (client UUID)
- **Optional**: evaluation context filters
- **Returns**: Promise<object>

### evaluateGenerateIdToken(filter)
- **Required**: `filter.id`
- **Returns**: Promise<object>

### evaluateGenerateUserInfo(filter)
- **Required**: `filter.id`
- **Returns**: Promise<object>

### evaluateListProtocolMapper(filter)
- **Required**: `filter.id`
- **Returns**: Promise<Array<object>>

## 14) Protocol Mappers (Wrapper Enhancements)

This wrapper includes robust protocol mapper helpers used to cover gaps and edge-cases in upstream usage patterns.

### addProtocolMapper(filter, protocolMapperRepresentation)
- **Required**: `filter.id` (client UUID)
- **Required**: mapper representation (`name`, `protocol`, `protocolMapper`)
- **Returns**: Promise<object>

### updateProtocolMapper(filter, protocolMapperRepresentation)
- **Required**: `filter.id`
- **Required**: `filter.mapperId`
- **Required**: mapper representation
- **Returns**: Promise<void>

### addMultipleProtocolMappers(filter, protocolMapperRepresentation)
- **Required**: `filter.id`
- **Required**: mapper array payload
- **Returns**: Promise<void>

### findProtocolMapperByName(filter)
- **Required**: `filter.id`
- **Required**: `filter.name`
- **Returns**: Promise<object>

### findProtocolMappersByProtocol(filter)
- **Required**: `filter.id`
- **Required**: `filter.protocol`
- **Returns**: Promise<Array<object>>

### findProtocolMapperById(filter)
- **Required**: `filter.id`
- **Required**: `filter.mapperId`
- **Returns**: Promise<object>

### listProtocolMappers(filter)
- **Required**: `filter.id`
- **Returns**: Promise<Array<object>>

### delProtocolMapper(filter)
- **Required**: `filter.id`
- **Required**: `filter.mapperId`
- **Returns**: Promise<void>

## Example

```js
const client = await KeycloakManager.clients.create({
  clientId: 'my-service',
  enabled: true,
  serviceAccountsEnabled: true,
  authorizationServicesEnabled: true,
  publicClient: false
});

const secret = await KeycloakManager.clients.getClientSecret({ id: client.id });
const serviceUser = await KeycloakManager.clients.getServiceAccountUser({ id: client.id });
```

## See Also
- [API Reference](../api-reference.md)
- [Client Scopes](client-scopes.md)
- [Users](users.md)
