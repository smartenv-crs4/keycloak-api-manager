# Keycloak Configuration Update Required

## Important Changes

The `keycloak-api-manager` package now includes support for advanced Keycloak features:

### New Handlers Added:
1. **Attack Detection** - Brute force protection management
2. **Organizations** - Multi-tenancy support (Keycloak 25+)
3. **User Profile** - Declarative user profile configuration (Keycloak 15+)
4. **Client Policies** - Client governance and security (Keycloak 12+)
5. **Server Info** - Server monitoring and diagnostics
6. **Group Permissions** - Fine-grained group permission management

### Required Keycloak Configuration

To use these new features, Keycloak must be started with the following feature flags enabled:

```bash
--features=admin-fine-grained-authz,organizations,declarative-user-profile,client-policies
```

### Docker Compose Update

The `test/docker-keycloak/docker-compose.yml` has been updated to include these features.

**To apply the changes:**

```bash
# Stop current Keycloak instance
cd test/docker-keycloak
docker compose down

# Start with new configuration
docker compose up -d

# Check logs to verify features are enabled
docker logs keycloak-test
```

### Verification

After restarting Keycloak, verify the features are enabled:

1. **Server Info**: The serverInfo handler should return feature information
2. **Organizations**: The organizations endpoint should be available at `/admin/realms/{realm}/organizations`
3. **Group Permissions**: Group permission endpoints should return data instead of "Feature not enabled" errors
4. **User Profile**: User profile configuration endpoints should be accessible

### Testing

Run the full test suite to verify all features:

```bash
npm test
```

Expected results:
- All 90+ tests should pass
- No "Feature not enabled" errors
- Organizations, User Profile, Client Policies, and Group Permissions tests should succeed

### Troubleshooting

If tests still fail after restarting:

1. **Check Keycloak logs**: `docker logs keycloak-test`
2. **Verify features in environment**: Look for `KC_FEATURES` in the container environment
3. **Check Keycloak version**: Organizations requires Keycloak 25+
4. **Verify API endpoints**: Use curl to test endpoints directly

Example:
```bash
# Get server info to check available features
curl http://localhost:8080/admin/realms/master/serverinfo \
  -H "Authorization: Bearer $TOKEN"
```

### Manual Feature Enabling (Alternative)

If docker-compose doesn't work, you can start Keycloak manually:

```bash
docker run -d --name keycloak-test \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -e KC_FEATURES=admin-fine-grained-authz,organizations,declarative-user-profile,client-policies \
  keycloak/keycloak:latest \
  start-dev
```

### Feature Availability by Keycloak Version

- **Client Policies**: Keycloak 12+
- **Declarative User Profile**: Keycloak 15+
- **Fine-Grained Authz**: Keycloak 12+ (preview feature)
- **Organizations**: Keycloak 25+ (preview feature)

If using an older Keycloak version, some tests may skip automatically.
