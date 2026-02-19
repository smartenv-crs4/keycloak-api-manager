# Users API

Complete user management including CRUD operations, credentials, roles, groups, sessions, and federated identities.

**Namespace:** `KeycloakManager.users`

## Table of Contents

### User CRUD
- [create()](#create) - Create user
- [find()](#find) - Search users
- [findOne()](#findone) - Get user by ID
- [count()](#count) - Count users
- [update()](#update) - Update user
- [del()](#del) - Delete user

### Credentials & Password
- [resetPassword()](#resetpassword) - Reset/set user password
- [getCredentials()](#getcredentials) - List user credentials
- [deleteCredential()](#deletecredential) - Delete specific credential
- [getUserStorageCredentialTypes()](#getuserstoragecredentialtypes) - Get credential types from user storage
- [updateCredentialLabel()](#updatecredentiallabel) - Update credential label

### Profile & Metadata
- [getProfile()](#getprofile) - Get user profile schema

### Group Membership
- [addToGroup()](#addtogroup) - Add user to group
- [delFromGroup()](#delfromgroup) - Remove user from group
- [listGroups()](#listgroups) - List user's groups
- [countGroups()](#countgroups) - Count user's groups

### Realm Role Mappings
- [addRealmRoleMappings()](#addrealmrolemappings) - Assign realm roles
- [delRealmRoleMappings()](#delrealmrolemappings) - Remove realm roles
- [listRealmRoleMappings()](#listrealmrolemappings) - List assigned realm roles
- [listAvailableRealmRoleMappings()](#listavailablerealmrolemappings) - List assignable realm roles
- [listCompositeRealmRoleMappings()](#listcompositerealmrolemappings) - List effective realm roles
- [listRoleMappings()](#listrolemappings) - List all role mappings (realm + client)

### Client Role Mappings
- [addClientRoleMappings()](#addclientrolemappings) - Assign client roles
- [delClientRoleMappings()](#delclientrolemappings) - Remove client roles
- [listClientRoleMappings()](#listclientrolemappings) - List assigned client roles
- [listAvailableClientRoleMappings()](#listavailableclientrolemappings) - List assignable client roles
- [listCompositeClientRoleMappings()](#listcompositeclientrolemappings) - List effective client roles

### Sessions & Logout
- [listSessions()](#listsessions) - List active user sessions
- [listOfflineSessions()](#listofflinesessions) - List offline sessions
- [logout()](#logout) - Logout user (all sessions)

### Consents
- [listConsents()](#listconsents) - List user consents
- [revokeConsent()](#revokeconsent) - Revoke specific consent

### Impersonation
- [impersonation()](#impersonation) - Impersonate user

### Federated Identities
- [listFederatedIdentities()](#listfederatedidentities) - List linked identities
- [addToFederatedIdentity()](#addtofederatedidentity) - Link federated identity
- [delFromFederatedIdentity()](#delfromfederatedidentity) - Unlink federated identity

---

## create()

Create a new user in the current realm.

**Syntax:**
```javascript
const result = await KeycloakManager.users.create(userRepresentation)
```

### Parameters

#### userRepresentation (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `username` | string | ⚠️ Yes | Unique username |
| `email` | string | 📋 Optional | User email address |
| `firstName` | string | 📋 Optional | First name |
| `lastName` | string | 📋 Optional | Last name |
| `enabled` | boolean | 📋 Optional | Enable/disable account (default: true) |
| `emailVerified` | boolean | 📋 Optional | Mark email as verified (default: false) |
| `credentials` | array | 📋 Optional | Initial credentials (password, etc.) |
| `requiredActions` | array | 📋 Optional | Required actions (`['VERIFY_EMAIL', 'UPDATE_PASSWORD']`) |
| `attributes` | object | 📋 Optional | Custom user attributes |
| `groups` | array | 📋 Optional | Group IDs or paths |
| `realmRoles` | array | 📋 Optional | Realm role names |
| `clientRoles` | object | 📋 Optional | Client roles map `{ clientId: ['role1', 'role2'] }` |

### Returns

**Promise\<Object\>** - Created user representation with `id`

### Examples

#### Basic User

```javascript
const user = await KeycloakManager.users.create({
  username: 'john.doe',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  enabled: true
});

console.log('Created user:', user.id);
```

#### With Password and Required Actions

```javascript
const user = await KeycloakManager.users.create({
  username: 'jane.smith',
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  enabled: true,
  emailVerified: false,
  credentials: [{
    type: 'password',
    value: 'temporaryPassword123',
    temporary: true  // Force password change on first login
  }],
  requiredActions: ['VERIFY_EMAIL', 'UPDATE_PASSWORD']
});

console.log('User created with temporary password');
```

#### With Attributes

```javascript
const user = await KeycloakManager.users.create({
  username: 'employee123',
  email: 'employee@company.com',
  firstName: 'Employee',
  lastName: 'Name',
  enabled: true,
  attributes: {
    department: ['Engineering'],
    employeeId: ['EMP-12345'],
    location: ['San Francisco']
  }
});
```

---

## find()

Search for users with optional filtering and pagination. Supports searching by built-in attributes and custom attributes (Keycloak 15+).

**Syntax:**
```javascript
const users = await KeycloakManager.users.find(filter)
```

### Parameters

#### filter (Object) 📋 Optional

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `username` | string | 📋 Optional | Filter by username (partial match) |
| `email` | string | 📋 Optional | Filter by email (partial match) |
| `firstName` | string | 📋 Optional | Filter by first name |
| `lastName` | string | 📋 Optional | Filter by last name |
| `search` | string | 📋 Optional | Search across username/email/name |
| `exact` | boolean | 📋 Optional | Exact match instead of partial (default: false) |
| `enabled` | boolean | 📋 Optional | Filter by enabled status |
| `q` | string | 📋 Optional | Query by custom attributes (Keycloak 15+): `'attrName:value'` |
| `max` | number | 📋 Optional | Maximum results (pagination) |
| `first` | number | 📋 Optional | First result index (pagination) |

### Returns

**Promise\<Array\>** - Array of user representations

### Examples

#### List All Users (Limited)

```javascript
const users = await KeycloakManager.users.find({ max: 100 });
console.log(`Found ${users.length} users`);

users.forEach(user => {
  console.log(`- ${user.username} (${user.email})`);
});
```

#### Search by Email

```javascript
const users = await KeycloakManager.users.find({
  email: 'example.com',
  max: 50
});

console.log(`Users with @example.com email: ${users.length}`);
```

#### Exact Username Match

```javascript
const users = await KeycloakManager.users.find({
  username: 'john.doe',
  exact: true
});

if (users.length > 0) {
  console.log('User found:', users[0].id);
}
```

#### Search by Custom Attribute (Keycloak 15+)

```javascript
const users = await KeycloakManager.users.find({
  q: 'department:Engineering',
  max: 100
});

console.log(`Engineering department users: ${users.length}`);
```

#### Pagination

```javascript
// Get first page (0-99)
const page1 = await KeycloakManager.users.find({ first: 0, max: 100 });

// Get second page (100-199)
const page2 = await KeycloakManager.users.find({ first: 100, max: 100 });

console.log(`Page 1: ${page1.length} users`);
console.log(`Page 2: ${page2.length} users`);
```

---

## findOne()

Get a specific user by their unique ID.

**Syntax:**
```javascript
const user = await KeycloakManager.users.findOne(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<Object\>** - User representation

### Examples

```javascript
const user = await KeycloakManager.users.findOne({
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
});

console.log('Username:', user.username);
console.log('Email:', user.email);
console.log('Enabled:', user.enabled);
console.log('Attributes:', user.attributes);
```

---

## count()

Count users matching specified criteria.

**Syntax:**
```javascript
const total = await KeycloakManager.users.count(filter)
```

### Parameters

#### filter (Object) 📋 Optional

Same as `find()` filter parameters.

### Returns

**Promise\<number\>** - Total count

### Examples

```javascript
// Total users in realm
const total = await KeycloakManager.users.count();
console.log(`Total users: ${total}`);

// Count enabled users
const enabled = await KeycloakManager.users.count({ enabled: true });
console.log(`Enabled users: ${enabled}`);

// Count by email domain
const companyUsers = await KeycloakManager.users.count({ 
  email: '@company.com' 
});
console.log(`Company users: ${companyUsers}`);
```

---

## update()

Update user details.

**Syntax:**
```javascript
await KeycloakManager.users.update(searchParams, userRepresentation)
```

### Parameters

#### searchParams (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

#### userRepresentation (Object) ⚠️ Required

Object with fields to update (same structure as `create()`).

### Returns

**Promise\<void\>**

### Examples

#### Update Basic Fields

```javascript
await KeycloakManager.users.update(
  { id: userId },
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@newdomain.com'
  }
);

console.log('User updated');
```

#### Enable/Disable User

```javascript
await KeycloakManager.users.update(
  { id: userId },
  { enabled: false }
);

console.log('User disabled');
```

#### Update Attributes

```javascript
await KeycloakManager.users.update(
  { id: userId },
  {
    attributes: {
      department: ['Sales'],
      status: ['Active']
    }
  }
);
```

---

## del()

Delete a user permanently.

**Syntax:**
```javascript
await KeycloakManager.users.del(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<void\>**

### Examples

```javascript
await KeycloakManager.users.del({
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
});

console.log('User deleted');
```

---

## resetPassword()

Set or reset a user's password.

**Syntax:**
```javascript
await KeycloakManager.users.resetPassword(newCredentialsParameters)
```

### Parameters

#### newCredentialsParameters (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `credential` | object | ⚠️ Yes | Credential object |
| `credential.type` | string | ⚠️ Yes | Credential type (`'password'`) |
| `credential.value` | string | ⚠️ Yes | New password value |
| `credential.temporary` | boolean | 📋 Optional | Force change on next login (default: false) |

### Returns

**Promise\<void\>**

### Examples

#### Set Permanent Password

```javascript
await KeycloakManager.users.resetPassword({
  id: userId,
  credential: {
    type: 'password',
    value: 'newSecurePassword123!',
    temporary: false
  }
});

console.log('Password updated');
```

#### Set Temporary Password

```javascript
await KeycloakManager.users.resetPassword({
  id: userId,
  credential: {
    type: 'password',
    value: 'tempPassword123',
    temporary: true  // User must change on next login
  }
});

console.log('Temporary password set');
```

---

## getCredentials()

List all credentials for a user (passwords, OTP, etc.).

**Syntax:**
```javascript
const credentials = await KeycloakManager.users.getCredentials(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<Array\>** - Array of credential representations

### Examples

```javascript
const credentials = await KeycloakManager.users.getCredentials({
  id: userId
});

console.log(`User has ${credentials.length} credentials`);
credentials.forEach(cred => {
  console.log(`- ${cred.type}: ${cred.userLabel || 'unnamed'}`);
});
```

---

## deleteCredential()

Delete a specific credential.

**Syntax:**
```javascript
await KeycloakManager.users.deleteCredential(accountInfo)
```

### Parameters

#### accountInfo (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `credentialId` | string | ⚠️ Yes | Credential ID |

### Returns

**Promise\<void\>**

### Examples

```javascript
// Get credentials first
const credentials = await KeycloakManager.users.getCredentials({ id: userId });

// Delete specific OTP credential
const otpCred = credentials.find(c => c.type === 'otp');
if (otpCred) {
  await KeycloakManager.users.deleteCredential({
    id: userId,
    credentialId: otpCred.id
  });
  console.log('OTP credential deleted');
}
```

---

## getUserStorageCredentialTypes()

Get available credential types from user storage provider.

**Syntax:**
```javascript
const types = await KeycloakManager.users.getUserStorageCredentialTypes(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<Array\>** - Array of credential type strings

### Examples

```javascript
const types = await KeycloakManager.users.getUserStorageCredentialTypes({
  id: userId
});

console.log('Available credential types:', types);
// Example output: ['password', 'otp']
```

---

## updateCredentialLabel()

Update the label of a credential.

**Syntax:**
```javascript
await KeycloakManager.users.updateCredentialLabel(filter, label)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `credentialId` | string | ⚠️ Yes | Credential ID |

#### label (string) ⚠️ Required

New label for the credential.

### Returns

**Promise\<void\>**

### Examples

```javascript
const credentials = await KeycloakManager.users.getCredentials({ id: userId });
const passwordCred = credentials.find(c => c.type === 'password');

await KeycloakManager.users.updateCredentialLabel(
  { id: userId, credentialId: passwordCred.id },
  'My Primary Password'
);

console.log('Credential label updated');
```

---

## getProfile()

Get the user profile schema for the realm.

**Syntax:**
```javascript
const profile = await KeycloakManager.users.getProfile()
```

### Parameters

None

### Returns

**Promise\<Object\>** - User profile configuration

### Examples

```javascript
const profile = await KeycloakManager.users.getProfile();

console.log('User profile attributes:');
profile.attributes.forEach(attr => {
  console.log(`- ${attr.name} (${attr.validators ? 'validated' : 'free-form'})`);
});
```

---

## addToGroup()

Add user to a group.

**Syntax:**
```javascript
await KeycloakManager.users.addToGroup(parameters)
```

### Parameters

#### parameters (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `groupId` | string | ⚠️ Yes | Group UUID |

### Returns

**Promise\<void\>**

### Examples

```javascript
// Find group
const groups = await KeycloakManager.groups.find({ search: 'Administrators' });
const groupId = groups[0].id;

// Add user to group
await KeycloakManager.users.addToGroup({
  id: userId,
  groupId: groupId
});

console.log('User added to group');
```

---

## delFromGroup()

Remove user from a group.

**Syntax:**
```javascript
await KeycloakManager.users.delFromGroup(parameters)
```

### Parameters

#### parameters (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `groupId` | string | ⚠️ Yes | Group UUID |

### Returns

**Promise\<void\>**

### Examples

```javascript
await KeycloakManager.users.delFromGroup({
  id: userId,
  groupId: groupId
});

console.log('User removed from group');
```

---

## listGroups()

List all groups a user belongs to.

**Syntax:**
```javascript
const groups = await KeycloakManager.users.listGroups(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `briefRepresentation` | boolean | 📋 Optional | Return minimal data (default: true) |
| `first` | number | 📋 Optional | Pagination first index |
| `max` | number | 📋 Optional | Maximum results |

### Returns

**Promise\<Array\>** - Array of group representations

### Examples

```javascript
const groups = await KeycloakManager.users.listGroups({
  id: userId,
  max: 100
});

console.log(`User belongs to ${groups.length} groups:`);
groups.forEach(group => {
  console.log(`- ${group.name} (${group.path})`);
});
```

---

## countGroups()

Count groups a user belongs to.

**Syntax:**
```javascript
const count = await KeycloakManager.users.countGroups(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `search` | string | 📋 Optional | Filter by group name |

### Returns

**Promise\<number\>** - Count

### Examples

```javascript
const total = await KeycloakManager.users.countGroups({ id: userId });
console.log(`User is in ${total} groups`);
```

---

## addRealmRoleMappings()

Assign realm roles to a user.

**Syntax:**
```javascript
await KeycloakManager.users.addRealmRoleMappings(roleMapping)
```

### Parameters

#### roleMapping (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `roles` | array | ⚠️ Yes | Array of role objects with `id` and `name` |

### Returns

**Promise\<void\>**

### Examples

```javascript
// Find roles
const roles = await KeycloakManager.roles.find();
const adminRole = roles.find(r => r.name === 'admin');
const userRole = roles.find(r => r.name === 'user');

// Assign roles
await KeycloakManager.users.addRealmRoleMappings({
  id: userId,
  roles: [
    { id: adminRole.id, name: adminRole.name },
    { id: userRole.id, name: userRole.name }
  ]
});

console.log('Realm roles assigned');
```

---

## delRealmRoleMappings()

Remove realm roles from a user.

**Syntax:**
```javascript
await KeycloakManager.users.delRealmRoleMappings(roleMapping)
```

### Parameters

Same as `addRealmRoleMappings()`.

### Returns

**Promise\<void\>**

### Examples

```javascript
const roles = await KeycloakManager.roles.find();
const adminRole = roles.find(r => r.name === 'admin');

await KeycloakManager.users.delRealmRoleMappings({
  id: userId,
  roles: [{ id: adminRole.id, name: adminRole.name }]
});

console.log('Admin role removed');
```

---

## listRealmRoleMappings()

List realm roles directly assigned to a user (not including composite roles).

**Syntax:**
```javascript
const roles = await KeycloakManager.users.listRealmRoleMappings(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<Array\>** - Array of role representations

### Examples

```javascript
const roles = await KeycloakManager.users.listRealmRoleMappings({
  id: userId
});

console.log(`User has ${roles.length} assigned realm roles:`);
roles.forEach(role => {
  console.log(`- ${role.name}`);
});
```

---

## listAvailableRealmRoleMappings()

List realm roles available for assignment to a user.

**Syntax:**
```javascript
const roles = await KeycloakManager.users.listAvailableRealmRoleMappings(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<Array\>** - Array of assignable role representations

### Examples

```javascript
const available = await KeycloakManager.users.listAvailableRealmRoleMappings({
  id: userId
});

console.log('Roles available for assignment:');
available.forEach(role => {
  console.log(`- ${role.name}`);
});
```

---

## listCompositeRealmRoleMappings()

List effective realm roles (including roles from composite roles).

**Syntax:**
```javascript
const roles = await KeycloakManager.users.listCompositeRealmRoleMappings(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<Array\>** - Array of effective role representations

### Examples

```javascript
const effectiveRoles = await KeycloakManager.users.listCompositeRealmRoleMappings({
  id: userId
});

console.log(`User has ${effectiveRoles.length} effective realm roles (including composite)`);
```

---

## listRoleMappings()

List all role mappings (both realm and client roles).

**Syntax:**
```javascript
const mappings = await KeycloakManager.users.listRoleMappings(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<Object\>** - Object with `realmMappings` and `clientMappings`

### Examples

```javascript
const mappings = await KeycloakManager.users.listRoleMappings({
  id: userId
});

console.log('Realm roles:', mappings.realmMappings?.map(r => r.name));
console.log('Client mappings:', Object.keys(mappings.clientMappings || {}));
```

---

## addClientRoleMappings()

Assign client roles to a user.

**Syntax:**
```javascript
await KeycloakManager.users.addClientRoleMappings(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `clientUniqueId` | string | ⚠️ Yes | Client UUID (not clientId) |
| `roles` | array | ⚠️ Yes | Array of role objects |

### Returns

**Promise\<void\>**

### Examples

```javascript
// Find client
const clients = await KeycloakManager.clients.find({ clientId: 'my-app' });
const clientUniqueId = clients[0].id;

// Get client roles
const clientRoles = await KeycloakManager.clients.listRoles({
  id: clientUniqueId
});

const adminRole = clientRoles.find(r => r.name === 'app-admin');

// Assign client role
await KeycloakManager.users.addClientRoleMappings({
  id: userId,
  clientUniqueId: clientUniqueId,
  roles: [{ id: adminRole.id, name: adminRole.name }]
});

console.log('Client role assigned');
```

---

## delClientRoleMappings()

Remove client roles from a user.

**Syntax:**
```javascript
await KeycloakManager.users.delClientRoleMappings(filter)
```

### Parameters

Same as `addClientRoleMappings()`.

### Returns

**Promise\<void\>**

---

## listClientRoleMappings()

List client roles directly assigned to a user.

**Syntax:**
```javascript
const roles = await KeycloakManager.users.listClientRoleMappings(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `clientUniqueId` | string | ⚠️ Yes | Client UUID |

### Returns

**Promise\<Array\>** - Array of role representations

---

## listAvailableClientRoleMappings()

List client roles available for assignment.

**Syntax:**
```javascript
const roles = await KeycloakManager.users.listAvailableClientRoleMappings(filter)
```

### Parameters

Same as `listClientRoleMappings()`.

### Returns

**Promise\<Array\>** - Array of assignable role representations

---

## listCompositeClientRoleMappings()

List effective client roles (including composite).

**Syntax:**
```javascript
const roles = await KeycloakManager.users.listCompositeClientRoleMappings(filter)
```

### Parameters

Same as `listClientRoleMappings()`.

### Returns

**Promise\<Array\>** - Array of effective role representations

---

## listSessions()

List active user sessions.

**Syntax:**
```javascript
const sessions = await KeycloakManager.users.listSessions(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<Array\>** - Array of session representations

### Examples

```javascript
const sessions = await KeycloakManager.users.listSessions({
  id: userId
});

console.log(`User has ${sessions.length} active sessions`);
sessions.forEach(session => {
  console.log(`- Session ID: ${session.id}`);
  console.log(`  IP: ${session.ipAddress}`);
  console.log(`  Started: ${new Date(session.start)}`);
});
```

---

## listOfflineSessions()

List offline sessions for a client.

**Syntax:**
```javascript
const sessions = await KeycloakManager.users.listOfflineSessions(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `clientUniqueId` | string | ⚠️ Yes | Client UUID |

### Returns

**Promise\<Array\>** - Array of offline session representations

---

## logout()

Logout user from all sessions.

**Syntax:**
```javascript
await KeycloakManager.users.logout(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<void\>**

### Examples

```javascript
await KeycloakManager.users.logout({ id: userId });
console.log('User logged out from all sessions');
```

---

## listConsents()

List user consents for clients.

**Syntax:**
```javascript
const consents = await KeycloakManager.users.listConsents(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<Array\>** - Array of consent representations

### Examples

```javascript
const consents = await KeycloakManager.users.listConsents({
  id: userId
});

console.log(`User has granted consent to ${consents.length} clients`);
consents.forEach(consent => {
  console.log(`- ${consent.clientId}: ${consent.grantedClientScopes?.join(', ')}`);
});
```

---

## revokeConsent()

Revoke user consent for a specific client.

**Syntax:**
```javascript
await KeycloakManager.users.revokeConsent(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `clientId` | string | ⚠️ Yes | Client ID (not UUID) |

### Returns

**Promise\<void\>**

### Examples

```javascript
await KeycloakManager.users.revokeConsent({
  id: userId,
  clientId: 'my-app-client'
});

console.log('Consent revoked');
```

---

## impersonation()

Impersonate a user (requires impersonation permission).

**Syntax:**
```javascript
const result = await KeycloakManager.users.impersonation(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<Object\>** - Impersonation result with redirect URL

### Examples

```javascript
const result = await KeycloakManager.users.impersonation({
  id: userId
});

console.log('Impersonation redirect:', result.redirect);
```

---

## listFederatedIdentities()

List federated identities linked to a user.

**Syntax:**
```javascript
const identities = await KeycloakManager.users.listFederatedIdentities(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<Array\>** - Array of federated identity representations

### Examples

```javascript
const identities = await KeycloakManager.users.listFederatedIdentities({
  id: userId
});

console.log(`User has ${identities.length} linked identities`);
identities.forEach(identity => {
  console.log(`- ${identity.identityProvider}: ${identity.userName}`);
});
```

---

## addToFederatedIdentity()

Link a federated identity to a user.

**Syntax:**
```javascript
await KeycloakManager.users.addToFederatedIdentity(options)
```

### Parameters

#### options (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `federatedIdentityId` | string | ⚠️ Yes | Identity provider alias |
| `federatedIdentity` | object | ⚠️ Yes | Identity representation |

### Returns

**Promise\<void\>**

### Examples

```javascript
await KeycloakManager.users.addToFederatedIdentity({
  id: userId,
  federatedIdentityId: 'google',
  federatedIdentity: {
    identityProvider: 'google',
    userId: 'google-user-id-123',
    userName: 'user@gmail.com'
  }
});

console.log('Federated identity linked');
```

---

## delFromFederatedIdentity()

Unlink a federated identity from a user.

**Syntax:**
```javascript
await KeycloakManager.users.delFromFederatedIdentity(options)
```

### Parameters

#### options (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | User UUID |
| `federatedIdentityId` | string | ⚠️ Yes | Identity provider alias |

### Returns

**Promise\<void\>**

### Examples

```javascript
await KeycloakManager.users.delFromFederatedIdentity({
  id: userId,
  federatedIdentityId: 'google'
});

console.log('Google identity unlinked');
```

---

## Complete Workflow Example

```javascript
const KeycloakManager = require('keycloak-api-manager');

async function userManagementWorkflow() {
  await KeycloakManager.configure({
    baseUrl: 'https://keycloak.example.com',
    realmName: 'master',
    username: 'admin',
    password: 'admin',
    grantType: 'password',
    clientId: 'admin-cli'
  });
  
  KeycloakManager.setConfig({ realmName: 'my-app' });
  
  try {
    // 1. Create user
    const user = await KeycloakManager.users.create({
      username: 'john.doe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      enabled: true,
      credentials: [{
        type: 'password',
        value: 'tempPassword123',
        temporary: true
      }],
      requiredActions: ['VERIFY_EMAIL']
    });
    console.log('✓ User created:', user.id);
    
    // 2. Find group and add user
    const groups = await KeycloakManager.groups.find({ search: 'Users' });
    if (groups.length > 0) {
      await KeycloakManager.users.addToGroup({
        id: user.id,
        groupId: groups[0].id
      });
      console.log('✓ Added to group');
    }
    
    // 3. Assign realm role
    const roles = await KeycloakManager.roles.find();
    const userRole = roles.find(r => r.name === 'user');
    if (userRole) {
      await KeycloakManager.users.addRealmRoleMappings({
        id: user.id,
        roles: [{ id: userRole.id, name: userRole.name }]
      });
      console.log('✓ Role assigned');
    }
    
    // 4. List user's effective roles
    const effectiveRoles = await KeycloakManager.users.listCompositeRealmRoleMappings({
      id: user.id
    });
    console.log(`✓ User has ${effectiveRoles.length} effective roles`);
    
    // 5. Update user
    await KeycloakManager.users.update(
      { id: user.id },
      {
        attributes: {
          department: ['Engineering'],
          employeeId: ['EMP-789']
        }
      }
    );
    console.log('✓ User updated');
    
    // 6. List sessions
    const sessions = await KeycloakManager.users.listSessions({
      id: user.id
    });
    console.log(`✓ User has ${sessions.length} active sessions`);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    KeycloakManager.stop();
  }
}

userManagementWorkflow();
```

---

## See Also

- [API Reference](../api-reference.md) - Complete API index
- [Groups API](groups.md) - Group management
- [Roles API](roles.md) - Role management
- [Configuration](configuration.md) - Authentication setup
