# Realms API

Full realm lifecycle and advanced realm administration.

**Namespace:** `KeycloakManager.realms`

## Sections
- Realm CRUD
- Import / Export
- Client registration policies and initial access tokens
- Default groups
- Events and admin events
- Users management permissions
- Keys, sessions, revocation
- LDAP / SMTP diagnostics
- Localization

## Realm CRUD

### create(realmDictionary)
Create a realm.

- **Required**: `realmDictionary.realm` (string)
- **Optional**: any Keycloak RealmRepresentation fields (`enabled`, `displayName`, `registrationAllowed`, `loginTheme`, etc.)
- **Returns**: Promise<void|object>

### update(filter, realmDictionary)
Update a realm.

- **Required**: `filter.realm` (string)
- **Required**: `realmDictionary` (RealmRepresentation partial)
- **Returns**: Promise<void>

### del(filter)
Delete a realm.

- **Required**: `filter.realm` (string)
- **Returns**: Promise<void>

### find()
List all realms.

- **Params**: none
- **Returns**: Promise<Array<RealmRepresentation>>

### findOne(filter)
Get one realm.

- **Required**: `filter.realm` (string)
- **Returns**: Promise<RealmRepresentation>

## Import / Export

### partialImport(configuration)
Import partial realm config.

- **Required**: `configuration.realm` (string)
- **Optional**: `ifResourceExists` (`FAIL` | `SKIP` | `OVERWRITE`)
- **Optional**: `users`, `groups`, `clients`, `roles`, `identityProviders`, etc.
- **Returns**: Promise<object>

### export(configuration)
Export realm config.

- **Required**: `configuration.realm` (string)
- **Optional**: `users` (`realm_file` | `skip` | `same_file`), `clients`, `groupsAndRoles`
- **Returns**: Promise<object>

## Client Registration / Initial Access

### getClientRegistrationPolicyProviders(configuration)
Get client registration policy providers.

- **Required**: `configuration.realm` (string)
- **Returns**: Promise<Array<object>>

### createClientsInitialAccess(realmFilter, options)
Create initial access token for dynamic client registration.

- **Required**: `realmFilter.realm` (string)
- **Optional**: `options.count` (number)
- **Optional**: `options.expiration` (number, seconds)
- **Returns**: Promise<object>

### getClientsInitialAccess(realmFilter)
List initial access tokens.

- **Required**: `realmFilter.realm` (string)
- **Returns**: Promise<Array<object>>

### delClientsInitialAccess(realmFilter)
Delete one initial access token.

- **Required**: `realmFilter.realm` (string)
- **Required**: `realmFilter.id` (string, token id)
- **Returns**: Promise<void>

## Default Groups

### addDefaultGroup(realmFilter)
Add default group to realm.

- **Required**: `realmFilter.realm` (string)
- **Required**: `realmFilter.id` (string, group id)
- **Returns**: Promise<void>

### removeDefaultGroup(realmFilter)
Remove default group from realm.

- **Required**: `realmFilter.realm` (string)
- **Required**: `realmFilter.id` (string, group id)
- **Returns**: Promise<void>

### getDefaultGroups(realmFilter)
List default groups.

- **Required**: `realmFilter.realm` (string)
- **Returns**: Promise<Array<GroupRepresentation>>

### getGroupByPath(realmFilter)
Get group by path.

- **Required**: `realmFilter.realm` (string)
- **Required**: `realmFilter.path` (string, example `/team/dev`)
- **Returns**: Promise<GroupRepresentation>

## Events

### getConfigEvents(realmFilter)
Get events configuration.

- **Required**: `realmFilter.realm` (string)
- **Returns**: Promise<object>

### updateConfigEvents(realmFilter, configurationEvents)
Update events configuration.

- **Required**: `realmFilter.realm` (string)
- **Required**: `configurationEvents` (events settings)
- **Returns**: Promise<void>

### findEvents(realmFilter)
List user events.

- **Required**: `realmFilter.realm` (string)
- **Optional**: `client`, `dateFrom`, `dateTo`, `first`, `max`, `ipAddress`, `type`, `user`
- **Returns**: Promise<Array<object>>

### findAdminEvents(realmFilter)
List admin events.

- **Required**: `realmFilter.realm` (string)
- **Optional**: `authClient`, `authIpAddress`, `authRealm`, `authUser`, `dateFrom`, `dateTo`, `first`, `max`, `operationTypes`, `resourcePath`, `resourceTypes`
- **Returns**: Promise<Array<object>>

### clearEvents(realmFilter)
Delete user events.

- **Required**: `realmFilter.realm` (string)
- **Returns**: Promise<void>

### clearAdminEvents(realmFilter)
Delete admin events.

- **Required**: `realmFilter.realm` (string)
- **Returns**: Promise<void>

## Users Management Permissions

### getUsersManagementPermissions(realmFilter)
Get realm-level users management permission status.

- **Required**: `realmFilter.realm` (string)
- **Returns**: Promise<object>

### updateUsersManagementPermissions(updateParameters)
Enable/disable users management permissions.

- **Required**: `updateParameters.realm` (string)
- **Required**: `updateParameters.enabled` (boolean)
- **Returns**: Promise<object>

## Keys, Sessions, Revocation

### getKeys(filter)
Get realm keys and certificates.

- **Required**: `filter.realm` (string)
- **Returns**: Promise<object>

### getClientSessionStats(filter)
Get per-client active session counts.

- **Required**: `filter.realm` (string)
- **Returns**: Promise<object>

### pushRevocation(filter)
Push revocation policy to clients.

- **Required**: `filter.realm` (string)
- **Returns**: Promise<void>

### logoutAll(filter)
Logout all users in realm.

- **Required**: `filter.realm` (string)
- **Returns**: Promise<void>

## LDAP / SMTP Diagnostics

### testLDAPConnection(filter, options)
Test LDAP connection with bind credentials.

- **Required**: `filter.realm` (string)
- **Required**: `options.connectionUrl` (string)
- **Optional**: `options.bindDn`, `options.bindCredential`, `options.useTruststoreSpi`, `options.connectionTimeout`, `options.startTls`
- **Returns**: Promise<object>

### ldapServerCapabilities(filter, options)
Check LDAP server capabilities.

- **Required**: `filter.realm` (string)
- **Required**: LDAP connection options (similar to `testLDAPConnection`)
- **Returns**: Promise<object>

### testSMTPConnection(filter, config)
Test SMTP configuration.

- **Required**: `filter.realm` (string)
- **Required**: `config.host` (string)
- **Optional**: `config.port`, `config.from`, `config.auth`, `config.user`, `config.password`, `config.ssl`, `config.starttls`
- **Returns**: Promise<object>

## Localization

### getRealmLocalizationTexts(filter)
Get localized text values for locale.

- **Required**: `filter.realm` (string)
- **Required**: `filter.selectedLocale` (string)
- **Optional**: `filter.first`, `filter.max`
- **Returns**: Promise<object>

### addLocalization(filter, value)
Create/update one localization key.

- **Required**: `filter.realm` (string)
- **Required**: `filter.selectedLocale` (string)
- **Required**: `filter.key` (string)
- **Required**: `value` (string)
- **Returns**: Promise<void>

### getRealmSpecificLocales(filter)
List enabled realm locales.

- **Required**: `filter.realm` (string)
- **Returns**: Promise<Array<string>>

### deleteRealmLocalizationTexts(filter)
Delete one localization key for locale.

- **Required**: `filter.realm` (string)
- **Required**: `filter.selectedLocale` (string)
- **Required**: `filter.key` (string)
- **Returns**: Promise<void>

## Example

```js
await KeycloakManager.realms.create({ realm: 'acme', enabled: true });
await KeycloakManager.realms.update({ realm: 'acme' }, { displayName: 'ACME Realm' });
const realm = await KeycloakManager.realms.findOne({ realm: 'acme' });
```

## See Also
- [API Reference](../api-reference.md)
- [Configuration](configuration.md)
