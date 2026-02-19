# Testing Guide

The test suite validates the package against a real Keycloak server.

## Test Architecture

The suite uses a shared realm strategy:

- One global setup provisions baseline resources.
- Test files create their own unique entities where needed.
- Global teardown removes the shared test realm.

This improves speed and keeps the environment deterministic.

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

## Setup Flow

`test/support/setup.js` runs before all suites and executes `test/support/enableServerFeatures.js` to provision:

- realm
- client
- user
- roles
- group
- client scope
- fine-grained permissions (when feature-enabled)

## Writing New Tests

- Import config from `test/testConfig.js`.
- Use unique names for resources (`generateUniqueName` or timestamp).
- Clean up created resources in `after` hooks.
- Avoid destructive realm-wide mutations unless test is explicitly scoped for it.
