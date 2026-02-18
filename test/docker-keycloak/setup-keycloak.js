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

// Detect docker compose command (docker-compose or docker compose)
function getDockerComposeCmdSync() {
  try {
    require('child_process').execSync('docker-compose --version', { stdio: 'ignore' });
    return 'docker-compose';
  } catch (err) {
    try {
      require('child_process').execSync('docker compose version', { stdio: 'ignore' });
      return 'docker compose';
    } catch (err2) {
      return null; // Docker not available
    }
  }
}

let DOCKER_COMPOSE_CMD = getDockerComposeCmdSync();

let rl;

function initReadline() {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: process.stdin.isTTY
    });
  }
  return rl;
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function prompt(question) {
  return new Promise((resolve) => {
    const interface = initReadline();
    interface.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function askDeploymentLocation() {
  log('\n=== Keycloak Container Deployment Setup ===\n', 'bright');
  log('Choose deployment location:', 'blue');
  
  const dockerAvailable = DOCKER_COMPOSE_CMD !== null;
  
  if (dockerAvailable) {
    log('  1) Local machine (localhost:8080)', 'yellow');
    log('  2) Remote machine via SSH', 'yellow');
  } else {
    log('  ⚠ Docker not available locally', 'yellow');
    log('  → Deploying to remote machine via SSH', 'yellow');
    return 'remote';
  }
  
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
  log('\nRemote Deployment Target', 'blue');
  log('  Specify the user and machine where Keycloak will be deployed:', 'yellow');
  log('  Format: username@hostname', 'yellow');
  log('  Example: smart@smart-dell-sml.crs4.it', 'yellow');
  
  const host = await prompt('\nRemote host/IP (user@hostname): ');
  if (!host) {
    throw new Error('Host is required');
  }
  
  return { host };
}

async function askCertificatePath(isRemote = false) {
  log('\nHTTPS requires certificate files.', 'blue');
  
  // Check for default certificate files in test/docker-keycloak/certs
  const defaultCertPath = path.join(__dirname, 'certs');
  const defaultCertFile = path.join(defaultCertPath, 'keycloak.crt');
  const defaultKeyFile = path.join(defaultCertPath, 'keycloak.key');
  
  // If default certificates exist and we're deploying locally, use them automatically
  if (!isRemote && fs.existsSync(defaultCertFile) && fs.existsSync(defaultKeyFile)) {
    log(`✓ Found default certificates in ${defaultCertPath}`, 'green');
    return { localPath: defaultCertPath, remotePath: null };
  }
  
  // If not found and deploying locally, ask user
  if (!isRemote) {
    log(`  Default location: ${defaultCertPath}`, 'yellow');
    log('  Certificate files needed: keycloak.crt and keycloak.key', 'yellow');
  }
  
  // For remote deployments, ask if certificates are already on remote
  if (isRemote) {
    log('  Certificates can be:', 'yellow');
    log('    1) Already on the remote server (we will use them there)', 'yellow');
    log('    2) On this local machine (we will copy them to remote)', 'yellow');
    
    let certLocation;
    while (!['1', '2'].includes(certLocation)) {
      certLocation = await prompt('\nCertificate location (1=remote, 2=local): ');
      if (!['1', '2'].includes(certLocation)) {
        log('Invalid choice. Please enter 1 or 2.', 'red');
      }
    }
    
    if (certLocation === '1') {
      // Certificates already on remote
      const remoteCertPath = await prompt('Certificate directory path on remote server: ');
      if (!remoteCertPath) {
        throw new Error('Remote certificate path is required');
      }
      return { localPath: null, remotePath: remoteCertPath };
    } else {
      // Certificates on local machine - need to copy them
      const localCertPath = await prompt('Certificate directory path local (or press Enter for default): ');
      const certPath = localCertPath || defaultCertPath;
      
      // Verify local certificates exist
      const certFile = path.join(certPath, 'keycloak.crt');
      const keyFile = path.join(certPath, 'keycloak.key');
      
      if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
        throw new Error(`Certificate files not found in ${certPath}\nExpected: keycloak.crt and keycloak.key`);
      }
      
      return { localPath: certPath, remotePath: null };
    }
  }
  
  // Local deployment - ask for custom path if default not used
  const certPath = await prompt('Certificate directory path (or press Enter for default): ');
  
  // Use default if user just pressed Enter
  if (!certPath) {
    if (fs.existsSync(defaultCertFile) && fs.existsSync(defaultKeyFile)) {
      log(`✓ Using default certificates from ${defaultCertPath}`, 'green');
      return { localPath: defaultCertPath, remotePath: null };
    }
    throw new Error('Certificate path is required for HTTPS');
  }
  
  // Verify local certificate files
  const certFile = path.join(certPath, 'keycloak.crt');
  const keyFile = path.join(certPath, 'keycloak.key');
  
  if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
    throw new Error(`Certificate files not found in ${certPath}\nExpected: keycloak.crt and keycloak.key`);
  }
  
  return { localPath: certPath, remotePath: null };
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
    const options = {};
    if (cwd) {
      options.cwd = cwd;
    }
    exec(command, options, (error, stdout, stderr) => {
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
  
  const dockerComposeDir = __dirname;
  
  try {
    // Determine which compose file to use
    const composeFile = useHttps ? 'docker-compose-https.yml' : 'docker-compose.yml';
    const composeCmd = `docker-compose -f ${composeFile}`;
    
    if (useHttps) {
      log('Starting Keycloak with HTTPS...', 'blue');
      
      // Write .env file for HTTPS
      const finalCertPath = certPath && certPath.localPath ? certPath.localPath : certPath;
      const envContent = `KEYCLOAK_CERT_PATH=${finalCertPath}
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
  
  const dockerComposeDir = __dirname;
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
    
    // Copy certificate files if HTTPS and certificates are on local machine
    if (useHttps && certPath && certPath.localPath) {
      log('Copying certificate files to remote...', 'blue');
      const remoteDir = `${deployPath}/certs`;
      await execSync(`ssh ${host} 'mkdir -p "${remoteDir}"'`);
      
      const certFile = path.join(certPath.localPath, 'keycloak.crt');
      const keyFile = path.join(certPath.localPath, 'keycloak.key');
      
      await execSync(`scp "${certFile}" "${host}:${remoteDir}/"`);
      await execSync(`scp "${keyFile}" "${host}:${remoteDir}/"`);
      log('✓ Certificate files copied', 'green');
    }
    
    // Determine which compose file to use
    const composeFile = useHttps ? 'docker-compose-https.yml' : 'docker-compose.yml';
    const composeCmd = DOCKER_COMPOSE_CMD ? `${DOCKER_COMPOSE_CMD} -f ${composeFile}` : `docker compose -f ${composeFile}`;
    
    // Create .env file on remote
    log('Creating configuration on remote...', 'blue');
    
    let envContent = '';
    const hostname = host.includes('@') ? host.split('@')[1] : host;
    
    if (useHttps) {
      // Use remotePath if certificates are already on server, otherwise use copied path
      const certPathForEnv = certPath.remotePath || `${deployPath}/certs`;
      envContent = `KEYCLOAK_CERT_PATH=${certPathForEnv}
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
      await execSync(`ssh ${host} 'cd "${deployPath}" && ${DOCKER_COMPOSE_CMD} -f docker-compose.yml down 2>/dev/null || ${DOCKER_COMPOSE_CMD} -f docker-compose-https.yml down 2>/dev/null || true'`);
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
      // For remote deployments, certificate path doesn't need to exist locally yet
      const isRemote = deployLocation === 'remote';
      certPath = await askCertificatePath(isRemote);
    }
    
    if (deployLocation === 'local') {
      await deployLocal(useHttps, certPath);
    } else {
      const { host } = await askRemoteDetails();
      
      // Extract username from host (format: user@host or just host)
      let username = 'root';
      if (host.includes('@')) {
        username = host.split('@')[0];
      }
      
      // Automatically create deployment path: /home/<username>/docker-keycloak-api-manager-test
      const deployPath = `/home/${username}/docker-keycloak-api-manager-test`;
      log(`\n✓ Deployment path: ${deployPath}`, 'green');
      
      await deployRemote(host, deployPath, useHttps, certPath);
    }
    
    log('\n✓ Deployment complete!\n', 'green');
    
  } catch (err) {
    log(`\nSetup failed: ${err.message}\n`, 'red');
    process.exit(1);
  } finally {
    if (rl) {
      rl.close();
    }
  }
}

main();
