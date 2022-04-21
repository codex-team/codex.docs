import * as dotenv from 'dotenv';

dotenv.config();

export interface UserData {
  passHash?: string;
}

/**
 * @class User
 * @class User model
 *
 * @property {string} passHash - hashed password
 */
class User {
  public passHash?: string;

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
  public static async get(): Promise<User> {
    const userData: UserData = {
      passHash: process.env.PASSHASH,
    };

    return new User(userData);
  }
}

export default User;
