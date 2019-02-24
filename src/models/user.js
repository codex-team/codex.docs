const {password: db} = require('../utils/database/index');

/**
 * @class User
 * @class User model
 *
 * @property {string} passHash - hashed password
 */
class User {
  /**
   * Find and return model of user with given password hash
   *
   * @param {string} passHash - hashed password
   * @returns {Promise<User>}
   */
  static async get(passHash) {
    const data = await db.findOne({ passHash });

    if (!data) {
      return null;
    }

    return new User(data);
  }

  /**
   *
   */
  static async getSalt() {
    const saltDoc = await db.findOne({type: 'salt'});

    return saltDoc.saltValue;
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
