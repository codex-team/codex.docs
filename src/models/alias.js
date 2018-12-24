const {aliases: aliasesDb} = require('../utils/database/index');
const md5 = require('../utils/md5');
/**
 * @typedef {Object} AliasData
 * @property {string} _id - alias id
 * @property {string} hash - alias hash
 * @property {string} type - entity type
 * @property {boolean} deprecated - indicate if alias deprecated
 * @property {string} id - entity id
 *
 */

/**
 * @class Alias
 * @property {string} _id - alias id
 * @property {string} hash - alias hash
 * @property {string} type - entity type
 * @property {boolean} deprecated - indicate if alias deprecated
 * @property {string} id - entity title
 */
class Alias {
  /**
   * Find and return alias with given alias
   * @param {string} aliasName - alias of entity
   * @returns {Promise<Alias>}
   */
  static async get(aliasName) {
    const hash = md5(aliasName);
    let data = await aliasesDb.findOne({hash: hash, deprecated: false});

    if (!data) {
      data = await aliasesDb.findOne({hash: hash});
    }

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
    this.data = data;
  }

  /**
   * Save or update alias data in the database
   *
   * @returns {Promise<Alias>}
   */
  async save() {
    if (!this._id) {
      const insertedRow = await aliasesDb.insert(this.data);
    } else {
      await aliasesDb.update({_id: this._id}, this.data);
    }

    return this;
  }

  /**
   * Set AliasData object fields to internal model fields
   *
   * @param {AliasData} aliasData
   */
  set data(aliasData) {
    const {id, type, hash, deprecated} = aliasData;

    this.id = id || this.id;
    this.type = type || this.type;
    this.hash = hash || this.hash;
    this.deprecated = deprecated || false;
  }

  /**
   * Return AliasData object
   *
   * @returns {AliasData}
   */
  get data() {
    return {
      _id: this._id,
      id: this.id,
      type: this.type,
      hash: this.hash,
      deprecated: this.deprecated
    };
  }

  /**
   * Mark alias as deprecated
   * @param {string} aliasName - alias of entity
   * @returns {Promise<Alias>}
   */
  static async markAsDeprecated(aliasName) {
    const alias = await Alias.get(aliasName);

    alias.deprecated = true;

    return alias.save();
  }
}

module.exports = Alias;
