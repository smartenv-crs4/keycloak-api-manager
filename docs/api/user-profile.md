# User Profile API

Manage realm user-profile configuration and metadata.

**Namespace:** `KeycloakManager.userProfile`

## Methods

### getConfiguration(filter)
Get user-profile configuration for realm.

- **Optional**: realm context fields
- **Returns**: Promise<object>

### updateConfiguration(filter, userProfileConfig)
Update user-profile configuration.

- **Optional**: realm context fields
- **Required**: `userProfileConfig` (full/partial config object)
- **Returns**: Promise<void|object>

### getMetadata(filter)
Get resolved user-profile metadata.

- **Optional**: realm context fields
- **Returns**: Promise<object>

## Common User Profile Structure

Typical top-level fields used in `userProfileConfig`:
- `attributes`: Array of attribute definitions
- `groups`: Optional group definitions
- `unmanagedAttributePolicy`: Optional unmanaged policy

Each attribute may contain:
- `name` (required)
- `displayName`, `required`, `permissions`, `validations`, `annotations`, `multivalued`

## Example

```js
const currentConfig = await KeycloakManager.userProfile.getConfiguration();

await KeycloakManager.userProfile.updateConfiguration({}, {
  ...currentConfig,
  attributes: [
    ...(currentConfig.attributes || []),
    {
      name: 'department',
      displayName: '${department}',
      required: { roles: ['admin'] },
      permissions: { view: ['admin', 'user'], edit: ['admin'] },
      validations: { length: { min: 2, max: 64 } }
    }
  ]
});

const metadata = await KeycloakManager.userProfile.getMetadata();
```

## See Also
- [API Reference](../api-reference.md)
- [Users](users.md)
