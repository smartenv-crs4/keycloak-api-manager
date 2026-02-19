# Architecture and Runtime

This package exposes a single runtime (`index.js`) that initializes one Keycloak admin client instance and wires all handler modules.

## Runtime Lifecycle

1. `configure(credentials)`
   - Validates and normalizes runtime configuration.
   - Authenticates against Keycloak.
   - Starts automatic token refresh.
   - Injects the configured client into all handlers.

2. `setConfig(overrides)`
   - Updates realm/baseUrl/request options at runtime.
   - Keeps active session/token management in place.

3. `auth(credentials)`
   - Direct token endpoint call for explicit OIDC login/token flows.
   - Intended for application-level third-party authentication use-cases.
   - Does not mutate the internal admin client session established by `configure()`.

4. `stop()`
   - Stops refresh timer for clean process termination.

## Handler Design

Each file in `Handlers/` receives the configured Keycloak client through `setKcAdminClient`.

Pattern:

- Keep wrapper methods thin and explicit.
- Use official client methods whenever possible.
- Use direct REST calls only for endpoints not fully covered by `@keycloak/keycloak-admin-client`.

## Direct API Wrappers

Some handlers (for example Organizations update behavior) use direct `fetch` calls to match real Keycloak endpoint requirements.

Guideline:

- Prefer wrapper parity with official endpoints.
- Keep payload shaping close to Keycloak server expectations.
- Avoid test-specific logic in production handlers.

## Error Handling Principles

- Fail fast on missing configuration.
- Preserve Keycloak error context in thrown messages.
- Keep behavior deterministic between local/remote Keycloak instances.
