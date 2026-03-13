# Server Info API

Read Keycloak server capabilities and runtime metadata.

Namespace: KeycloakManager.serverInfo

## Overview

Use this handler to inspect server capabilities before enabling advanced features in automation.
It is useful for diagnostics and compatibility checks in CI pipelines.

## Methods

### getInfo()

Fetch the full server-info payload from the configured realm context.

Parameters:

- none

Returns:

- Promise<object>: full server info payload.

Common top-level sections returned by Keycloak include:

- systemInfo
- memoryInfo
- profileInfo
- themes
- providers
- componentTypes
- passwordPolicies
- protocolMapperTypes
- clientInstallations
- enums

Example: basic inspection

```js
const info = await KeycloakManager.serverInfo.getInfo();

console.log('Keycloak version:', info.systemInfo?.version);
console.log('Available themes:', Object.keys(info.themes || {}));
console.log('Provider categories:', Object.keys(info.providers || {}));
```

Example: feature guard before workflow

```js
const info = await KeycloakManager.serverInfo.getInfo();
const hasOrganizationFeature = Boolean(info.profileInfo?.features?.organization);

if (!hasOrganizationFeature) {
	throw new Error('Organization feature is not enabled on this Keycloak server.');
}
```

## See Also

- [API Reference](../api-reference.md)
- [Keycloak Setup and Feature Flags](../keycloak-setup.md)
