#!/usr/bin/env node

/**
 * Keycloak Container Setup Script
 * 
 * Prompts user to choose local or remote deployment and configures Keycloak accordingly.
 * 
 * Usage:
 *   npm run setup-keycloak
 *   node test/setup-keycloak.js
 * 
 * Features:
 *   - Interactive prompts for deployment location
 *   - Local deployment with HTTP or HTTPS support
 *   - Remote SSH deployment with automatic docker-compose copying
 *   - Certificate configuration for HTTPS mode
 */

const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function askDeploymentLocation() {
  log('\n=== Keycloak Container Deployment Setup ===\n', 'bright');
  log('Choose deployment location:', 'blue');
  log('  1) Local machine (localhost:8080)', 'yellow');
  log('  2) Remote machine via SSH', 'yellow');
  
  let choice;
  while (!['1', '2'].includes(choice)) {
    choice = await prompt('\nEnter choice (1 or 2): ');
    if (!['1', '2'].includes(choice)) {
      log('Invalid choice. Please enter 1 or 2.', 'red');
    }
  }
  
  return choice === '1' ? 'local' : 'remote';
}

async function askHttpsSetup() {
  log('\nEnable HTTPS?', 'blue');
  log('  1) No, use HTTP (development)', 'yellow');
  log('  2) Yes, use HTTPS (production-like)', 'yellow');
  
  let choice;
  while (!['1', '2'].includes(choice)) {
    choice = await prompt('\nEnter choice (1 or 2): ');
    if (!['1', '2'].includes(choice)) {
      log('Invalid choice. Please enter 1 or 2.', 'red');
    }
  }
  
  return choice === '2';
}

async function askRemoteDetails() {
  const host = await prompt('\nRemote host/IP (e.g., user@host.com): ');
  if (!host) {
    throw new Error('Host is required');
  }
  
  const deployPath = await prompt('Remote deployment path (e.g., /home/user/keycloak): ');
  if (!deployPath) {
    throw new Error('Deployment path is required');
  }
  
  return { host, deployPath };
}

async function askCertificatePath() {
  log('\nHTTPS requires certificate files.', 'blue');
  const certPath = await prompt('Certificate directory path (e.g., /home/smart/certs): ');
  
  if (!certPath) {
    throw new Error('Certificate path is required for HTTPS');
  }
  
  // Verify certificate files exist
  const certFile = path.join(certPath, 'keycloak.crt');
  const keyFile = path.join(certPath, 'keycloak.key');
  
  if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
    throw new Error(`Certificate files not found in ${certPath}\nExpected: keycloak.crt and keycloak.key`);
  }
  
  return certPath;
}

function executeCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn('bash', ['-c', command], {
      cwd: cwd || process.cwd(),
      stdio: 'inherit',
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${command}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

function execSync(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: cwd || process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

async function deployLocal(useHttps, certPath) {
  log('\n=== Local Deployment ===\n', 'bright');
  
  const dockerComposeDir = path.join(__dirname, '..');
  
  try {
    // Determine which compose file to use
    const composeFile = useHttps ? 'docker-compose-https.yml' : 'docker-compose.yml';
    const composeCmd = `docker-compose -f ${composeFile}`;
    
    if (useHttps) {
      log('Starting Keycloak with HTTPS...', 'blue');
      
      // Write .env file for HTTPS
      const envContent = `KEYCLOAK_CERT_PATH=${certPath}
KEYCLOAK_HOSTNAME=localhost
`;
      
      fs.writeFileSync(path.join(dockerComposeDir, '.env'), envContent);
      log('Created .env file with HTTPS configuration', 'green');
    } else {
      log('Starting Keycloak with HTTP...', 'blue');
      
      // Remove .env file for HTTP (use defaults)
      const envFilePath = path.join(dockerComposeDir, '.env');
      if (fs.existsSync(envFilePath)) {
        fs.unlinkSync(envFilePath);
      }
      log('Using default HTTP configuration', 'green');
    }
    
    // Stop any existing containers
    log('Stopping existing containers...', 'blue');
    try {
      await executeCommand(`${composeCmd} down 2>/dev/null || true`, dockerComposeDir);
    } catch (err) {
      // Ignore errors
    }
    
    // Start containers
    log(`Starting Keycloak with ${useHttps ? 'HTTPS' : 'HTTP'}...`, 'blue');
    await executeCommand(`${composeCmd} up -d`, dockerComposeDir);
    log(`\n✓ Keycloak is starting locally...`, 'green');
    
    log('\nWaiting for Keycloak to be ready...', 'blue');
    let ready = false;
    let attempts = 0;
    const maxAttempts = 60;
    
    // For HTTPS health check, we need to use -k flag to skip certificate validation
    const healthCheckProtocol = useHttps ? 'https' : 'http';
    
    while (!ready && attempts < maxAttempts) {
      try {
        // Health check always on localhost:8080 HTTP for simplicity
        const health = await execSync(`curl -s http://localhost:8080/health/ready 2>/dev/null`);
        if (health.includes('UP')) {
          ready = true;
        }
      } catch (err) {
        // Still waiting
      }
      
      if (!ready) {
        attempts++;
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (ready) {
      log('\n\n✓ Keycloak is ready!', 'green');
      log('\nAccess Keycloak:', 'bright');
      if (useHttps) {
        log(`  Admin Console: https://localhost:8443`, 'yellow');
        log(`  (self-signed cert - use -k with curl or add to browser exceptions)`, 'yellow');
      } else {
        log(`  Admin Console: http://localhost:8080`, 'yellow');
      }
      log('  Credentials: admin / admin', 'yellow');
    } else {
      log('\n\n⚠ Keycloak is taking longer than expected. Check Docker logs:', 'yellow');
      log(`  ${composeCmd} logs -f`, 'yellow');
    }
    
  } catch (err) {
    log(`\n✗ Error during local deployment: ${err.message}`, 'red');
    throw err;
  }
}

async function deployRemote(host, deployPath, useHttps, certPath) {
  log('\n=== Remote Deployment ===\n', 'bright');
  
  const dockerComposeDir = path.join(__dirname, '..');
  const dockerComposePath = path.join(dockerComposeDir, 'docker-compose.yml');
  const dockerComposeHttpsPath = path.join(dockerComposeDir, 'docker-compose-https.yml');
  
  try {
    // Verify SSH connection
    log(`Verifying SSH connection to ${host}...`, 'blue');
    await execSync(`ssh -o ConnectTimeout=5 ${host} 'echo OK'`);
    log('✓ SSH connection successful', 'green');
    
    // Create deployment directory on remote
    log(`Creating deployment directory on remote: ${deployPath}`, 'blue');
    await execSync(`ssh ${host} 'mkdir -p "${deployPath}"'`);
    log('✓ Directory created', 'green');
    
    // Copy docker-compose files to remote
    log('Copying docker-compose files to remote...', 'blue');
    await execSync(`scp "${dockerComposePath}" "${host}:${deployPath}/docker-compose.yml"`);
    await execSync(`scp "${dockerComposeHttpsPath}" "${host}:${deployPath}/docker-compose-https.yml"`);
    log('✓ docker-compose files copied', 'green');
    
    // Copy certificate files if HTTPS
    if (useHttps && certPath) {
      log('Copying certificate files to remote...', 'blue');
      const remoteDir = `${deployPath}/certs`;
      await execSync(`ssh ${host} 'mkdir -p "${remoteDir}"'`);
      
      const certFile = path.join(certPath, 'keycloak.crt');
      const keyFile = path.join(certPath, 'keycloak.key');
      
      await execSync(`scp "${certFile}" "${host}:${remoteDir}/"`);
      await execSync(`scp "${keyFile}" "${host}:${remoteDir}/"`);
      log('✓ Certificate files copied', 'green');
    }
    
    // Determine which compose file to use
    const composeFile = useHttps ? 'docker-compose-https.yml' : 'docker-compose.yml';
    const composeCmd = `docker-compose -f ${composeFile}`;
    
    // Create .env file on remote
    log('Creating configuration on remote...', 'blue');
    
    let envContent = '';
    const hostname = host.includes('@') ? host.split('@')[1] : host;
    
    if (useHttps) {
      envContent = `KEYCLOAK_CERT_PATH=${deployPath}/certs
KEYCLOAK_HOSTNAME=${hostname}
`;
    } else {
      envContent = `KEYCLOAK_HOSTNAME=${hostname}
`;
    }
    
    const envBase64 = Buffer.from(envContent).toString('base64');
    await execSync(`ssh ${host} 'echo "${envBase64}" | base64 -d > "${deployPath}/.env"'`);
    log('✓ Configuration created', 'green');
    
    // Stop any existing containers at the remote path
    log('Stopping existing containers...', 'blue');
    try {
      await execSync(`ssh ${host} 'cd "${deployPath}" && docker-compose -f docker-compose.yml down 2>/dev/null || docker-compose -f docker-compose-https.yml down 2>/dev/null || true'`);
    } catch (err) {
      // Ignore errors if containers don't exist
    }
    log('✓ Old containers stopped', 'green');
    
    // Start new containers
    log(`Starting Keycloak container with ${useHttps ? 'HTTPS' : 'HTTP'}...`, 'blue');
    await execSync(`ssh ${host} 'cd "${deployPath}" && ${composeCmd} up -d'`);
    log('✓ Keycloak container started', 'green');
    
    log('\nWaiting for Keycloak to be ready...', 'blue');
    let ready = false;
    let attempts = 0;
    const maxAttempts = 60;
    
    while (!ready && attempts < maxAttempts) {
      try {
        // Health check always uses HTTP on 8080 for simplicity
        const checkCmd = `ssh ${host} 'curl -s http://localhost:8080/health/ready 2>/dev/null'`;
        const health = await execSync(checkCmd);
        if (health.includes('UP')) {
          ready = true;
        }
      } catch (err) {
        // Still waiting
      }
      
      if (!ready) {
        attempts++;
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (ready) {
      log('\n\n✓ Keycloak is ready!', 'green');
      log('\nAccess Keycloak:', 'bright');
      if (useHttps) {
        log(`  Admin Console: https://${hostname}:8443`, 'yellow');
        log(`  (self-signed cert - use -k with curl or add to browser exceptions)`, 'yellow');
      } else {
        log(`  Admin Console: http://${hostname}:8080`, 'yellow');
      }
      log('  Credentials: admin / admin', 'yellow');
      log(`\nDeployed at: ${host}:${deployPath}`, 'yellow');
    } else {
      log('\n\n⚠ Keycloak is taking longer than expected. Logs:', 'yellow');
      log(`  ssh ${host} 'cd ${deployPath} && ${composeCmd} logs -f'`, 'yellow');
    }
    
  } catch (err) {
    log(`\n✗ Error during remote deployment: ${err.message}`, 'red');
    throw err;
  }
}

async function main() {
  try {
    const deployLocation = await askDeploymentLocation();
    const useHttps = await askHttpsSetup();
    
    let certPath = null;
    if (useHttps) {
      certPath = await askCertificatePath();
    }
    
    if (deployLocation === 'local') {
      await deployLocal(useHttps, certPath);
    } else {
      const { host, deployPath } = await askRemoteDetails();
      await deployRemote(host, deployPath, useHttps, certPath);
    }
    
    log('\n✓ Deployment complete!\n', 'green');
    
  } catch (err) {
    log(`\nSetup failed: ${err.message}\n`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
