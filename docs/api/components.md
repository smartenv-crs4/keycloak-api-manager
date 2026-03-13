# Components API

Manage Keycloak components (LDAP providers, Kerberos, user federation, storage mappers, and subcomponents).

Namespace: KeycloakManager.components

## Overview

Components represent pluggable server-side modules in Keycloak (for example user federation providers and their mappers).
This handler supports full CRUD plus sub-component listing.

## Methods

### create(componentRepresentation)

Create a component.

Parameters:

- componentRepresentation (object, required): component payload.

Common fields:

- name (string, required): component name.
- providerId (string, required): provider implementation id (for example ldap).
- providerType (string, required): provider class/type.
- parentId (string, optional): usually realm id or parent component id.
- config (object, optional): provider config map (Keycloak convention often uses arrays of strings).
- subType (string, optional): subtype where applicable.

Returns:

- Promise<object>: creation response (usually includes id).

### find(filter)

List components.

Parameters:

- filter (object, optional):
- parent (string, optional): parent id.
- type (string, optional): provider type filter.
- name (string, optional): name filter.
- first (number, optional): pagination offset.
- max (number, optional): pagination limit.

Returns:

- Promise<Array<ComponentRepresentation>>

### findOne(filter)

Get a single component by id.

Parameters:

- filter (object, required):
- id (string, required): component id.

Returns:

- Promise<ComponentRepresentation>

### update(filter, componentRepresentation)

Update an existing component.

Parameters:

- filter (object, required):
- id (string, required): component id.
- componentRepresentation (object, required): updated payload.

Returns:

- Promise<void>

### del(filter)

Delete a component by id.

Parameters:

- filter (object, required):
- id (string, required): component id.

Returns:

- Promise<void>

### listSubComponents(filter)

List sub-components for a parent component.

Parameters:

- filter (object, required):
- id (string, required): parent component id.
- type (string, required): sub-component provider type.
- first (number, optional): pagination offset.
- max (number, optional): pagination limit.

Returns:

- Promise<Array<ComponentRepresentation>>

## Example

```js
const ldapComponent = await KeycloakManager.components.create({
  name: 'corporate-ldap',
  providerId: 'ldap',
  providerType: 'org.keycloak.storage.UserStorageProvider',
  parentId: 'my-realm',
  config: {
    connectionUrl: ['ldap://ldap.company.local:389'],
    usersDn: ['ou=users,dc=company,dc=local'],
    bindDn: ['cn=admin,dc=company,dc=local']
  }
});

const allLdapProviders = await KeycloakManager.components.find({
  type: 'org.keycloak.storage.UserStorageProvider',
});

const firstProvider = allLdapProviders[0];

if (firstProvider) {
  await KeycloakManager.components.update(
    { id: firstProvider.id },
    {
      ...firstProvider,
      config: {
        ...(firstProvider.config || {}),
        editMode: ['READ_ONLY'],
      },
    }
  );
}
```

## See Also
- [API Reference](../api-reference.md)
- [Realms](realms.md)
