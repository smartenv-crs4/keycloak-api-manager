/**
 * HTTP API Helper Module
 * 
 * Provides direct HTTP calls to Keycloak Admin API
 * Used when @keycloak/keycloak-admin-client has limitations
 */

const http = require('http');
const https = require('https');
const { conf } = require('propertiesmanager');

/**
 * Make a direct HTTP request to Keycloak API
 * @param {string} token - Bearer token
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} path - API path (e.g., /admin/realms/realm-name/clients/id)
 * @param {object} body - Request body (optional)
 * @returns {Promise<object>} Response data
 */
async function makeRequest(token, method, path, body = null) {
  const keycloakConfig = (conf && conf.keycloak) || {};
  const baseUrl = keycloakConfig.baseUrl;

  if (!baseUrl) {
    throw new Error('Keycloak baseUrl not configured');
  }

  const url = new URL(path, baseUrl);
  const transport = url.protocol === 'https:' ? https : http;
  const payload = body ? JSON.stringify(body) : null;

  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
    },
  };

  return new Promise((resolve, reject) => {
    const req = transport.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const result = data ? JSON.parse(data) : null;
            resolve(result);
          } else {
            let errorData = {};
            try {
              errorData = JSON.parse(data);
            } catch {
              errorData = { message: data };
            }

            const error = new Error(
              errorData.error_description || 
              errorData.message || 
              `HTTP ${res.statusCode}`
            );
            error.statusCode = res.statusCode;
            error.response = errorData;
            reject(error);
          }
        } catch (parseErr) {
          reject(parseErr);
        }
      });
    });

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

module.exports = {
  makeRequest,
};
