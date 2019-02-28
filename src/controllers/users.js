const Model = require('../models/user');

/**
 * @class Users
 * @classdesc Users controller
 */
class Users {
  /**
   * @static
   * Find and return user model.
   *
   * @returns {Promise<User>}
   */
  static async get() {
    const userDoc = await Model.get();

    return userDoc;
  }
}

module.exports = Users;
