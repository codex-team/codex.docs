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
  public passHash: string;

  /**
   * @class
   *
   * @param {UserData} userData - user data for construct new object
   */
  constructor(userData: UserData) {
    this.passHash = userData.passHash;
  }

  /**
   * Find and return model of user.
   * User is only one.
   *
   * @returns {Promise<User>}
   */
  public static async get(): Promise<User|Error> {
    const data = await db.findOne({});

    if (data instanceof Error || data === null) {
      return new Error('User not found');
    }

    return new User(data as UserData);
  }
}

export default User;
