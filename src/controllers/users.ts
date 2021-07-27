import Model from '../models/user';

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
  static async get() {
    const userDoc = await Model.get();

    return userDoc;
  }
}

export default Users;
