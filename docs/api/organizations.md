# Organizations API

Manage organizations for multi-tenancy in Keycloak 25+.

**Namespace:** `KeycloakManager.organizations`  
**Keycloak Version:** 25.0+  
**Required Feature Flag:** `organization`

## Overview

Organizations provide a way to group users, identity providers, and domains together, enabling better isolation and management of different organizational units in multi-tenant scenarios.

### Enable Organizations Feature

Start Keycloak with the organizations feature enabled:

```bash
--features=organization
```

Or in `docker-compose.yml`:

```yaml
environment:
  KC_FEATURES: 'organization'
```

## Table of Contents

- [create()](#create) - Create an organization
- [find()](#find) - List organizations
- [findOne()](#findone) - Get organization by ID
- [update()](#update) - Update organization
- [del()](#del) - Delete organization
- [addMember()](#addmember) - Add user to organization
- [listMembers()](#listmembers) - List organization members
- [delMember()](#delmember) - Remove user from organization
- [addIdentityProvider()](#addidentityprovider) - Link identity provider
- [listIdentityProviders()](#listidentityproviders) - List linked identity providers
- [delIdentityProvider()](#delidentityprovider) - Unlink identity provider

---

## create()

Create a new organization in the current realm.

**Syntax:**
```javascript
const result = await KeycloakManager.organizations.create(organizationRepresentation)
```

### Parameters

#### organizationRepresentation (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ⚠️ Yes | Unique organization name |
| `displayName` | string | 📋 Optional | Human-readable display name |
| `url` | string | 📋 Optional | Organization website URL |
| `domains` | array | 📋 Optional | List of domain objects |
| `attributes` | object | 📋 Optional | Custom key-value attributes |

### Returns

**Promise\<Object\>** - Created organization representation with `id`

### Examples

#### Basic Organization

```javascript
const org = await KeycloakManager.organizations.create({
  name: 'acme-corp',
  displayName: 'ACME Corporation',
  url: 'https://www.acme.com'
});

console.log('Created organization:', org.id);
```

#### With Domains and Attributes

```javascript
const org = await KeycloakManager.organizations.create({
  name: 'tech-startup',
  displayName: 'Tech Startup Inc.',
  url: 'https://techstartup.io',
  domains: [
    { name: 'techstartup.io', verified: true },
    { name: 'staging.techstartup.io', verified: false }
  ],
  attributes: {
    industry: ['Technology'],
    country: ['USA'],
    tier: ['Enterprise']
  }
});

console.log('Organization with domains:', org);
```

---

## find()

List all organizations in the current realm with optional filtering.

**Syntax:**
```javascript
const organizations = await KeycloakManager.organizations.find(filter)
```

### Parameters

#### filter (Object) 📋 Optional

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `search` | string | 📋 Optional | Search organizations by name or display name |
| `first` | number | 📋 Optional | Index of first result (pagination) |
| `max` | number | 📋 Optional | Maximum number of results |
| `realm` | string | 📋 Optional | Override realm context |

### Returns

**Promise\<Array\>** - Array of organization objects

### Examples

#### List All Organizations

```javascript
const orgs = await KeycloakManager.organizations.find();
console.log(`Found ${orgs.length} organizations`);

orgs.forEach(org => {
  console.log(`- ${org.name}: ${org.displayName}`);
});
```

#### Search with Pagination

```javascript
const orgs = await KeycloakManager.organizations.find({
  search: 'acme',
  first: 0,
  max: 10
});

console.log('First 10 organizations matching "acme":', orgs);
```

---

## findOne()

Get a specific organization by ID.

**Syntax:**
```javascript
const organization = await KeycloakManager.organizations.findOne(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | Organization UUID |
| `realm` | string | 📋 Optional | Override realm context |

### Returns

**Promise\<Object\>** - Organization representation

### Examples

```javascript
const org = await KeycloakManager.organizations.findOne({
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
});

console.log('Organization:', org.name);
console.log('Display Name:', org.displayName);
console.log('URL:', org.url);
console.log('Attributes:', org.attributes);
```

---

## update()

Update an existing organization. This performs a merge of the current organization data with the provided updates.

**Syntax:**
```javascript
await KeycloakManager.organizations.update(filter, organizationRepresentation)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | Organization UUID |

#### organizationRepresentation (Object) ⚠️ Required

Object containing fields to update (same structure as `create()`).

### Returns

**Promise\<void\>** - Resolves when update completes

### Examples

#### Update Display Name and URL

```javascript
await KeycloakManager.organizations.update(
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
  {
    displayName: 'ACME Corporation (Updated)',
    url: 'https://www.acmecorp.com'
  }
);

console.log('Organization updated');
```

#### Update Attributes

```javascript
await KeycloakManager.organizations.update(
  { id: orgId },
  {
    attributes: {
      tier: ['Premium'],
      status: ['Active']
    }
  }
);
```

### Notes

- The update performs a MERGE operation - existing fields not mentioned are preserved.
- The `name` field, if provided, will be updated; otherwise the current name is kept.

---

## del()

Delete an organization.

**Syntax:**
```javascript
await KeycloakManager.organizations.del(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | Organization UUID |

### Returns

**Promise\<void\>** - Resolves when deletion completes

### Examples

```javascript
await KeycloakManager.organizations.del({
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
});

console.log('Organization deleted');
```

### Warning

Deleting an organization removes all associated memberships and identity provider links.

---

## addMember()

Add a user as a member of an organization.

**Syntax:**
```javascript
await KeycloakManager.organizations.addMember(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | Organization UUID |
| `userId` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<void\>** - Resolves when user is added

### Examples

```javascript
// First, find or create a user
const users = await KeycloakManager.users.find({ username: 'john.doe' });
const userId = users[0].id;

// Find organization
const orgs = await KeycloakManager.organizations.find({ search: 'acme' });
const orgId = orgs[0].id;

// Add user to organization
await KeycloakManager.organizations.addMember({
  id: orgId,
  userId: userId
});

console.log('User added to organization');
```

---

## listMembers()

List all members (users) of an organization.

**Syntax:**
```javascript
const members = await KeycloakManager.organizations.listMembers(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | Organization UUID |
| `first` | number | 📋 Optional | Index of first result (pagination) |
| `max` | number | 📋 Optional | Maximum number of results |

### Returns

**Promise\<Array\>** - Array of user representations

### Examples

```javascript
const members = await KeycloakManager.organizations.listMembers({
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  max: 100
});

console.log(`Organization has ${members.length} members`);
members.forEach(user => {
  console.log(`- ${user.username} (${user.email})`);
});
```

---

## delMember()

Remove a user from an organization.

**Syntax:**
```javascript
await KeycloakManager.organizations.delMember(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | Organization UUID |
| `userId` | string | ⚠️ Yes | User UUID |

### Returns

**Promise\<void\>** - Resolves when user is removed

### Examples

```javascript
await KeycloakManager.organizations.delMember({
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  userId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
});

console.log('User removed from organization');
```

---

## addIdentityProvider()

Link an identity provider to an organization for federated login.

**Syntax:**
```javascript
await KeycloakManager.organizations.addIdentityProvider(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | Organization UUID |
| `alias` | string | ⚠️ Yes | Identity provider alias |

### Returns

**Promise\<void\>** - Resolves when IdP is linked

### Examples

```javascript
// First, ensure identity provider exists
const idps = await KeycloakManager.identityProviders.find();
console.log('Available IdPs:', idps.map(i => i.alias));

// Link Google IdP to organization
await KeycloakManager.organizations.addIdentityProvider({
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  alias: 'google'
});

console.log('Identity provider linked to organization');
```

---

## listIdentityProviders()

List all identity providers linked to an organization.

**Syntax:**
```javascript
const idps = await KeycloakManager.organizations.listIdentityProviders(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | Organization UUID |

### Returns

**Promise\<Array\>** - Array of identity provider representations

### Examples

```javascript
const idps = await KeycloakManager.organizations.listIdentityProviders({
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
});

console.log(`Organization has ${idps.length} linked identity providers`);
idps.forEach(idp => {
  console.log(`- ${idp.alias} (${idp.providerId})`);
});
```

---

## delIdentityProvider()

Unlink an identity provider from an organization.

**Syntax:**
```javascript
await KeycloakManager.organizations.delIdentityProvider(filter)
```

### Parameters

#### filter (Object) ⚠️ Required

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ⚠️ Yes | Organization UUID |
| `alias` | string | ⚠️ Yes | Identity provider alias |

### Returns

**Promise\<void\>** - Resolves when IdP is unlinked

### Examples

```javascript
await KeycloakManager.organizations.delIdentityProvider({
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  alias: 'google'
});

console.log('Identity provider unlinked from organization');
```

---

## Complete Workflow Example

```javascript
const KeycloakManager = require('keycloak-api-manager');

async function organizationWorkflow() {
  // Setup
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
    // 1. Create organization
    const org = await KeycloakManager.organizations.create({
      name: 'tech-corp',
      displayName: 'Technology Corporation',
      url: 'https://techcorp.io',
      attributes: {
        industry: ['Technology'],
        size: ['Large']
      }
    });
    console.log('✓ Created organization:', org.id);
    
    // 2. Find user to add
    const users = await KeycloakManager.users.find({ 
      username: 'john.doe',
      exact: true
    });
    
    if (users.length > 0) {
      // 3. Add user as member
      await KeycloakManager.organizations.addMember({
        id: org.id,
        userId: users[0].id
      });
      console.log('✓ Added user to organization');
    }
    
    // 4. Link identity provider
    await KeycloakManager.organizations.addIdentityProvider({
      id: org.id,
      alias: 'google'
    });
    console.log('✓ Linked Google IdP');
    
    // 5. List members
    const members = await KeycloakManager.organizations.listMembers({
      id: org.id
    });
    console.log(`✓ Organization has ${members.length} members`);
    
    // 6. List identity providers
    const idps = await KeycloakManager.organizations.listIdentityProviders({
      id: org.id
    });
    console.log(`✓ Organization has ${idps.length} linked IdPs`);
    
    // 7. Update organization
    await KeycloakManager.organizations.update(
      { id: org.id },
      { displayName: 'Technology Corporation (Updated)' }
    );
    console.log('✓ Updated organization');
    
    // 8. Cleanup (optional)
    // await KeycloakManager.organizations.del({ id: org.id });
    // console.log('✓ Deleted organization');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    KeycloakManager.stop();
  }
}

organizationWorkflow();
```

---

## See Also

- [API Reference](../api-reference.md) - Complete API index
- [Users API](users.md) - User management for adding members
- [Identity Providers API](identity-providers.md) - IdP configuration
- [Configuration](configuration.md) - Authentication setup
