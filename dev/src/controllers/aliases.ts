import Alias from '../models/alias';

/**
 * @class Aliases
 * @classdesc Aliases controller
 */
class Aliases {
  /**
   * Find and return entity with given alias
   *
   * @param {string} aliasName - alias name of entity
   * @returns {Promise<Alias>}
   */
  public static async get(aliasName: string): Promise<Alias> {
    const alias = await Alias.get(aliasName);

    if (!alias.id) {
      throw new Error('Entity with given alias does not exist');
    }

    return alias;
  }
}

export default Aliases;
