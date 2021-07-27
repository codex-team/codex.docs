import crypto from '../utils/crypto';
import database from '../utils/database/index';

const binaryMD5 = crypto.binaryMD5;
const aliasesDb = database['aliases'];


/**
 * @typedef {object} AliasData
 * @property {string} _id - alias id
 * @property {string} hash - alias binary hash
 * @property {string} type - entity type
 * @property {boolean} deprecated - indicate if alias deprecated
 * @property {string} id - entity id
 *
 */
interface AliasData {
  _id?: string;
  hash?: string;
  type?: string;
  deprecated?: boolean;
  id?: string;
}

/**
 * @class Alias
 * @classdesc Alias model
 *
 * @property {string} _id - alias id
 * @property {string} hash - alias binary hash
 * @property {string} type - entity type
 * @property {boolean} deprecated - indicate if alias deprecated
 * @property {string} id - entity title
 */
class Alias {
  _id: string | undefined;
  hash: string | undefined;
  type: string | undefined;
  deprecated: boolean | undefined;
  id: string | undefined;
  /**
   * Return Alias types
   *
   * @returns {object}
   */
  static get types(): { PAGE: string } {
    return {
      PAGE: 'page',
    };
  };

  /**
   * Find and return alias with given alias
   *
   * @param {string} aliasName - alias of entity
   * @returns {Promise<Alias>}
   */
  static async get(aliasName: string): Promise<Alias> {
    const hash = binaryMD5(aliasName);
    let data = await aliasesDb.findOne({
      hash: hash,
      deprecated: false,
    });

    if (!data) {
      data = await aliasesDb.findOne({ hash: hash });
    }

    if (data instanceof Error) {
      return new Alias();
    }

    return new Alias(data);
  }

  /**
   * @class
   *
   * @param {AliasData} data
   * @param {string} aliasName - alias of entity
   */
  constructor(data: AliasData = {}, aliasName: string = '') {
    if (data === null) {
      data = {};
    }
    if (data._id) {
      this._id = data._id;
    }
    if (aliasName) {
      this.hash = binaryMD5(aliasName);
    }
    this.data = data;
  }

  /**
   * Save or update alias data in the database
   *
   * @returns {Promise<Alias>}
   */
  async save(): Promise<Alias> {
    if (!this._id) {
      const insertedRow = await aliasesDb.insert(this.data) as { _id: string };

      this._id = insertedRow._id;
    } else {
      await aliasesDb.update({ _id: this._id }, this.data);
    }

    return this;
  }

  /**
   * Set AliasData object fields to internal model fields
   *
   * @param {AliasData} aliasData
   */
  set data(aliasData: AliasData) {
    const { id, type, hash, deprecated } = aliasData;

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
  get data(): AliasData {
    return {
      _id: this._id,
      id: this.id,
      type: this.type,
      hash: this.hash,
      deprecated: this.deprecated,
    };
  }

  /**
   * Mark alias as deprecated
   *
   * @param {string} aliasName - alias of entity
   * @returns {Promise<Alias>}
   */
  static async markAsDeprecated(aliasName: string) {
    const alias = await Alias.get(aliasName);

    alias.deprecated = true;

    return alias.save();
  }

  /**
   * @returns {Promise<Alias>}
   */
  async destroy() {
    await aliasesDb.remove({ _id: this._id });

    delete this._id;

    return this;
  }
}

export default Alias;
