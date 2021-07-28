import Model from '../models/user';
import User from '../models/user';

/**
 * @class Users
 * @classdesc Users controller
 */
class Users {
  /**
   * Find and return user model.
   *
   * @returns {Promise<User>}
   */
  static async get(): Promise<User|Error> {
    const userDoc = await Model.get();

    return userDoc;
  }
}

export default Users;
