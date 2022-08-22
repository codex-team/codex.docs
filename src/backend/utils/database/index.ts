import Datastore from 'nedb';
import { AliasData } from '../../models/alias.js';
import { FileData } from '../../models/file.js';
import { PageData } from '../../models/page.js';
import { PageOrderData } from '../../models/pageOrder.js';
import initDb from './initDb.js';

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

interface ResolveFunction {
  (value: any): void;
}

interface RejectFunction {
  (reason?: unknown): void;
}

/**
 * @class Database
 * @classdesc Simple decorator class to work with nedb datastore
 *
 * @property {Datastore} db - nedb Datastore object
 */
export class Database<DocType> {
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
   *
   * @param {Object} query - query object
   * @param {Object} projection - projection object
   * @returns {Promise<Array<Object>|Error>} - found docs or Error object
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
   *
   * @param {Object} query - query object
   * @param {Object} projection - projection object
   * @returns {Promise<Object|Error>} - found doc or Error object
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
   *
   * @param {Object} query - query object
   * @param {Object} update - fields to update
   * @param {Options} options - optional params
   * @returns {Promise<number|Object|Object[]|Error>} - number of updated rows or affected docs or Error object
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
   *
   * @param {Object} query - query object
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

export default {
  pages: new Database<PageData>(initDb('pages')),
  aliases: new Database<AliasData>(initDb('aliases')),
  pagesOrder: new Database<PageOrderData>(initDb('pagesOrder')),
  files: new Database<FileData>(initDb('files')),
};
