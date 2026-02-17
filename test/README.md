# Keycloak API Manager - Test Suite

## Configuration (PropertiesManager Pattern)

The test suite uses **propertiesmanager** with the standard multi-file JSON pattern.

### File Structure

```
config/
├── default.json          # Base configuration (COMMITTED - public defaults)
├── local.json           # Local overrides (GIT-IGNORED - developer-specific)
├── secrets.json         # Sensitive data (GIT-IGNORED - credentials)
├── local.json.example   # Template for local.json
└── secrets.json.example # Template for secrets.json
```

### Priority Order (Highest to Lowest)

1. **Environment Variables**: `PM_KEYCLOAK_BASE_URL=...` 
2. **Command Line**: `--keycloak.baseUrl=...`
3. **config/secrets.json** (sensitive data - git-ignored)
4. **config/local.json** (local overrides - git-ignored)
5. **config/default.json** (defaults - committed)

### Setup

```bash
# Copy example files
cp config/local.json.example config/local.json
cp config/secrets.json.example config/secrets.json

# Edit for your environment
nano config/local.json
nano config/secrets.json
```

## Configuration Files

### `config/default.json` (Committed - Safe Defaults)

```json
{
  "production": {
    "keycloak": {
      "baseUrl": "http://localhost:8080",
      "realm": "master",
      "clientId": "admin-cli",
      "grantType": "password",
      "adminUsername": "admin",
      "adminPassword": "admin"
    }
  },
  "dev": { ... },
  "test": { ... }
}
```

### `config/local.json` (Git-Ignored - Local Overrides)

```json
{
  "production": {
    "keycloak": {
      "baseUrl": "http://your-docker-host:8080"
    }
  }
}
```

### `config/secrets.json` (Git-Ignored - Credentials)

```json
{
  "production": {
    "keycloak": {
      "adminPassword": "your-real-password",
      "clientSecret": "your-secret-uuid"
    }
  }
}
```

## Usage

### Default (Local Keycloak)

```bash
npm test
# Loads: default.json + local.json + secrets.json (production environment)
```

### Development Environment

```bash
NODE_ENV=dev npm test
# Loads dev configuration from all config files
```

### Test Environment

```bash
NODE_ENV=test npm test
# Loads test configuration from all config files
```

### Remote/Docker Keycloak

**Option 1: Via config/local.json (Recommended)**
```bash
# Edit config/local.json
{
  "production": {
    "keycloak": {
      "baseUrl": "http://your-docker-host:8080"
    }
  }
}

# Run tests
npm test
```

**Option 2: Via Environment Variable**
```bash
PM_KEYCLOAK_BASE_URL=http://your-docker-host:8080 npm test
```

**Option 3: Via Command Line**
```bash
npm test -- --keycloak.baseUrl=http://your-docker-host:8080
```

### Override Examples

```bash
# Override base URL only
npm test -- --keycloak.baseUrl=http://192.168.1.100:8080

# Override multiple properties  
npm test -- --keycloak.baseUrl=http://remote:8080 --keycloak.adminPassword=secret

# Use environment variables
PM_KEYCLOAK_BASE_URL=http://remote:8080 PM_KEYCLOAK_ADMIN_PASSWORD=secret npm test

# Run in dev mode with custom URL
NODE_ENV=dev npm test -- --keycloak.baseUrl=http://dev-server:8080
```

## Security Best Practices

✅ **DO:**
- Keep `config/local.json` and `config/secrets.json` in `.gitignore`
- Store sensitive data ONLY in `config/secrets.json`
- Use `config/default.json` for safe public defaults
- Use environment variables in CI/CD pipelines

❌ **DON'T:**
- Commit `config/local.json` or `config/secrets.json`
- Store production passwords in `config/default.json`
- Hardcode credentials in test files

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

## Test Output

```
📍 Keycloak Configuration (from propertiesmanager):
   Environment: production
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
- Verify `keycloak.baseUrl` in `config/local.json` or `config/default.json`
- Wait a few seconds for Keycloak to fully start

### Authentication Failed
- Verify credentials in `config/secrets.json` or `config/local.json`
- Check default admin user exists in Keycloak
- Ensure `admin-cli` client exists in realm

### Property Not Loading
- Check file exists and has correct JSON syntax
- Verify environment: `NODE_ENV=production|dev|test`
- Try CLI override to debug: `npm test -- --keycloak.baseUrl=http://test:8080`

### Tests Timeout
- Increase Mocha timeout in `.mocharc.json`
- Check network connectivity to Keycloak
- Review Keycloak logs: `docker compose logs keycloak`


