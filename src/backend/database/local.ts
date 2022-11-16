import Datastore from 'nedb';
import { DatabaseDriver, Options } from './types.js';
import path from 'path';
import appConfig from '../utils/appConfig.js';

/**
 * Init function for nedb instance
 *
 * @param {string} name - name of the data file
 * @returns {Datastore} db - nedb instance
 */
function initDb(name: string): Datastore {
  const dbConfig = appConfig.database.driver === 'local' ? appConfig.database.local : null;

  if (!dbConfig) {
    throw new Error('Database config is not initialized');
  }

  return new Datastore({
    filename: path.resolve(`${dbConfig.path}/${name}.db`),
    autoload: true,
  });
}

/**
 * Resolve function helper
 */
export interface ResolveFunction {
  (value: any): void;
}

/**
 * Reject function helper
 */
export interface RejectFunction {
  (reason?: unknown): void;
}


/**
 * Simple decorator class to work with nedb datastore
 */
export default class LocalDatabaseDriver<DocType> implements DatabaseDriver<DocType> {
  /**
   * nedb Datastore object
   */
  private db: Datastore;

  /**
   * @param collectionName - collection name for storing data
   */
  constructor(collectionName: string) {
    this.db = initDb(collectionName);
  }

  /**
   * Insert new document into the database
   *
   * @see https://github.com/louischatriot/nedb#inserting-documents
   * @param {object} doc - object to insert
   * @returns {Promise<object | Error>} - inserted doc or Error object
   */
  public async insert(doc: DocType): Promise<DocType> {
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
   * @param {object} query - query object
   * @param {object} projection - projection object
   * @returns {Promise<Array<object> | Error>} - found docs or Error object
   */
  public async find(query: Record<string, unknown>, projection?: DocType): Promise<Array<DocType>> {
    const cbk = (resolve: ResolveFunction, reject: RejectFunction) => (err: Error | null, docs: DocType[]) => {
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
   * @param {object} query - query object
   * @param {object} projection - projection object
   * @returns {Promise<object | Error>} - found doc or Error object
   */
  public async findOne(query: Record<string, unknown>, projection?: DocType): Promise<DocType> {
    const cbk = (resolve: ResolveFunction, reject: RejectFunction) => (err: Error | null, doc: DocType) => {
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
   * @param {object} query - query object
   * @param {object} update - fields to update
   * @param {Options} options - optional params
   * @returns {Promise<number | object | object[] | Error>} - number of updated rows or affected docs or Error object
   */
  public async update(query: Record<string, unknown>, update: DocType, options: Options = {}): Promise<number|boolean|Array<DocType>> {
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
   * @param {object} query - query object
   * @param {Options} options - optional params
   * @returns {Promise<number|Error>} - number of removed rows or Error object
   */
  public async remove(query: Record<string, unknown>, options: Options = {}): Promise<number> {
    return new Promise((resolve, reject) => this.db.remove(query, options, (err, result) => {
      if (err) {
        reject(err);
      }

      resolve(result);
    }));
  }
}
