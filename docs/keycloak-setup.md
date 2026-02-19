# Keycloak Setup and Feature Flags

This guide describes the server-side prerequisites required for full package functionality.

## Minimum Recommended Setup

- Keycloak 25+ (26.x recommended)
- Admin user in `master` realm (or equivalent privileged client)
- HTTPS strongly recommended outside local development

## Required Feature Flags

```bash
--features=admin-fine-grained-authz:v1,organization,client-policies
```

### Notes

- `admin-fine-grained-authz:v1`: required for management-permissions APIs used by group/user permission flows in this package.
- `organization`: required for Organizations endpoints.
- `client-policies`: required for client policy/profile endpoints.

## Docker Example

```bash
docker run -d --name keycloak \
  -p 8080:8080 -p 8443:8443 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -e KC_FEATURES=admin-fine-grained-authz:v1,organization,client-policies \
  keycloak/keycloak:latest start-dev
```

## Compose Example

```yaml
environment:
  KEYCLOAK_ADMIN: admin
  KEYCLOAK_ADMIN_PASSWORD: admin
  KC_FEATURES: 'admin-fine-grained-authz:v1,organization,client-policies'
```

## Verify Server Readiness

- Health endpoint should be reachable.
- Token endpoint should issue admin tokens.
- Admin endpoints should not return `Feature not enabled` for enabled features.
