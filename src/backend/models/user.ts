import database from '../utils/database/index.js';
import config from 'config';
import { binaryMD5 } from '../utils/crypto.js';

const usersDb = database['users'];

/**
 * @typedef {object} UserData
 *
 * @property {string} _id - user id
 * @property {string} username - username
 * @property {string} role - user access role
 * @property {string} password - user plain text password
 * @property {string} passwordHash - user password hash
 */
export interface UserData {
  _id?: string;
  username?: string;
  role?: string;
  password?: string,
  passwordHash?: string;
  [key: string]: string | number | undefined;
}

/**
 * @class User
 * @class User model
 *
 * @property {string} _id - user id
 * @property {string} username - username
 * @property {string} role - user access role
 * @property {string} passwordHash - user password hash
 */
class User {
  public _id?: string;
  public username?: string;
  public role?: string;
  public passwordHash?: string;

  /**
   * @class
   *
   * @param {UserData} data - info about user
   */
  constructor(data: UserData = {}) {
    if (data === null) {
      data = {};
    }

    if (data._id) {
      this._id = data._id;
    }

    if (data.password) {
      data.passwordHash = binaryMD5(data.password + config.get('secret'));
      delete data.password;
    }

    this.data = data;
  }
  /**
   * Find and return model of file with given id
   *
   * @param {string} _id - user id
   * @returns {Promise<User>}
   */
  public static async get(_id: string): Promise<User> {
    const data: UserData = await usersDb.findOne({ _id });

    return new User(data);
  }

  /**
   * Find and return model of user with given id
   *
   * @param {string} username - username
   * @returns {Promise<User>}
   */
  public static async getByUsername(username: string): Promise<User> {
    const data = await usersDb.findOne({ username });

    return new User(data);
  }

  /**
   * Find all users which match passed query object
   *
   * @param {object} query - input query
   * @returns {Promise<User[]>}
   */
  public static async getAll(query: Record<string, unknown> = {}): Promise<User[]> {
    const records = await usersDb.find(query);

    return Promise.all(records.map(data => new User(data)));
  }

  /**
   * Set UserData object fields to internal model fields
   *
   * @param {UserData} userData - info about user
   */
  public set data(userData: UserData) {
    const { username, role, passwordHash } = userData;

    this.username = username || this.username;
    this.role = role || this.role;
    this.passwordHash = passwordHash || this.passwordHash;
  }

  /**
   * Return UserData object
   *
   * @returns {UserData}
   */
  public get data(): UserData {
    return {
      _id: this._id,
      username: this.username,
      role: this.role,
      passwordHash: this.passwordHash,
    };
  }

  /**
   * Save or update user data in the database
   *
   * @returns {Promise<User>}
   */
  public async save(): Promise<User> {
    if (!this._id) {
      if (this.username) {
        const user = await User.getByUsername(this.username);

        if (typeof user._id !== 'undefined') {
          throw new Error('Username is occupied by another user');
        }
      }
  
      const insertedRow = await usersDb.insert(this.data) as { _id: string };

      this._id = insertedRow._id;
    } else {
      await usersDb.update({ _id: this._id }, this.data);
    }

    return this;
  }

  /**
   * Remove user data from the database
   *
   * @returns {Promise<User>}
   */
  public async destroy(): Promise<User> {
    await usersDb.remove({ _id: this._id });

    delete this._id;

    return this;
  }

  /**
   * Return readable user data
   *
   * @returns {UserData}
   */
  public toJSON(): UserData {
    return this.data;
  }
}

export default User;
