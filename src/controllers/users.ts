import Model from '../models/user';
import UserData from '../models/user';

/**
 * @class Users
 * @classdesc Users controller
 */
class Users {
  /**
   * Find and return user model.
   *
   * @returns {Promise<UserData>}
   */
  public static get(): Promise<UserData> {
    return new Promise((resolve, reject) => {
      Model.get()
        .then( userDoc => {
          resolve(userDoc);
        })
        .catch( (e) => {
          reject(e);
        });
    });
  }
}

export default Users;
