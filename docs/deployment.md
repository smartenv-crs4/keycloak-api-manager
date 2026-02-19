# Deployment Guide (Local and Remote)

This guide covers test/development Keycloak deployment options used by this project.

## Local Deployment

### HTTP (fast dev)

- Start compose from `test/docker-keycloak/`.
- Use `http://localhost:8080` as base URL.

### HTTPS (production-like)

- Provide certificate and key (`keycloak.crt`, `keycloak.key`).
- Expose `8443` and set hostname consistently.

## Remote Deployment (SSH)

- Copy compose and optional cert files to remote host.
- Start container remotely.
- Verify readiness and endpoint reachability.

## Recommended Verification Checklist

- Container healthy
- Token endpoint reachable
- Admin endpoint reachable
- Feature flags active (`admin-fine-grained-authz:v1,organization,client-policies`)

## Operational Tip

For automated test runs against remote hosts, keep test `baseUrl` aligned with reachable hostname/certificate pair to avoid TLS and normalization errors.
