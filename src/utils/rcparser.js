const fs = require('fs');
const path = require('path');
const config = require('../../config');
const rcPath = path.resolve(__dirname, '../../', config.rcFile || './.codexdocsrc');

/**
 * @typedef {Object} RCData
 * @property {string} title - website title
 * @property {object[]} menu - options for website menu
 * @property {string} menu[].title - menu option title
 * @property {string} menu[].uri - menu option href
 */

/**
 * @class RCParser
 * @classdesc Class to parse runtime configuration file for CodeX Docs engine
 */
module.exports = class RCParser {
  /**
   *  Default CodeX Docs configuration
   *
   * @static
   * @return {{title: string, menu: Array}}
   */
  static get DEFAULTS() {
    return {
      title: 'CodeX Docs',
      menu: []
    };
  }

  /**
   * Find and parse runtime configuration file
   *
   * @static
   * @return {{title: string, menu: []}}
   */
  static getConfiguration() {
    if (!fs.existsSync(rcPath)) {
      return RCParser.DEFAULTS;
    }

    const file = fs.readFileSync(rcPath, { encoding: 'UTF-8' });
    const rConfig = RCParser.DEFAULTS;
    let userConfig;

    try {
      userConfig = JSON.parse(file);
    } catch (e) {
      console.log('CodeX Docs rc file should be in JSON format.');
      return RCParser.DEFAULTS;
    }

    for (let option in userConfig) {
      if (userConfig.hasOwnProperty(option)) {
        rConfig[option] = userConfig[option] || RCParser.DEFAULTS[option] || undefined;
      }
    }

    if (!(rConfig.menu instanceof Array)) {
      console.log('Menu section in the rc file must be an array.');
      rConfig.menu = RCParser.DEFAULTS.menu;
    }

    rConfig.menu = rConfig.menu.filter((option, i) => {
      i = i + 1;
      if (typeof option === 'string') {
        return true;
      }

      if (!option || option instanceof Array || typeof option !== 'object') {
        console.log(`Menu option #${i} in rc file must be a string or an object`);
        return false;
      }

      const { title, uri } = option;

      if (!title || typeof title !== 'string') {
        console.log(`Menu option #${i} title must be a string.`);
        return false;
      }

      if (!uri || typeof uri !== 'string') {
        console.log(`Menu option #${i} uri must be a string.`);
        return false;
      }

      return true;
    });

    rConfig.menu = rConfig.menu.map(option => {
      if (typeof option === 'string') {
        return {
          title: option,
          /* Replace all non alpha- and numeric-symbols with '-' */
          uri: '/' + option.toLowerCase().replace(/[ -/:-@[-`{-~]+/, '-')
        };
      }

      return option;
    });

    return rConfig;
  }
};
