const {aliases: aliasesDb} = require('../utils/database/index');
const getHashFromString = require('../utils/hash');

/**
 * @typedef {Object} AliasData
 * @property {string} type - entity type
 * @property {string} hash - entity hash
 * @property {string} id - entity id
 *
 */

/**
 * @class Alias
 * @property {string} type - entity type
 * @property {string} id - entity title
 */
class Alias {
  /**
   * Find and return alias with given alias
   * @param {string} aliasName - alias of entity
   * @returns {Promise<Alias>}
   */
  static async get(aliasName) {
    const hash = getHashFromString(aliasName.slice(1)).toString();
    const data = await aliasesDb.findOne({hash});

    return new Alias(data);
  }

  /**
   * @constructor
   *
   * @param {AliasData} data
   */
  constructor(data = {}) {
    if (data === null) {
      data = {};
    }
    this.id = data.id;
    this.type = data.type;
    this.hash = data.hash;
  }
}

module.exports = Alias;
