# Roles API

Realm and client role management, including composite roles.

**Namespace:** `KeycloakManager.roles`

## Role CRUD

### create(role_dictionary)
Create a realm role.

- **Required**: `role_dictionary.name` (string)
- **Optional**: `description`, `attributes`, `composite`, `clientRole`, `containerId`
- **Returns**: Promise<object>

### find(filters)
List realm roles.

- **Optional**: `first`, `max`, `search`, `briefRepresentation`
- **Returns**: Promise<Array<RoleRepresentation>>

### findOneByName(filters)
Get role by name.

- **Required**: `filters.name` (string)
- **Returns**: Promise<RoleRepresentation>

### findOneById(filters)
Get role by id.

- **Required**: `filters.id` (string)
- **Returns**: Promise<RoleRepresentation>

### updateByName(filters, role_dictionary)
Update role by name.

- **Required**: `filters.name` (string)
- **Required**: `role_dictionary` (partial role)
- **Returns**: Promise<void>

### updateById(filters, role_dictionary)
Update role by id.

- **Required**: `filters.id` (string)
- **Required**: `role_dictionary` (partial role)
- **Returns**: Promise<void>

### delByName(filters)
Delete role by name.

- **Required**: `filters.name` (string)
- **Returns**: Promise<void>

## Composite Roles

### createComposite(filters, roles)
Add composites to a realm role.

- **Required**: `filters.roleName` (string)
- **Required**: `roles` (Array<{id,name}>), realm or client roles
- **Returns**: Promise<void>

### getCompositeRoles(filters)
Get all composites for a role.

- **Required**: `filters.roleName` (string)
- **Returns**: Promise<Array<RoleRepresentation>>

### getCompositeRolesForRealm(filters)
Get realm-level composites.

- **Required**: `filters.roleName` (string)
- **Returns**: Promise<Array<RoleRepresentation>>

### getCompositeRolesForClient(filters)
Get client-level composites.

- **Required**: `filters.roleName` (string)
- **Required**: `filters.clientUniqueId` (client UUID)
- **Returns**: Promise<Array<RoleRepresentation>>

## Users with Role

### findUsersWithRole(filters)
List users that have a specific realm role.

- **Required**: `filters.name` (role name)
- **Optional**: `first`, `max`
- **Returns**: Promise<Array<UserRepresentation>>

## Example

```js
await KeycloakManager.roles.create({ name: 'realm-admin' });
const role = await KeycloakManager.roles.findOneByName({ name: 'realm-admin' });
const users = await KeycloakManager.roles.findUsersWithRole({ name: 'realm-admin' });
```

## See Also
- [API Reference](../api-reference.md)
- [Users](users.md)
- [Clients](clients.md)
