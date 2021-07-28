import fs from 'fs';
import path from 'path';
import config from 'config';

const rcPath = path.resolve(__dirname, '../../', config.get('rcFile') || './.codexdocsrc');

interface RConfig {
  [key: string]: any;
}

/**
 * @typedef {object} RCData
 * @property {string} title - website title
 * @property {object[]} menu - options for website menu
 * @property {string} menu[].title - menu option title
 * @property {string} menu[].uri - menu option href
 */

/**
 * @class RCParser
 * @classdesc Class to parse runtime configuration file for CodeX Docs engine
 */
export default class RCParser {
  /**
   *  Default CodeX Docs configuration
   *
   * @static
   * @returns {{title: string, menu: Array}}
   */
  public static get DEFAULTS():RConfig {
    return {
      title: 'CodeX Docs',
      menu: [],
    } as RConfig;
  }

  /**
   * Find and parse runtime configuration file
   *
   * @static
   * @returns {{title: string, menu: []}}
   */
  public static getConfiguration(): RConfig {
    if (!fs.existsSync(rcPath)) {
      return RCParser.DEFAULTS;
    }

    const file = fs.readFileSync(rcPath, 'utf-8');
    const rConfig = RCParser.DEFAULTS;
    let userConfig;

    try {
      userConfig = JSON.parse(file);
    } catch (e) {
      console.log('CodeX Docs rc file should be in JSON format.');

      return RCParser.DEFAULTS;
    }

    for (const option in userConfig) {
      if (Object.prototype.hasOwnProperty.call(userConfig, option)) {
        rConfig[option] = userConfig[option] || RCParser.DEFAULTS[option] || undefined;
      }
    }

    if (!(rConfig.menu instanceof Array)) {
      console.log('Menu section in the rc file must be an array.');
      rConfig.menu = RCParser.DEFAULTS.menu;
    }

    rConfig.menu = rConfig.menu.filter((option: any, i:number) => {
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

    rConfig.menu = rConfig.menu.map((option: any) => {
      if (typeof option === 'string') {
        return {
          title: option,
          /* Replace all non alpha- and numeric-symbols with '-' */
          uri: '/' + option.toLowerCase().replace(/[ -/:-@[-`{-~]+/, '-'),
        };
      }

      return option;
    });

    return rConfig;
  }
}
