const fs = require('fs');
const path = require('path');

function loadMatrix(name) {
  const filePath = path.join(__dirname, '..', 'matrix', `${name}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function uniqueName(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

module.exports = {
  loadMatrix,
  uniqueName,
};
