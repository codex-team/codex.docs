import fs from 'fs';
import path from 'path';
import config from 'config';
import { fileURLToPath } from 'url';

/**
 * The __dirname CommonJS variables are not available in ES modules.
 * https://nodejs.org/api/esm.html#no-__filename-or-__dirname
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rcPath = path.resolve(__dirname, '../../../', config.get('rcFile') || './.codexdocsrc');

/**
 * @typedef {object} menu
 * @property {string} title - menu option title
 * @property {string} uri - menu option href
 */
interface Menu {
  title: string;
  uri: string;
  [key: string]: string;
}

/**
 * @typedef {object} RCData
 * @property {string} title - website title
 * @property {Menu[]} menu - options for website menu
 */
interface RCData {
  title: string;
  menu: Menu[];
  [key: string]: string | Menu[];
}

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
  public static get DEFAULTS():RCData {
    return {
      title: 'CodeX Docs',
      menu: [],
    };
  }

  /**
   * Find and parse runtime configuration file
   *
   * @static
   * @returns {{title: string, menu: []}}
   */
  public static getConfiguration(): RCData {
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

    rConfig.menu = rConfig.menu.filter((option: string | Menu, i:number) => {
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

    rConfig.menu = rConfig.menu.map((option: string | Menu) => {
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
