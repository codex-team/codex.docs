const { password: db } = require('../utils/database/index');

/**
 * @class User
 * @class User model
 *
 * @property {string} passHash - hashed password
 */
class User {
  /**
   * Find and return model of user.
   * User is only one.
   *
   * @returns {Promise<User>}
   */
  static async get() {
    const data = await db.findOne({});

    if (!data) {
      return null;
    }

    return new User(data);
  }

  /**
   * @constructor
   *
   * @param {Object} userData
   */
  constructor(userData) {
    this.passHash = userData.passHash;
  }
}

module.exports = User;
