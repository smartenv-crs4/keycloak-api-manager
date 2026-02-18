const { expect } = require('chai');
const { spawn } = require('child_process');
const path = require('path');

describe('Live Configure (client_credentials)', function () {
  this.timeout(90000);

  const shouldRunLive = process.env.RUN_LIVE_CLIENT_CREDENTIALS_TEST === 'true';
  const requiredEnv = [
    'LIVE_KC_BASE_URL',
    'LIVE_KC_REALM',
    'LIVE_KC_CLIENT_ID',
    'LIVE_KC_CLIENT_SECRET',
  ];

  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  const testFn = shouldRunLive ? it : it.skip;

  testFn('should configure KeycloakManager against a real Keycloak using client_credentials', function (done) {
    if (missingEnv.length > 0) {
      return done(
        new Error(
          `Missing required env vars for live test: ${missingEnv.join(', ')}`
        )
      );
    }

    const projectRoot = path.resolve(__dirname, '..', '..');

    const script = `
      const KeycloakManager = require('./index.js');
      (async () => {
        try {
          await KeycloakManager.configure({
            baseUrl: process.env.LIVE_KC_BASE_URL,
            realmName: process.env.LIVE_KC_REALM,
            grantType: 'client_credentials',
            clientId: process.env.LIVE_KC_CLIENT_ID,
            clientSecret: process.env.LIVE_KC_CLIENT_SECRET,
            tokenLifeSpan: 120,
          });

          const token = KeycloakManager.getToken();
          if (!token || !token.accessToken) {
            throw new Error('No access token returned by getToken()');
          }

          console.log('LIVE_CONFIGURE_OK');
          process.exit(0);
        } catch (err) {
          console.error('LIVE_CONFIGURE_FAIL', err && err.message ? err.message : err);
          process.exit(1);
        }
      })();
    `;

    const child = spawn(process.execPath, ['-e', script], {
      cwd: projectRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      try {
        expect(code, `stdout:\n${stdout}\nstderr:\n${stderr}`).to.equal(0);
        expect(stdout).to.include('LIVE_CONFIGURE_OK');
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
