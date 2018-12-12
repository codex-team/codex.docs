const Model = require('../models/alias');

/**
 * @class Aliases
 * @classdesc Aliases controller
 */
class Aliases {
  /**
   * @static
   * Find and return id of entity with given alias
   *
   * @param {string} alias - alias of entity
   * @returns {Promise<string>}
   */
  static async get(alias) {
    const id = await Model.get(alias);
    console.log('id', id);
    if (!id) {
      throw new Error('Entity with given alias does not exist');
    }

    return id;
  }
}

module.exports = Aliases;
