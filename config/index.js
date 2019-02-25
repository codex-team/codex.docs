/**
 * This module reads configuration file depending on NODE_ENV
 *
 * @type {module}
 */

const fs = require('fs');
const path = require('path');
const NODE_ENV = process.env.NODE_ENV || 'development';
const configPath = `./${NODE_ENV}.json`;
let config;

if (fs.existsSync(path.resolve(__dirname, configPath))) {
  config = require(configPath);
} else {
  config = {
    database: '.db',
    port: 3000,
    uploads: 'public/uploads'
  };
}

module.exports = config;
