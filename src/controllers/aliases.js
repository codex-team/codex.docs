const Alias = require('../models/alias');

/**
 * @class Aliases
 * @classdesc Aliases controller
 */
class Aliases {
  /**
   * @static
   * Find and return entity with given alias
   *
   * @param {string} aliasName - alias name of entity
   * @returns {Promise<Alias>}
   */
  static async get(aliasName) {
    const alias = await Alias.get(aliasName);

    if (!alias.id) {
      throw new Error('Entity with given alias does not exist');
    }

    return alias;
  }

  /**
   * @param id
   * @returns {Promise<void>}
   */
  static async removeById(id) {
    return Alias.destroyByEntityId(id);
  }
}

module.exports = Aliases;
