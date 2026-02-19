# Components API

Manage Keycloak components (LDAP providers, Kerberos, user federation, storage mappers, and subcomponents).

**Namespace:** `KeycloakManager.components`

## Methods

### create(componentRepresentation)
- **Required**: `componentRepresentation.name`
- **Required**: `componentRepresentation.providerId`
- **Required**: `componentRepresentation.providerType`
- **Optional**: `parentId`, `config`, `subType`
- **Returns**: Promise<object>

### find(filter)
- **Optional**: `parent`, `type`, `name`
- **Returns**: Promise<Array<ComponentRepresentation>>

### findOne(filter)
- **Required**: `filter.id` (component id)
- **Returns**: Promise<ComponentRepresentation>

### update(filter, componentRepresentation)
- **Required**: `filter.id`
- **Required**: `componentRepresentation`
- **Returns**: Promise<void>

### del(filter)
- **Required**: `filter.id`
- **Returns**: Promise<void>

### listSubComponents(filter)
- **Required**: `filter.id` (parent component id)
- **Required**: `filter.type` (provider type)
- **Optional**: `filter.first`, `filter.max`
- **Returns**: Promise<Array<ComponentRepresentation>>

## Example

```js
const ldapComponent = await KeycloakManager.components.create({
  name: 'corporate-ldap',
  providerId: 'ldap',
  providerType: 'org.keycloak.storage.UserStorageProvider',
  parentId: 'my-realm',
  config: {
    connectionUrl: ['ldap://ldap.company.local:389'],
    usersDn: ['ou=users,dc=company,dc=local'],
    bindDn: ['cn=admin,dc=company,dc=local']
  }
});
```

## See Also
- [API Reference](../api-reference.md)
- [Realms](realms.md)
