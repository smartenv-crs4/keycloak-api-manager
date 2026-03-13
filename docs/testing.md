# Testing Guide

The test suite validates the package against a real Keycloak server. This guide covers both test environment setup and configuration.

## Table of Contents

- [Quick Start](#quick-start-end-to-end)
- [Test Configuration](#test-configuration)
- [Test Architecture](#test-architecture)
- [Test Layout](#current-test-layout)
- [Commands](#commands)
- [HTTPS Variant](#https-variant)
- [Setup Flow](#setup-flow)
- [Writing New Tests](#writing-new-tests)

---

## Quick Start (End-to-End)

### 1) Install dependencies

```bash
npm install
npm --prefix test install
```

### 2) Prepare local test config

Create local override files from the provided examples:

```bash
cp test/config/local.json.example test/config/local.json
cp test/config/secrets.json.example test/config/secrets.json
```

Then edit:

- `test/config/local.json` to set the Keycloak URL you can reach locally.
- `test/config/secrets.json` to set admin credentials.

For local Docker on default HTTP port:

```json
{
  "test": {
    "keycloak": {
      "baseUrl": "http://127.0.0.1:8080",
      "password": "admin"
    }
  }
}
```

### 3) Start Keycloak for tests

```bash
docker compose -f test/docker-keycloak/docker-compose.yml up -d
```

Wait until ready:

```bash
docker compose -f test/docker-keycloak/docker-compose.yml ps
curl -f http://127.0.0.1:8080/health/ready
```

### 4) Run tests

```bash
npm test
```

### 5) Stop environment (optional but recommended)

```bash
docker compose -f test/docker-keycloak/docker-compose.yml down
```

To also remove container volumes:

```bash
docker compose -f test/docker-keycloak/docker-compose.yml down -v
```

---

## Test Configuration

Test configuration uses `propertiesmanager` with a layered file strategy. Files are merged in this priority order (higher overrides lower):

1. `test/config/default.json` — committed defaults, non-sensitive
2. `test/config/secrets.json` — gitignored, admin credentials and passwords
3. `test/config/local.json` — gitignored, machine-specific host/port overrides

The active section is selected by `NODE_ENV` (defaults to `test` in suite bootstrap).

### Required Configuration Keys

| Key | Description |
|-----|-------------|
| `test.keycloak.baseUrl` | Keycloak server URL |
| `test.keycloak.realmName` | Realm used for authentication |
| `test.keycloak.clientId` | Client ID (usually `admin-cli`) |
| `test.keycloak.username` | Admin username |
| `test.keycloak.password` | Admin password (put in `secrets.json`) |
| `test.keycloak.grantType` | Usually `password` |

### Recommended Pattern

- Keep defaults and non-sensitive values in `default.json`.
- Put admin passwords and test user passwords in `secrets.json`.
- Put local machine-specific URLs/ports in `local.json`.

Example `local.json`:

```json
{
  "test": {
    "keycloak": {
      "baseUrl": "http://127.0.0.1:8080"
    }
  }
}
```

Example `secrets.json`:

```json
{
  "test": {
    "keycloak": {
      "password": "your-admin-password-here"
    },
    "realm": {
      "user": {
        "password": "test-password"
      }
    }
  }
}
```

### Security Rules

- Never commit `secrets.json` or `local.json`.
- Never commit production credentials.
- Keep `default.json` non-sensitive.

---

## Test Architecture

The suite uses a shared realm strategy:

- One global setup provisions baseline resources.
- Test files create their own unique entities where needed.
- Global teardown removes the shared test realm.

This improves speed and keeps the environment deterministic.

---

## Current Test Layout

```text
test/
  specs/
    *.test.js                 # core suites
    diagnostics/*.test.js     # diagnostic-style suites
    matrix/*.test.js          # data-driven matrix suites
  support/
    setup.js
    enableServerFeatures.js
    testConfig.js
```

---

## Commands

```bash
# full suite
npm test

# run only test workspace
npm --prefix test test

# grep a subset
npm --prefix test test -- --grep "Organizations Handler Tests"
npm --prefix test test -- --grep "Matrix -"
```

---

## HTTPS Variant

For HTTPS-like environments use the dedicated compose file:

```bash
export KEYCLOAK_CERT_PATH=/absolute/path/to/certs
export KEYCLOAK_HOSTNAME=keycloak.local
docker compose -f test/docker-keycloak/docker-compose-https.yml up -d
```

The cert directory must contain:

- `keycloak.crt`
- `keycloak.key`

---

## Setup Flow

`test/support/setup.js` runs before all suites and executes `test/support/enableServerFeatures.js` to provision:

- realm
- client
- user
- roles
- group
- client scope
- fine-grained permissions (when feature-enabled)

The same bootstrap also performs cleanup in global teardown by deleting the shared test realm.

---

## Writing New Tests

- Import config from `test/testConfig.js`.
- Use unique names for resources (`generateUniqueName` or timestamp).
- Clean up created resources in `after` hooks.
- Avoid destructive realm-wide mutations unless test is explicitly scoped for it.
