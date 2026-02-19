# Groups API

Group CRUD, subgroup tree navigation, role mappings, and fine-grained group permissions.

**Namespace:** `KeycloakManager.groups`

## CRUD and Structure

### create(groupRepresentation)
- **Required**: `groupRepresentation.name` (string)
- **Optional**: `path`, `attributes`, `subGroups`, `realmRoles`, `clientRoles`
- **Returns**: Promise<object>

### find(filter)
- **Optional**: `search`, `first`, `max`, `briefRepresentation`, `exact`, `populateHierarchy`
- **Returns**: Promise<Array<GroupRepresentation>>

### findOne(filter)
- **Required**: `filter.id` (string, group id)
- **Returns**: Promise<GroupRepresentation>

### update(filter, groupRepresentation)
- **Required**: `filter.id` (string)
- **Required**: `groupRepresentation` (partial)
- **Returns**: Promise<void>

### del(filter)
- **Required**: `filter.id` (string)
- **Returns**: Promise<void>

### count(filter)
- **Optional**: `search`, `top`
- **Returns**: Promise<number>

### listSubGroups(filter)
- **Required**: `filter.id` (string, parent group id)
- **Optional**: `search`, `first`, `max`, `briefRepresentation`
- **Returns**: Promise<Array<GroupRepresentation>>

## Realm Role Mappings

### addRealmRoleMappings(role_mapping)
- **Required**: `role_mapping.id` (group id)
- **Required**: `role_mapping.roles` (Array<{id,name}>)
- **Returns**: Promise<void>

### delRealmRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Required**: `filters.roles` (Array<{id,name}>)
- **Returns**: Promise<void>

### listRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Returns**: Promise<object>

### listRealmRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Returns**: Promise<Array<RoleRepresentation>>

### listAvailableRealmRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Returns**: Promise<Array<RoleRepresentation>>

### listCompositeRealmRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Returns**: Promise<Array<RoleRepresentation>>

## Client Role Mappings

### addClientRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Required**: `filters.clientUniqueId` (client UUID)
- **Required**: `filters.roles` (Array<{id,name}>)
- **Returns**: Promise<void>

### delClientRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Required**: `filters.clientUniqueId` (client UUID)
- **Required**: `filters.roles` (Array<{id,name}>)
- **Returns**: Promise<void>

### listClientRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Required**: `filters.clientUniqueId` (client UUID)
- **Returns**: Promise<Array<RoleRepresentation>>

### listAvailableClientRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Required**: `filters.clientUniqueId` (client UUID)
- **Returns**: Promise<Array<RoleRepresentation>>

### listCompositeClientRoleMappings(filters)
- **Required**: `filters.id` (group id)
- **Required**: `filters.clientUniqueId` (client UUID)
- **Returns**: Promise<Array<RoleRepresentation>>

## Fine-Grained Group Permissions (Wrapper Enhancement)

These methods wrap Keycloak management-permission endpoints used for group admin authorization.

### setPermissions(filters, permissionRepresentation)
- **Required**: `filters.id` (group id)
- **Required**: `permissionRepresentation.enabled` (boolean)
- **Optional**: additional permission fields returned by Keycloak
- **Returns**: Promise<object>

### listPermissions(filters)
- **Required**: `filters.id` (group id)
- **Returns**: Promise<object>

### Feature Requirement
Use Keycloak with:

```bash
--features=admin-fine-grained-authz:v1
```

## Example

```js
const group = await KeycloakManager.groups.create({ name: 'engineering' });
await KeycloakManager.groups.setPermissions({ id: group.id }, { enabled: true });
const permissions = await KeycloakManager.groups.listPermissions({ id: group.id });
```

## See Also
- [API Reference](../api-reference.md)
- [Users](users.md)
- [Roles](roles.md)
