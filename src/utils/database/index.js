const pages = require('./pages');
const pagesOrder = require('./pagesOrder');

/**
 * @class Database
 * @classdesc Simple decorator class to work with nedb datastore
 *
 * @property db - nedb Datastore object
 */
class Database {
  /**
   * @constructor
   *
   * @param {Object} nedbInstance - nedb Datastore object
   */
  constructor(nedbInstance) {
    this.db = nedbInstance;
  }

  /**
   * Insert new document into the database
   * @see https://github.com/louischatriot/nedb#inserting-documents
   *
   * @param {Object} doc - object to insert
   * @returns {Promise<Object|Error>} - inserted doc or Error object
   */
  async insert(doc) {
    return new Promise((resolve, reject) => this.db.insert(doc, (err, newDoc) => {
      if (err) {
        reject(err);
      }

      resolve(newDoc);
    }));
  }

  /**
   * Find documents that match passed query
   * @see https://github.com/louischatriot/nedb#finding-documents
   *
   * @param {Object} query - query object
   * @param {Object} projection - projection object
   * @returns {Promise<Array<Object>|Error>} - found docs or Error object
   */
  async find(query, projection) {
    const cbk = (resolve, reject) => (err, docs) => {
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
   * @see https://github.com/louischatriot/nedb#finding-documents
   *
   * @param {Object} query - query object
   * @param {Object} projection - projection object
   * @returns {Promise<Object|Error>} - found doc or Error object
   */
  async findOne(query, projection) {
    const cbk = (resolve, reject) => (err, doc) => {
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
   * @see https://github.com/louischatriot/nedb#updating-documents
   *
   * @param {Object} query - query object
   * @param {Object} update - fields to update
   * @param {Object} options
   * @param {Boolean} options.multi - (false) allows update several documents
   * @param {Boolean} options.upsert - (false) if true, upsert document with update fields.
   *                                    Method will return inserted doc or number of affected docs if doc hasn't been inserted
   * @param {Boolean} options.returnUpdatedDocs - (false) if true, returns affected docs
   * @returns {Promise<number|Object|Object[]|Error>} - number of updated rows or affected docs or Error object
   */
  async update(query, update, options = {}) {
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
   * @see https://github.com/louischatriot/nedb#removing-documents
   *
   * @param {Object} query - query object
   * @param {Object} options
   * @param {Boolean} options.multi - (false) if true, remove several docs
   * @returns {Promise<number|Error>} - number of removed rows or Error object
   */
  async remove(query, options = {}) {
    return new Promise((resolve, reject) => this.db.remove(query, options, (err, result) => {
      if (err) {
        reject(err);
      }

      resolve(result);
    }));
  }
}

module.exports = {
  class: Database,
  pages: new Database(pages),
  pagesOrder: new Database(pagesOrder)
};
