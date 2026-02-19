# Attack Detection API

Brute-force and login-failure management endpoints.

**Namespace:** `KeycloakManager.attackDetection`

## Methods

### getBruteForceStatus(filter)
Get brute-force status for all users or query context depending on endpoint wrapper.

- **Optional**: realm context fields
- **Returns**: Promise<object>

### getUserBruteForceStatus(filter)
Get brute-force status for one user.

- **Required**: `filter.userId` (or `filter.id` based on wrapper usage)
- **Returns**: Promise<object>

### clearUserLoginFailures(filter)
Clear failed login attempts for one user.

- **Required**: `filter.userId` (or equivalent id field)
- **Returns**: Promise<void>

### clearAllLoginFailures(filter)
Clear failed login attempts for all users in realm.

- **Optional**: realm context fields
- **Returns**: Promise<void>

## Example

```js
const status = await KeycloakManager.attackDetection.getUserBruteForceStatus({ userId });
await KeycloakManager.attackDetection.clearUserLoginFailures({ userId });
```

## See Also
- [API Reference](../api-reference.md)
- [Users](users.md)
