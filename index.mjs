/**
 * ESM wrapper for keycloak-api-manager
 * This file provides ES Module support while the core is still CommonJS
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keycloakApiManager = require('./index.js');

export const configure = keycloakApiManager.configure;
export const setConfig = keycloakApiManager.setConfig;
export const getToken = keycloakApiManager.getToken;
export const auth = keycloakApiManager.auth;

export default keycloakApiManager;
