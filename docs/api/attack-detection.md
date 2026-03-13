# Attack Detection API

Brute-force and login-failure management endpoints.

Namespace: KeycloakManager.attackDetection

## Overview

This handler wraps Keycloak Attack Detection endpoints used to:

- Inspect lock/failure status.
- Clear failures for one user.
- Clear failures for the entire realm.

These operations are usually used by support/admin tooling and automated account recovery flows.

## Methods

### getBruteForceStatus(filter)

Read global brute-force status context from the configured realm.

Parameters:

- filter (object, optional):
- realm (string, optional): override target realm for this call.

Returns:

- Promise<object>: realm brute-force status payload returned by Keycloak.

Example:

```js
const status = await KeycloakManager.attackDetection.getBruteForceStatus();
console.log(status);
```

### getUserBruteForceStatus(filter)

Read brute-force status for one user.

Parameters:

- filter (object, required):
- id (string, required): user id.
- realm (string, optional): override target realm.

Returns:

- Promise<object>: user brute-force state (for example temporary lock status, failures metadata).

Example:

```js
const userStatus = await KeycloakManager.attackDetection.getUserBruteForceStatus({
	id: userId,
});
```

### clearUserLoginFailures(filter)

Clear failed-login counters for one user.

Parameters:

- filter (object, required):
- id (string, required): user id.
- realm (string, optional): override target realm.

Returns:

- Promise<void>

Example:

```js
await KeycloakManager.attackDetection.clearUserLoginFailures({ id: userId });
```

### clearAllLoginFailures(filter)

Clear failed-login counters for all users in the realm.

Parameters:

- filter (object, optional):
- realm (string, optional): override target realm.

Returns:

- Promise<void>

Example:

```js
await KeycloakManager.attackDetection.clearAllLoginFailures();
```

## Error Notes

- Some Keycloak distributions/versions may not expose attack-detection endpoints in the same way.
- If endpoint support is missing, Keycloak may return 404.

## See Also

- [API Reference](../api-reference.md)
- [Users](users.md)
