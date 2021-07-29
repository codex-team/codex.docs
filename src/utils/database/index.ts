import pages from './pages';
import files from './files';
import password from './password';
import aliases from './aliases';
import pagesOrder from './pagesOrder';
import Datastore from 'nedb';

/**
 * @typedef Options - optional params
 * @param {boolean} multi - (false) allows to take action to several documents
 * @param {boolean} upsert - (false) if true, upsert document with update fields.
 *                           Method will return inserted doc or number of affected docs if doc hasn't been inserted
 * @param {boolean} returnUpdatedDocs - (false) if true, returns affected docs
 */
interface Options {
  multi?: boolean;
  upsert?: boolean;
  returnUpdatedDocs?: boolean;
}

/**
 * @class Database
 * @classdesc Simple decorator class to work with nedb datastore
 *
 * @property {Datastore} db - nedb Datastore object
 */
export class Database {
  private db: Datastore;
  /**
   * @class
   *
   * @param {Object} nedbInstance - nedb Datastore object
   */
  constructor(nedbInstance: Datastore) {
    this.db = nedbInstance;
  }

  /**
   * Insert new document into the database
   *
   * @see https://github.com/louischatriot/nedb#inserting-documents
   *
   * @param {Object} doc - object to insert
   * @returns {Promise<Object|Error>} - inserted doc or Error object
   */
  public async insert(doc: object): Promise<object | Error> {
    return new Promise((resolve, reject) => this.db.insert(doc, (err, newDoc) => {
      if (err) {
        reject(err);
      }

      resolve(newDoc);
    }));
  }

  /**
   * Find documents that match passed query
   *
   * @see https://github.com/louischatriot/nedb#finding-documents
   *
   * @param {Object} query - query object
   * @param {Object} projection - projection object
   * @returns {Promise<Array<Object>|Error>} - found docs or Error object
   */
  public async find(query: object, projection?: object): Promise<Array<object> | Error> {
    const cbk = (resolve: Function, reject: Function) => (err: Error | null, docs: any[]) => {
      if (err) {
        reject(err);
      }

      resolve(docs);
    };

    return new Promise((resolve, reject) => {
      if (projection) {
        this.db.find(query, projection, cbk(resolve, reject));
      } else {
        this.db.find(query, cbk(resolve, reject));
      }
    });
  }

  /**
   * Find one document matches passed query
   *
   * @see https://github.com/louischatriot/nedb#finding-documents
   *
   * @param {Object} query - query object
   * @param {Object} projection - projection object
   * @returns {Promise<Object|Error>} - found doc or Error object
   */
  public async findOne(query: object, projection?: object): Promise<object | Error> {
    const cbk = (resolve: Function, reject: Function) => (err: Error | null, doc: any) => {
      if (err) {
        reject(err);
      }

      resolve(doc);
    };

    return new Promise((resolve, reject) => {
      if (projection) {
        this.db.findOne(query, projection, cbk(resolve, reject));
      } else {
        this.db.findOne(query, cbk(resolve, reject));
      }
    });
  }

  /**
   * Update document matches query
   *
   * @see https://github.com/louischatriot/nedb#updating-documents
   *
   * @param {Object} query - query object
   * @param {Object} update - fields to update
   * @param {Options} options - optional params
   * @returns {Promise<number|Object|Object[]|Error>} - number of updated rows or affected docs or Error object
   */
  public async update(query: object, update: object, options: Options = {}): Promise<any> {
    return new Promise((resolve, reject) => this.db.update(query, update, options, (err, result, affectedDocs) => {
      if (err) {
        reject(err);
      }

      switch (true) {
        case options.returnUpdatedDocs:
          resolve(affectedDocs);
          break;
        case options.upsert:
          if (affectedDocs) {
            resolve(affectedDocs);
          }
          resolve(result);
          break;
        default:
          resolve(result);
      }
    }));
  }

  /**
   * Remove document matches passed query
   *
   * @see https://github.com/louischatriot/nedb#removing-documents
   *
   * @param {Object} query - query object
   * @param {Options} options - optional params
   * @returns {Promise<number|Error>} - number of removed rows or Error object
   */
  public async remove(query: object, options: Options = {}): Promise<number|Error> {
    return new Promise((resolve, reject) => this.db.remove(query, options, (err, result) => {
      if (err) {
        reject(err);
      }

      resolve(result);
    }));
  }
}

export default {
  pages: new Database(pages),
  password: new Database(password),
  aliases: new Database(aliases),
  pagesOrder: new Database(pagesOrder),
  files: new Database(files),
};
