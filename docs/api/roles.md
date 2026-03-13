# Roles API

Realm and client role management, including composite roles.

Namespace: KeycloakManager.roles

## Overview

This handler manages realm roles and composite relationships.
It covers CRUD, user-role lookup, and composite role operations for realm and client roles.

## Role CRUD

### create(role_dictionary)
Create a realm role.

- **Required**: `role_dictionary.name` (string)
- **Optional**: `description`, `attributes`, `composite`, `clientRole`, `containerId`
- **Returns**: Promise<object>

### find(filters)
List realm roles.

- **Optional**: `first`, `max`, `search`, `briefRepresentation`, `realm`
- **Returns**: Promise<Array<RoleRepresentation>>

### findOneByName(filters)
Get role by name.

- **Required**: `filters.name` (string)
- **Optional**: `filters.realm` (string)
- **Returns**: Promise<RoleRepresentation>

### findOneById(filters)
Get role by id.

- **Required**: `filters.id` (string)
- **Optional**: `filters.realm` (string)
- **Returns**: Promise<RoleRepresentation>

### updateByName(filters, role_dictionary)
Update role by name.

- **Required**: `filters.name` (string)
- **Optional**: `filters.realm` (string)
- **Required**: `role_dictionary` (partial role)
- **Returns**: Promise<void>

### updateById(filters, role_dictionary)
Update role by id.

- **Required**: `filters.id` (string)
- **Optional**: `filters.realm` (string)
- **Required**: `role_dictionary` (partial role)
- **Returns**: Promise<void>

### delByName(filters)
Delete role by name.

- **Required**: `filters.name` (string)
- **Optional**: `filters.realm` (string)
- **Returns**: Promise<void>

## Composite Roles

### createComposite(filters, roles)
Add composites to a realm role.

- **Required**: `filters.roleId` (string)
- **Optional**: `filters.realm` (string)
- **Required**: `roles` (Array<{id,name}>), realm or client roles
- **Returns**: Promise<void>

### getCompositeRoles(filters)
Get all composites for a role.

- **Required**: `filters.id` (string)
- **Optional**: `filters.realm` (string)
- **Returns**: Promise<Array<RoleRepresentation>>

### getCompositeRolesForRealm(filters)
Get realm-level composites.

- **Required**: `filters.id` (string)
- **Optional**: `filters.realm` (string)
- **Returns**: Promise<Array<RoleRepresentation>>

### getCompositeRolesForClient(filters)
Get client-level composites.

- **Required**: `filters.id` (string)
- **Required**: `filters.clientId` (string, client UUID)
- **Optional**: `filters.realm` (string)
- **Returns**: Promise<Array<RoleRepresentation>>

## Users with Role

### findUsersWithRole(filters)
List users that have a specific realm role.

- **Required**: `filters.name` (role name)
- **Optional**: `filters.realm` (string)
- **Optional**: `first`, `max`
- **Returns**: Promise<Array<UserRepresentation>>

## Example

```js
await KeycloakManager.roles.create({ name: 'realm-admin' });
const role = await KeycloakManager.roles.findOneByName({ name: 'realm-admin' });
const users = await KeycloakManager.roles.findUsersWithRole({ name: 'realm-admin' });

// Composite role with one realm role and one client role
await KeycloakManager.roles.createComposite(
	{ roleId: compositeRoleId },
	[
		{ id: realmRoleId, name: 'test-role-1' },
		{ id: clientRoleId, name: 'client-role-a', clientRole: true, containerId: clientUuid }
	]
);

const realmComposites = await KeycloakManager.roles.getCompositeRolesForRealm({ id: compositeRoleId });
const clientComposites = await KeycloakManager.roles.getCompositeRolesForClient({
	id: compositeRoleId,
	clientId: clientUuid,
});
```

## See Also
- [API Reference](../api-reference.md)
- [Users](users.md)
- [Clients](clients.md)
