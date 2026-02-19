# Server Info API

Read Keycloak server capabilities and runtime metadata.

**Namespace:** `KeycloakManager.serverInfo`

## Methods

### getInfo()
Get full server-info payload.

- **Params**: none
- **Returns**: Promise<object>

The payload typically includes:
- `systemInfo`
- `memoryInfo`
- `profileInfo`
- `themes`
- `providers`
- `componentTypes`
- `passwordPolicies`
- `protocolMapperTypes`
- `clientInstallations`
- `enums`

## Example

```js
const info = await KeycloakManager.serverInfo.getInfo();

console.log('Keycloak version:', info.systemInfo?.version);
console.log('Available themes:', Object.keys(info.themes || {}));
console.log('Available provider categories:', Object.keys(info.providers || {}));
```

## See Also
- [API Reference](../api-reference.md)
