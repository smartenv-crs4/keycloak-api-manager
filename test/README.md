# Keycloak API Manager - Test Suite

## Configuration (PropertiesManager Pattern)

The test suite uses **propertiesmanager** with the standard multi-file JSON pattern.

### File Structure

```
test/
├── package.json            # Test dependencies (mocha, chai, dockerode, propertiesmanager)
├── .mocharc.json           # Mocha configuration
├── config/                 # Test configuration files
│   ├── default.json        # Base configuration (COMMITTED - public defaults)
│   ├── local.json          # Local overrides (GIT-IGNORED - developer-specific)
│   ├── secrets.json        # Sensitive data (GIT-IGNORED - credentials)
│   ├── local.json.example  # Template for local.json
│   └── secrets.json.example # Template for secrets.json
├── helpers/                # Test utilities and setup
│   ├── config.js           # Keycloak config loader
│   ├── docker-helpers.js   # Docker container management
│   └── setup.js            # Mocha root hooks (beforeAll/afterAll)
└── specs/                  # Test specifications
    ├── realms.test.js
    ├── users.test.js
    ├── clients.test.js
    ├── roles.test.js
    └── ...
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
cp test/config/local.json.example test/config/local.json
cp test/config/secrets.json.example test/config/secrets.json

# Edit for your environment
nano test/config/local.json
nano test/config/secrets.json
```

## Configuration Files

### `test/config/default.json` (Committed - Safe Defaults)

```json
{
  "test": {
    "keycloak": {
      "baseUrl": "http://localhost:8080",
      "realm": "master",
      "clientId": "admin-cli",
      "grantType": "password",
      "adminUsername": "admin",
      "adminPassword": "admin"
    }
  }
}
```

### `test/config/local.json` (Git-Ignored - Local Overrides)

```json
{
  "test": {
    "keycloak": {
      "baseUrl": "http://your-docker-host:8080"
    }
  }
}
```

### `test/config/secrets.json` (Git-Ignored - Credentials)

```json
{
  "test": {
    "keycloak": {
      "adminPassword": "your-real-password"
    }
  }
}
```

## Usage

### Default (Local Docker Keycloak)

```bash
npm test
# Automatically starts Docker, creates local.json from container, runs tests
```

### Remote Keycloak (Skip Docker)

If Keycloak is running on a remote server (e.g., `http://smart-dell-sml.crs4.it:8080`):

**Step 1: Create configuration files**

```bash
# test/config/local.json
{
  "test": {
    "keycloak": {
      "baseUrl": "http://smart-dell-sml.crs4.it:8080"
    }
  }
}

# test/config/secrets.json (if using different credentials)
{
  "test": {
    "keycloak": {
      "adminPassword": "your-admin-password"
    }
  }
}
```

**Step 2: Run tests with remote flag**

```bash
USE_REMOTE_KEYCLOAK=true npm test
```

This skips Docker startup and uses your manually configured files.

### Override Examples

**Option 1: Via test/config/local.json (Recommended)**
```bash
# Already created above, just run:
USE_REMOTE_KEYCLOAK=true npm test
```

**Option 2: Via Environment Variable**
```bash
PM_KEYCLOAK_BASE_URL=http://your-docker-host:8080 npm test
```

**Option 3: Via Command Line**
```bash
npm test -- --keycloak.baseUrl=http://your-docker-host:8080
```

### Remote Docker via SSH (Automatic Management)

If you want **npm test** to automatically start/stop Docker Compose on a remote server via SSH:

**Prerequisites:**
- SSH access to remote host
- Docker Compose installed on remote host
- `keycloak-docker/` directory on remote host with docker-compose.yml
- `jq` command available on remote host (for JSON parsing)

**Step 1: Verify remote Docker setup**

```bash
# Test SSH access
ssh user@remote-host "docker ps"

# Verify docker-compose available
ssh user@remote-host "cd keycloak-docker && docker compose ps"

# Verify jq available
ssh user@remote-host "jq --version"
```

**Step 2: Set SSH environment variables**

```bash
# Run tests with automatic remote Docker management
DOCKER_SSH_HOST=smart-dell-sml.crs4.it DOCKER_SSH_USER=your-username npm test
```

**What happens automatically:**
1. ✅ SSH to remote host and run `docker compose up -d` in `keycloak-docker/` directory
2. ✅ Wait for container health check status via SSH
3. ✅ Query remote Docker for port mappings and credentials via `docker inspect`
4. ✅ Generate `test/config/local.json` with correct remote URL
5. ✅ Run all tests against remote Keycloak
6. ✅ SSH to remote host and run `docker compose down --volumes` for cleanup

**Environment Variables:**
- `DOCKER_SSH_HOST`: Remote server hostname (e.g., `smart-dell-sml.crs4.it`)
- `DOCKER_SSH_USER`: SSH username (defaults to local `$USER`)

**Example Flow:**

```bash
# Terminal output
DOCKER_SSH_HOST=smart-dell-sml.crs4.it npm test

# Output:
========== TEST SETUP ==========
📡 Starting Docker Compose on remote host...
🔗 Remote SSH: your-username@smart-dell-sml.crs4.it
✓ Docker Compose services started on remote host

📡 Reading Keycloak config from remote Docker...
✓ Updated local.json with remote Docker config:
  Base URL: http://smart-dell-sml.crs4.it:8080
  Admin User: admin

✓ Keycloak admin client initialized
✓ Test realm 'test-realm' created
✓ Test environment ready

  148 passing (15.2s)

========== TEST TEARDOWN ==========
📡 Stopping Docker Compose on remote host...
✓ Docker Compose services stopped on remote host
✓ Test environment cleaned up
```

**Troubleshooting Remote SSH:**

- **"Permission denied"**: Check SSH key authentication or try `DOCKER_SSH_USER=your-actual-username npm test`
- **"command not found: jq"**: Install jq on remote host: `sudo apt-get install jq`
- **"docker: command not found"**: Install Docker on remote host
- **Connection timeout**: Check firewall allows SSH (port 22) and Keycloak port
- **Container not found**: Ensure `keycloak-docker/` directory structure exists on remote host with running container named "keycloak"

### Override Examples

```bash
# Override base URL only
npm test -- --keycloak.baseUrl=http://192.168.1.100:8080

# Override multiple properties  
npm test -- --keycloak.baseUrl=http://remote:8080 --keycloak.adminPassword=secret

# Use environment variables
PM_KEYCLOAK_BASE_URL=http://remote:8080 PM_KEYCLOAK_ADMIN_PASSWORD=secret npm test
```

## Security Best Practices

✅ **DO:**
- Keep `test/config/local.json` and `test/config/secrets.json` in `.gitignore`
- Store sensitive data ONLY in `test/config/secrets.json`
- Use `test/config/default.json` for safe public defaults
- Use environment variables in CI/CD pipelines

❌ **DON'T:**
- Commit `test/config/local.json` or `test/config/secrets.json`
- Store production passwords in `test/config/default.json`
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
   Environment: test
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
- Verify `keycloak.baseUrl` in `test/config/local.json` or `test/config/default.json`
- Wait a few seconds for Keycloak to fully start

### Authentication Failed
- Verify credentials in `test/config/secrets.json` or `test/config/local.json`
- Check default admin user exists in Keycloak
- Ensure `admin-cli` client exists in realm

### Property Not Loading
- Check file exists and has correct JSON syntax
- Verify environment is "test" (default)
- Try CLI override to debug: `npm test -- --keycloak.baseUrl=http://test:8080`

### Tests Timeout
- Increase Mocha timeout in `.mocharc.json`
- Check network connectivity to Keycloak
- Review Keycloak logs: `docker compose logs keycloak`


