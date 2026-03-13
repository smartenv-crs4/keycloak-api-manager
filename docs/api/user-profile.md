# User Profile API

Manage realm user-profile configuration and metadata.

Namespace: KeycloakManager.userProfile

## Overview

This handler manages declarative user-profile schema in a realm.
It allows you to inspect current schema, update it, and read resolved metadata (validators, capabilities, attribute model).

Note: endpoints are accessed through direct REST calls in the handler for compatibility across admin-client versions.

## Methods

### getConfiguration(filter)

Get the current declarative user-profile configuration.

Parameters:

- filter (object, optional):
- realm (string, optional): override target realm.

Returns:

- Promise<object>: current profile configuration.

### updateConfiguration(filter, userProfileConfig)

Update user-profile configuration.

Parameters:

- filter (object, optional):
- realm (string, optional): override target realm.
- userProfileConfig (object, required): full or partial schema payload.

Common top-level fields:

- attributes (array): attribute definitions.
- groups (array, optional): grouped attributes.
- unmanagedAttributePolicy (string, optional)

Common attribute fields:

- name (string, required): attribute key.
- displayName (string, optional)
- required (object, optional): required rules.
- permissions (object, optional): view/edit permissions.
- validations (object, optional): validation rules.
- annotations (object, optional): UI/metadata annotations.
- multivalued (boolean, optional): enable list values.

Returns:

- Promise<void|object>: usually no content (204), or response payload if provided by server.

### getMetadata(filter)

Get user-profile metadata resolved by the server.

Parameters:

- filter (object, optional):
- realm (string, optional): override target realm.

Returns:

- Promise<object>: metadata payload (validators, resolved attributes, capabilities).

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
console.log('Available validators:', Object.keys(metadata.validators || {}));
```

## See Also
- [API Reference](../api-reference.md)
- [Users](users.md)
