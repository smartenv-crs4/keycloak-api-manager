# Groups API

Group CRUD, subgroup tree navigation, role mappings, and fine-grained group permissions.

Namespace: KeycloakManager.groups

## Overview

This handler supports:

- Group CRUD and hierarchy.
- Realm/client role mappings on groups.
- Fine-grained group permissions APIs.

The wrapper supports creating child groups in a single call by passing parentId to create().

## CRUD and Structure

### create(groupRepresentation)
- **Required**: `groupRepresentation.name` (string)
- **Optional**: `parentId`, `path`, `attributes`, `subGroups`, `realmRoles`, `clientRoles`
- **Returns**: Promise<object>

Notes:

- If parentId is provided, the wrapper calls child-group creation endpoint.

### find(filter)
- **Optional**: `search`, `first`, `max`, `briefRepresentation`, `exact`, `populateHierarchy`, `realm`
- **Returns**: Promise<Array<GroupRepresentation>>

### findOne(filter)
- **Required**: `filter.id` (string, group id)
- **Optional**: `filter.realm`
- **Returns**: Promise<GroupRepresentation>

### update(filter, groupRepresentation)
- **Required**: `filter.id` (string)
- **Optional**: `filter.realm`
- **Required**: `groupRepresentation` (partial)
- **Returns**: Promise<void>

### del(filter)
- **Required**: `filter.id` (string)
- **Optional**: `filter.realm`
- **Returns**: Promise<void>

### count(filter)
- **Optional**: `search`, `top`, `realm`
- **Returns**: Promise<number>

### listSubGroups(filter)
- **Required**: one of `filter.parentId` or `filter.id` (parent group id)
- **Optional**: `search`, `first`, `max`, `briefRepresentation`
- **Returns**: Promise<Array<GroupRepresentation>>

## Realm Role Mappings

### addRealmRoleMappings(role_mapping)
- **Required**: `role_mapping.id` (group id)
- **Required**: `role_mapping.roles` (Array<{id,name}>)
- **Optional**: `role_mapping.realm`
- **Returns**: Promise<void>

### delRealmRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Required**: `filters.roles` (Array<{id,name}>)
- **Optional**: `filters.realm`
- **Returns**: Promise<void>

### listRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Optional**: `filters.realm`
- **Returns**: Promise<object>

### listRealmRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Optional**: `filters.realm`
- **Returns**: Promise<Array<RoleRepresentation>>

### listAvailableRealmRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Optional**: `filters.realm`
- **Returns**: Promise<Array<RoleRepresentation>>

### listCompositeRealmRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Optional**: `filters.realm`
- **Returns**: Promise<Array<RoleRepresentation>>

## Client Role Mappings

### addClientRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Required**: `filters.clientUniqueId` (client UUID)
- **Required**: `filters.roles` (Array<{id,name}>)
- **Optional**: `filters.realm`
- **Returns**: Promise<void>

### delClientRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Required**: `filters.clientUniqueId` (client UUID)
- **Required**: `filters.roles` (Array<{id,name}>)
- **Optional**: `filters.realm`
- **Returns**: Promise<void>

### listClientRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Required**: `filters.clientUniqueId` (client UUID)
- **Optional**: `filters.realm`
- **Returns**: Promise<Array<RoleRepresentation>>

### listAvailableClientRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Required**: `filters.clientUniqueId` (client UUID)
- **Optional**: `filters.realm`
- **Returns**: Promise<Array<RoleRepresentation>>

### listCompositeClientRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Required**: `filters.clientUniqueId` (client UUID)
- **Optional**: `filters.realm`
- **Returns**: Promise<Array<RoleRepresentation>>

## Fine-Grained Group Permissions (Wrapper Enhancement)

These methods wrap Keycloak management-permission endpoints used for group admin authorization.

### setPermissions(filters, permissionRepresentation)
- **Required**: `filters.id` (group id)
- **Required**: `permissionRepresentation.enabled` (boolean)
- **Optional**: `filters.realm`
- **Optional**: additional permission fields returned by Keycloak
- **Returns**: Promise<object>

### listPermissions(filters)
- **Required**: `filters.id` (group id)
- **Optional**: `filters.realm`
- **Returns**: Promise<object>

### Feature Requirement
Use Keycloak with:

```bash
--features=admin-fine-grained-authz:v1
```

## Example

```js
const group = await KeycloakManager.groups.create({ name: 'engineering' });

const child = await KeycloakManager.groups.create({
	name: 'engineering-platform',
	parentId: group.id,
});

await KeycloakManager.groups.addRealmRoleMappings({
	id: group.id,
	roles: [{ id: realmRole.id, name: realmRole.name }],
});

await KeycloakManager.groups.setPermissions({ id: group.id }, { enabled: true });
const permissions = await KeycloakManager.groups.listPermissions({ id: group.id });
```

## See Also
- [API Reference](../api-reference.md)
- [Users](users.md)
- [Roles](roles.md)
