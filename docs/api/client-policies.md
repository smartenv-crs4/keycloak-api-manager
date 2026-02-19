# Client Policies API

Manage Client Policies and Client Profiles.

**Namespace:** `KeycloakManager.clientPolicies`  
**Required Feature Flag:** `client-policies`

## Methods

### getPolicies(filter)
Get current client policies configuration.

- **Optional**: realm context fields
- **Returns**: Promise<object>

### updatePolicies(filter, policiesRepresentation)
Update client policies.

- **Optional**: realm context fields
- **Required**: `policiesRepresentation` (full/partial policies object)
- **Returns**: Promise<void|object>

### getProfiles(filter)
Get current client profiles configuration.

- **Optional**: realm context fields
- **Returns**: Promise<object>

### updateProfiles(filter, profilesRepresentation)
Update client profiles.

- **Optional**: realm context fields
- **Required**: `profilesRepresentation`
- **Returns**: Promise<void|object>

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
```

## See Also
- [API Reference](../api-reference.md)
- [Clients](clients.md)
