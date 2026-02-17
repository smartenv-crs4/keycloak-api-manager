# Keycloak API Manager - Test Suite

## Configuration (Secure Mode)

The test suite uses **propertiesmanager** with **multi-file override** pattern for secure configuration:

### Files

- `config.properties` - **Public** (committed) - Base/default values
- `config.local.properties` - **Private** (in .gitignore) - Local/sensitive values
- Environment Override - Last priority (direct override)

### Setup (Secure)

```bash
# Copy example file
cp config.local.properties.example config.local.properties

# Edit with your local values (not committed!)
nano config.local.properties
```

### Configuration Properties

`config.properties` (committed - defaults):
```properties
keycloak.baseUrl=http://localhost:8080
keycloak.realm=master
keycloak.clientId=admin-cli
keycloak.grantType=password
keycloak.adminUsername=admin
keycloak.adminPassword=admin
```

`config.local.properties` (local only - override sensitive values):
```properties
# Override URL for Docker/remote instance
keycloak.baseUrl=http://your-docker-host:8080

# Override credentials (more secure than in public config)
keycloak.adminUsername=your-admin-user
keycloak.adminPassword=your-admin-password
keycloak.clientSecret=your-secret-uuid
```

## Usage

### Default (Local Keycloak)
```bash
npm test
# Uses config.properties defaults
# Can override with config.local.properties
```

### Remote/Docker Keycloak

**Option 1: Via config.local.properties (Recommended)**
```bash
# Create local config (not committed)
cp config.local.properties.example config.local.properties

# Edit it
keycloak.baseUrl=http://your-docker-host:8080
keycloak.adminPassword=your-password

# Run tests
npm test
```

**Option 2: Via CLI Override**
```bash
keycloak.baseUrl=http://your-docker-host:8080 npm test
```

**Option 3: Via Environment Variables**
```bash
export KEYCLOAK_BASE_URL=http://your-docker-host:8080
export KEYCLOAK_ADMIN_PASSWORD=your-password
npm test
```

### Priority Order (Highest to Lowest)

1. Environment variables: `KEYCLOAK_*=value`
2. CLI variables: `keycloak.*=value`
3. `config.local.properties` (sensitive, local only)
4. `config.properties` (defaults, public)

## Local Docker Setup

Start Keycloak locally:

```bash
# Using docker-compose provided in project
docker compose up -d

# Wait for Keycloak to start (check logs)
docker compose logs -f keycloak

# Run tests
npm test
```

Check container status:
```bash
docker compose ps
```

Stop Keycloak:
```bash
docker compose down
```

## Security Best Practices

✅ **DO:**
- Keep credentials in `config.local.properties` (git-ignored)
- Use `.gitignore` to exclude `config.local.properties`
- Store sensitive data outside of committed files
- Use environment variables in CI/CD pipelines

❌ **DON'T:**
- Commit credentials to `config.properties`
- Hardcode passwords in test files
- Store secrets in `config.properties`

## Test Output

```
📍 Keycloak Configuration (from propertiesmanager):
   Base URL: http://localhost:8080
   Realm: master
   Client ID: admin-cli
   Grant Type: password

✓ Keycloak admin client initialized
✓ Test realm 'test-realm' created
```

## Troubleshooting

### Connection Refused
- Check Keycloak is running: `curl http://localhost:8080`
- Verify `keycloak.baseUrl` in `config.local.properties` or `config.properties`
- Wait a few seconds for Keycloak to fully start

### Authentication Failed
- Verify credentials in `config.local.properties`
- Check default admin user exists in Keycloak
- Ensure `admin-cli` client exists in realm

### Tests Timeout
- Increase Mocha timeout in `.mocharc.json`
- Check network connectivity to Keycloak
- Review Keycloak logs: `docker compose logs keycloak`

