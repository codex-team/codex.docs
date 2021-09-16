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
  public static async get(): Promise<User> {
    const userData: User = await User.get();

    return userData;
  }
}

export default Users;
