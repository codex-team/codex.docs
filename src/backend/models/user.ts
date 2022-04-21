import * as dotenv from 'dotenv';

dotenv.config();
export interface UserData {
  password?: string;
}

/**
 * @class User
 * @class User model
 *
 * @property {string} passHash - hashed password
 */
class User {
  public password?: string;

  /**
   * @class
   *
   * @param {UserData} userData - user data for construct new object
   */
  constructor(userData: UserData) {
    this.password = userData.password;
  }

  /**
   * Find and return model of user.
   * User is only one.
   *
   * @returns {Promise<User>}
   */
  public static async get(): Promise<User> {
    const userData: UserData = {
      password: process.env.PASSWORD,
    };

    return new User(userData);
  }
}

export default User;
