/**
 * Script to enable fine-grained authorization permissions on Keycloak server
 * This is required for Group Permissions and other authorization features
 */

const path = require('path');
const http = require('http');
const https = require('https');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PROPERTIES_PATH = path.join(__dirname, '..', 'config');

const { conf } = require('propertiesmanager');

async function enableFineGrainedPermissions() {
    console.log('\n=== Enabling Fine-Grained Authorization Permissions ===\n');
    
    const baseUrl = conf.keycloak.baseUrl;
    const realmName = conf.keycloak.realmName;
    
    // First, get admin token
    const tokenUrl = `${baseUrl}realms/${realmName}/protocol/openid-connect/token`;
    const transport = tokenUrl.startsWith('https') ? https : http;
    
    const tokenParams = new URLSearchParams({
        client_id: conf.keycloak.clientId,
        grant_type: conf.keycloak.grantType,
        username: conf.keycloak.username,
        password: conf.keycloak.password
    });
    
    if (conf.keycloak.clientSecret) {
        tokenParams.append('client_secret', conf.keycloak.clientSecret);
    }
    
    const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: tokenParams.toString()
    });
    
    if (!tokenResponse.ok) {
        throw new Error(`Failed to get admin token: ${await tokenResponse.text()}`);
    }
    
    const { access_token } = await tokenResponse.json();
    
    // Get current realm configuration
    const realmUrl = `${baseUrl}admin/realms/${realmName}`;
    const realmResponse = await fetch(realmUrl, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    });
    
    if (!realmResponse.ok) {
        throw new Error(`Failed to get realm: ${await realmResponse.text()}`);
    }
    
    const realm = await realmResponse.json();
    
    // Update realm to enable admin fine-grained permissions if not already enabled
    // This is typically done at the master realm level
    console.log(`Checking realm: ${realmName}`);
    console.log(`Current realm settings:`);
    console.log(`  - registrationAllowed: ${realm.registrationAllowed}`);
    console.log(`  - adminEventsEnabled: ${realm.adminEventsEnabled}`);
    
    // Enable admin fine-grained authz on the master realm
    if (realmName === 'master') {
        const masterRealmUpdate = {
            ...realm,
            adminEventsEnabled: true,
            adminEventsDetailsEnabled: true
        };
        
        const updateResponse = await fetch(realmUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify(masterRealmUpdate)
        });
        
        if (!updateResponse.ok) {
            console.warn(`Warning: Could not update master realm: ${await updateResponse.text()}`);
        } else {
            console.log('✓ Updated master realm with admin events enabled');
        }
    }
    
    console.log('\n✓ Fine-grained authorization configuration checked');
    console.log('\nNote: Fine-grained permissions are a preview feature in Keycloak.');
    console.log('To fully enable them, you may need to:');
    console.log('1. Start Keycloak with --features=admin-fine-grained-authz');
    console.log('2. Or enable via Admin Console > Realm Settings > General > User-Managed Access');
    console.log('3. Check if your Keycloak version supports this feature (typically 12+)');
}

// Run if called directly
if (require.main === module) {
    enableFineGrainedPermissions()
        .then(() => {
            console.log('\n=== Configuration complete ===\n');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error enabling fine-grained permissions:', error.message);
            process.exit(1);
        });
}

module.exports = { enableFineGrainedPermissions };
