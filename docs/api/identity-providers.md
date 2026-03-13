# Identity Providers API

Manage identity providers (OIDC/SAML/social), mappers, import, and permissions.

Namespace: KeycloakManager.identityProviders

## Overview

This handler covers:

- Provider CRUD.
- Provider factory discovery and metadata import.
- Mapper CRUD.
- Fine-grained permissions on provider resources.

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
- **Optional**: `filter.realm`
- **Returns**: Promise<IdentityProviderRepresentation>

### update(filter, identityProviderRepresentation)
- **Required**: `filter.alias`
- **Optional**: `filter.realm`
- **Required**: updated representation
- **Returns**: Promise<void>

### del(filter)
- **Required**: `filter.alias`
- **Optional**: `filter.realm`
- **Returns**: Promise<void>

## Factory and Discovery

### findFactory(filter)
- **Required**: `filter.providerId` (example: `oidc`, `saml`, `google`)
- **Returns**: Promise<object>

### importFromUrl(filter)
- **Required**: `filter.fromUrl`
- **Required**: `filter.providerId`
- **Optional**: `filter.alias`, `filter.trustEmail`, other provider-specific fields
- **Returns**: Promise<object>

## Mappers

### createMapper(mapperParams)
- **Required**: `mapperParams.alias` (identity provider alias)
- **Required**: `mapperParams.identityProviderMapper` (mapper representation object)
- **Returns**: Promise<object>

Typical mapper representation fields:

- name (string, required)
- identityProviderAlias (string, required)
- identityProviderMapper (string, required)
- config (object, optional)

### findMappers(filter)
- **Required**: `filter.alias` (identity provider alias)
- **Optional**: `filter.realm`
- **Returns**: Promise<Array<object>>

### findOneMapper(filter)
- **Required**: `filter.alias`
- **Required**: `filter.id` (mapper id)
- **Optional**: `filter.realm`
- **Returns**: Promise<object>

### updateMapper(filter, mapperRepresentation)
- **Required**: `filter.alias`
- **Required**: `filter.id`
- **Optional**: `filter.realm`
- **Required**: mapper representation
- **Returns**: Promise<void>

### delMapper(filter)
- **Required**: `filter.alias`
- **Required**: `filter.id`
- **Optional**: `filter.realm`
- **Returns**: Promise<void>

## Permissions

### updatePermission(filter, permissionRepresentation)
- **Required**: `filter.alias`
- **Required**: `permissionRepresentation.enabled` (boolean)
- **Optional**: `filter.realm`
- **Returns**: Promise<object>

### listPermissions(filter)
- **Required**: `filter.alias`
- **Optional**: `filter.realm`
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

const createdMapper = await KeycloakManager.identityProviders.createMapper({
  alias: 'google',
  identityProviderMapper: {
    name: 'email-claim-mapper',
    identityProviderAlias: 'google',
    identityProviderMapper: 'oidc-user-attribute-idp-mapper',
    config: {
      claim: 'email',
      'user.attribute': 'email',
      syncMode: 'INHERIT',
    },
  },
});

await KeycloakManager.identityProviders.updatePermission(
  { alias: 'google' },
  { enabled: true }
);
```

## See Also
- [API Reference](../api-reference.md)
- [Organizations](organizations.md)
