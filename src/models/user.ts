import database from '../utils/database/index';

const db = database['password'];

interface UserData {
  passHash: string;
}

/**
 * @class User
 * @class User model
 *
 * @property {string} passHash - hashed password
 */
class User {
  passHash: string;
  /**
   * Find and return model of user.
   * User is only one.
   *
   * @returns {Promise<User>}
   */
  static async get(): Promise<User|Error> {
    const data = await db.findOne({});
    
    if (data instanceof Error || data === null) {
      return new Error('User not found');
    }

    return new User(data as UserData);
  }

  /**
   * @class
   *
   * @param {UserData} userData
   */
  constructor(userData: UserData) {
    this.passHash = userData.passHash;
  }
}

export default User;
