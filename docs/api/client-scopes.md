# Client Scopes API

Manage client scopes, protocol mappers, and role scope mappings.

**Namespace:** `KeycloakManager.clientScopes`

## Scope CRUD

### create(scopeRepresentation)
- **Required**: `scopeRepresentation.name` (string)
- **Optional**: `description`, `protocol` (`openid-connect` or `saml`), `attributes`
- **Returns**: Promise<object>

### find(filter)
- **Optional**: `search`, `first`, `max`
- **Returns**: Promise<Array<ClientScopeRepresentation>>

### findOne(filter)
- **Required**: `filter.id` (scope id)
- **Returns**: Promise<ClientScopeRepresentation>

### findOneByName(filter)
- **Required**: `filter.name` (scope name)
- **Returns**: Promise<ClientScopeRepresentation|null>

### update(filter, scopeRepresentation)
- **Required**: `filter.id` (scope id)
- **Required**: `scopeRepresentation` (partial)
- **Returns**: Promise<void>

### del(filter)
- **Required**: `filter.id` (scope id)
- **Returns**: Promise<void>

### delByName(filter)
- **Required**: `filter.name` (scope name)
- **Returns**: Promise<void>

## Realm Default Scopes

### listDefaultClientScopes(filter)
- **Optional**: `filter.realm`
- **Returns**: Promise<Array<ClientScopeRepresentation>>

### addDefaultClientScope(filter)
- **Required**: `filter.id` (scope id)
- **Returns**: Promise<void>

### delDefaultClientScope(filter)
- **Required**: `filter.id` (scope id)
- **Returns**: Promise<void>

### listDefaultOptionalClientScopes(filter)
- **Optional**: `filter.realm`
- **Returns**: Promise<Array<ClientScopeRepresentation>>

### addDefaultOptionalClientScope(filter)
- **Required**: `filter.id` (scope id)
- **Returns**: Promise<void>

### delDefaultOptionalClientScope(filter)
- **Required**: `filter.id` (scope id)
- **Returns**: Promise<void>

## Protocol Mappers

### listProtocolMappers(filter)
- **Required**: `filter.id` (scope id)
- **Returns**: Promise<Array<ProtocolMapperRepresentation>>

### findProtocolMapper(filter)
- **Required**: `filter.id` (scope id)
- **Required**: `filter.mapperId` (mapper id)
- **Returns**: Promise<ProtocolMapperRepresentation>

### findProtocolMapperByName(filter)
- **Required**: `filter.id` (scope id)
- **Required**: `filter.name` (mapper name)
- **Returns**: Promise<ProtocolMapperRepresentation>

### findProtocolMappersByProtocol(filter)
- **Required**: `filter.id` (scope id)
- **Required**: `filter.protocol` (`openid-connect` or `saml`)
- **Returns**: Promise<Array<ProtocolMapperRepresentation>>

### addProtocolMapper(filter, protocolMapper)
- **Required**: `filter.id` (scope id)
- **Required**: `protocolMapper.name`
- **Required**: `protocolMapper.protocol`
- **Required**: `protocolMapper.protocolMapper`
- **Optional**: `protocolMapper.config`
- **Returns**: Promise<object>

### addMultipleProtocolMappers(filter, protocolMappers)
- **Required**: `filter.id` (scope id)
- **Required**: `protocolMappers` (Array<ProtocolMapperRepresentation>)
- **Returns**: Promise<void>

### updateProtocolMapper(filter, protocolMapper)
- **Required**: `filter.id` (scope id)
- **Required**: `filter.mapperId` (mapper id)
- **Required**: `protocolMapper` (updated representation)
- **Returns**: Promise<void>

### delProtocolMapper(filter)
- **Required**: `filter.id` (scope id)
- **Required**: `filter.mapperId` (mapper id)
- **Returns**: Promise<void>

## Client Scope Role Mappings (for one client scope)

### listScopeMappings(filter)
- **Required**: `filter.id` (scope id)
- **Returns**: Promise<object>

### listAvailableClientScopeMappings(filter)
- **Required**: `filter.id` (scope id)
- **Required**: `filter.clientUniqueId` (client UUID)
- **Returns**: Promise<Array<RoleRepresentation>>

### addClientScopeMappings(filter, roleRepresentation)
- **Required**: `filter.id` (scope id)
- **Required**: `filter.clientUniqueId` (client UUID)
- **Required**: `roleRepresentation` (Array<{id,name}> or role-like object depending on endpoint)
- **Returns**: Promise<void>

### delClientScopeMappings(filter, roleRepresentation)
- **Required**: `filter.id` (scope id)
- **Required**: `filter.clientUniqueId` (client UUID)
- **Required**: `roleRepresentation`
- **Returns**: Promise<void>

### listClientScopeMappings(filter)
- **Required**: `filter.id` (scope id)
- **Required**: `filter.clientUniqueId` (client UUID)
- **Returns**: Promise<Array<RoleRepresentation>>

### listCompositeClientScopeMappings(filter)
- **Required**: `filter.id` (scope id)
- **Required**: `filter.clientUniqueId` (client UUID)
- **Returns**: Promise<Array<RoleRepresentation>>

## Realm Scope Mappings (for one client scope)

### listAvailableRealmScopeMappings(filter)
- **Required**: `filter.id` (scope id)
- **Returns**: Promise<Array<RoleRepresentation>>

### addRealmScopeMappings(filter, roleRepresentation)
- **Required**: `filter.id` (scope id)
- **Required**: `roleRepresentation`
- **Returns**: Promise<void>

### delRealmScopeMappings(filter, RoleRepresentation)
- **Required**: `filter.id` (scope id)
- **Required**: `RoleRepresentation`
- **Returns**: Promise<void>

### listRealmScopeMappings(filter)
- **Required**: `filter.id` (scope id)
- **Returns**: Promise<Array<RoleRepresentation>>

### listCompositeRealmScopeMappings(filter)
- **Required**: `filter.id` (scope id)
- **Returns**: Promise<Array<RoleRepresentation>>

## Example

```js
const scope = await KeycloakManager.clientScopes.create({
  name: 'profile-extended',
  protocol: 'openid-connect'
});

await KeycloakManager.clientScopes.addProtocolMapper(
  { id: scope.id },
  {
    name: 'department',
    protocol: 'openid-connect',
    protocolMapper: 'oidc-usermodel-attribute-mapper',
    config: {
      'user.attribute': 'department',
      'claim.name': 'department',
      'jsonType.label': 'String',
      'id.token.claim': 'true',
      'access.token.claim': 'true'
    }
  }
);
```

## See Also
- [API Reference](../api-reference.md)
- [Clients](clients.md)
