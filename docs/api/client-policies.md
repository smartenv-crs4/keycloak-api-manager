# Client Policies API

Manage Client Policies and Client Profiles.

Namespace: KeycloakManager.clientPolicies

Required Feature Flag: client-policies

## Overview

Client Policies let you enforce security requirements on clients (for example PKCE, redirect URI rules, access type restrictions).
Client Profiles define reusable executor configurations that policies can reference.

This handler exposes both read and update operations.

Note: update endpoints are called through direct REST requests for compatibility across admin-client versions.

## Methods

### getPolicies(filter)

Get current client-policies configuration.

Parameters:

- filter (object, optional):
- realm (string, optional): override target realm.

Returns:

- Promise<object>: configuration payload with policies and global settings.

### updatePolicies(filter, policiesRepresentation)

Update client policies configuration.

Parameters:

- filter (object, optional):
- realm (string, optional): override target realm.
- policiesRepresentation (object, required): payload to persist.

Typical fields in policiesRepresentation:

- policies (array): list of policy definitions.
- globalPolicies (array, optional): global policy names.

Typical fields per policy item:

- name (string, required): policy identifier.
- description (string, optional): human-readable description.
- enabled (boolean, optional): active/inactive state.
- conditions (array, optional): list of match conditions.
- profiles (array, optional): profile names applied when conditions match.

Returns:

- Promise<void|object>: usually no content (204), or response payload if provided by server.

### getProfiles(filter)

Get current client-profiles configuration.

Parameters:

- filter (object, optional):
- realm (string, optional): override target realm.

Returns:

- Promise<object>: configuration payload with profiles.

### updateProfiles(filter, profilesRepresentation)

Update client profiles configuration.

Parameters:

- filter (object, optional):
- realm (string, optional): override target realm.
- profilesRepresentation (object, required): payload to persist.

Typical fields in profilesRepresentation:

- profiles (array): list of profile definitions.

Typical fields per profile item:

- name (string, required): profile identifier.
- description (string, optional)
- executors (array, optional): executor list.

Typical fields per executor item:

- executor (string, required): executor type.
- configuration (object, optional): executor config map.

Returns:

- Promise<void|object>: usually no content (204), or response payload if provided by server.

## Feature Enablement

Run Keycloak with:

```bash
--features=client-policies
```

## Example

```js
const policies = await KeycloakManager.clientPolicies.getPolicies();

await KeycloakManager.clientPolicies.updatePolicies({}, {
  ...policies,
  policies: [
    ...(policies.policies || []),
    {
      name: 'enforce-pkce',
      description: 'Require PKCE',
      enabled: true,
      conditions: [{ condition: 'client-access-type', configuration: { type: ['PUBLIC'] } }],
      profiles: ['pkce-profile']
    }
  ]
});

const profiles = await KeycloakManager.clientPolicies.getProfiles();

await KeycloakManager.clientPolicies.updateProfiles({}, {
  ...profiles,
  profiles: [
    ...(profiles.profiles || []),
    {
      name: 'pkce-profile',
      description: 'Profile with PKCE related executors',
      executors: [
        {
          executor: 'pkce-enforcer',
          configuration: {
            'pkce-enforcer.enforce.client': 'true'
          }
        }
      ]
    }
  ]
});
```

## See Also
- [API Reference](../api-reference.md)
- [Clients](clients.md)
