const {aliases: aliasesDb} = require('../utils/database/index');
const getHashFromString = require('../utils/hash');

/**
 * @typedef {Object} AliasData
 * @property {string} _id - alias id
 * @property {string} hash - alias hash
 * @property {string} type - entity type
 * @property {string} id - entity id
 *
 */

/**
 * @class Alias
 * @property {string} _id - alias id
 * @property {string} hash - alias hash
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
    const hash = getHashFromString(aliasName).toString();
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
    if (data._id) {
      this._id = data._id;
    }
    this.id = data.id;
    this.type = data.type;
    this.hash = data.hash;
  }

  /**
   * Save or update page data in the database
   *
   * @returns {Promise<Alias>}
   */
  async save() {
    if (!this._id) {
      const insertedRow = await aliasesDb.insert({id: this.id, type: this.type, hash: this.hash});
    } else {
      await aliasesDb.update({_id: this._id}, this.data);
    }

    return this;
  }
}

module.exports = Alias;
