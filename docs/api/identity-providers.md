# Identity Providers API

Manage identity providers (OIDC/SAML/social), mappers, import, and permissions.

**Namespace:** `KeycloakManager.identityProviders`

## Provider CRUD

### create(identityProvidersRepresentation)
- **Required**: `alias`, `providerId`
- **Optional**: `enabled`, `trustEmail`, `storeToken`, `firstBrokerLoginFlowAlias`, `config`
- **Returns**: Promise<object>

### find()
- **Params**: none
- **Returns**: Promise<Array<IdentityProviderRepresentation>>

### findOne(filter)
- **Required**: `filter.alias`
- **Returns**: Promise<IdentityProviderRepresentation>

### update(filter, identityProviderRepresentation)
- **Required**: `filter.alias`
- **Required**: updated representation
- **Returns**: Promise<void>

### del(filter)
- **Required**: `filter.alias`
- **Returns**: Promise<void>

## Factory and Discovery

### findFactory(filter)
- **Required**: `filter.providerId` (example: `oidc`, `saml`, `google`)
- **Returns**: Promise<object>

### importFromUrl(filter)
- **Required**: provider-specific request payload (typically metadata URL fields)
- **Returns**: Promise<object>

## Mappers

### createMapper(mapperParams)
- **Required**: `mapperParams.identityProviderAlias`
- **Required**: `mapperParams.name`, `mapperParams.identityProviderMapper`
- **Optional**: `mapperParams.config`
- **Returns**: Promise<object>

### findMappers(filter)
- **Required**: `filter.alias` (identity provider alias)
- **Returns**: Promise<Array<object>>

### findOneMapper(filter)
- **Required**: `filter.alias`
- **Required**: `filter.id` (mapper id)
- **Returns**: Promise<object>

### updateMapper(filter, mapperRepresentation)
- **Required**: `filter.alias`
- **Required**: `filter.id`
- **Required**: mapper representation
- **Returns**: Promise<void>

### delMapper(filter)
- **Required**: `filter.alias`
- **Required**: `filter.id`
- **Returns**: Promise<void>

## Permissions

### updatePermission(filter, permissionRepresentation)
- **Required**: `filter.alias`
- **Required**: `permissionRepresentation.enabled` (boolean)
- **Returns**: Promise<object>

### listPermissions(filter)
- **Required**: `filter.alias`
- **Returns**: Promise<object>

## Example

```js
await KeycloakManager.identityProviders.create({
  alias: 'google',
  providerId: 'google',
  enabled: true,
  config: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  }
});

const mappers = await KeycloakManager.identityProviders.findMappers({ alias: 'google' });
```

## See Also
- [API Reference](../api-reference.md)
- [Organizations](organizations.md)
