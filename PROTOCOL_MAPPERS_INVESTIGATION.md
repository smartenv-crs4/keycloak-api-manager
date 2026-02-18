# Protocol Mappers - Investigation Results

## Summary  
**Direct Protocol Mapper API calls work perfectly!**

## Findings

### ✅ Test 1: Direct curl via SSH tunnel
- **Method**: Direct HTTP POST via curl through SSH tunnel (127.0.0.1:9998)
- **Result**: **HTTP 201 SUCCESS**
- **Payload**: Valid oidc-usermodel-attribute-mapper
- **Conclusion**: Tunnel works, API works!

### ✅ Test 2: Direct curl on remote server  
- **Method**: SSH into server, curl directly to 127.0.0.1:8080
- **Result**: **HTTP 201 SUCCESS**
- **Payload**: Same as Test 1
- **Conclusion**: Server API works perfectly!

### ❌ Test 3: Via keycloak-api-manager library
- **Method**: Using keycloakManager.clients.addProtocolMapper()
- **Result**: **"ProtocolMapper provider not found" ERROR**
- **HTTP Status**: (error happens before HTTP response)
- **Conclusion**: **Problem is in the client library, NOT in Keycloak!**

## Root Cause Analysis

The issue is NOT:
- ❌ SSL/TLS certificates
- ❌ SSH tunnel configuration
- ❌ Keycloak server configuration
- ❌ Network connectivity

The issue IS likely:
- ✅ @keycloak/keycloak-admin-client library version
- ✅ How the client library serializes the request
- ✅ Possible bug in client library with protocol mapper creation

## Current Library Version

```json
{
  "name": "keycloak-api-manager",
  "dependencies": {
    "@keycloak/keycloak-admin-client": "^20.0.0"  // Check actual version
  }
}
```

## Recommendations

1. **Update @keycloak/keycloak-admin-client** to latest version
2. **Check** if there are known bugs with protocol mapper on clients (vs client scopes)
3. **Consider** implementing direct HTTP calls for protocol mapper operations if library issue can't be resolved
4. **Document** that ClientScopes protocol mappers work fine (proven by passing tests)

## Test Status
- ✅ 59 tests passing
- ✅ Protocol mappers work for ClientScopes (direct evidence)
- ❌ Protocol mappers fail for Clients via library (but work via direct API)
- ❌ 8 tests pending (legitimate reasons - see PENDING_TESTS.md)

## Next Steps
1. Check `package-lock.json` for exact client library version
2. Check GitHub issues for @keycloak/keycloak-admin-client  
3. Test with latest version of client library
4. If not resolved: Use direct HTTP wrapper for problematic operations
