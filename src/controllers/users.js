const Model = require('../models/user');

/**
 * @class Users
 * @classdesc Users controller
 */
class Users {
  /**
   * @static
   * Find and return user model with given password hash
   *
   * @param {string} passHash - hashed password
   * @returns {Promise<User>}
   */
  static async get(passHash) {
    const userDoc = await Model.get(passHash);

    return userDoc;
  }

  /**
   * Find and return salt
   *
   * @returns {Promise<string>}
   */
  static async getSalt() {
    const salt = await Model.getSalt();

    return salt;
  }
}

module.exports = Users;
