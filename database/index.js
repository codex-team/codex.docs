const pages = require('./pages');

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
  constructor (nedbInstance) {
    this.db = nedbInstance;
  }

  /**
   * Insert new document into the database
   * @see https://github.com/louischatriot/nedb#inserting-documents
   *
   * @param {Object} doc - object to insert
   * @returns {Promise<Object|Error>} - inserted doc or Error object
   */
  async insert (doc) {
    return new Promise((res, rej) => this.db.insert(doc, (err, newDoc) => {
      if (err) {
        rej(err);
      }

      res(newDoc);
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
  async find (query, projection) {
    const cbk = (res, rej) => (err, docs) => {
      if (err) {
        rej(err);
      }

      res(docs);
    };

    return new Promise((res, rej) => {
      if (projection) {
        this.db.find(query, projection, cbk(res, rej));
      } else {
        this.db.find(query, cbk(res, rej));
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
  async findOne (query, projection) {
    const cbk = (res, rej) => (err, doc) => {
      if (err) {
        rej(err);
      }

      res(doc);
    };

    return new Promise((res, rej) => {
      if (projection) {
        this.db.findOne(query, projection, cbk(res, rej));
      } else {
        this.db.findOne(query, cbk(res, rej));
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
  async update (query, update, options = {}) {
    return new Promise((res, rej) => this.db.update(query, update, options, (err, result, affectedDocs) => {
      if (err) {
        rej(err);
      }

      switch (true) {
          case options.returnUpdatedDocs:
            res(affectedDocs);
            break;
          case options.upsert:
              if (affectedDocs) {
                  res(affectedDocs);
              }
              res(result);
            break;
          default:
            res(result)
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
  async remove (query, options = {}) {
    return new Promise((res, rej) => this.db.remove(query, options, (err, result) => {
      if (err) {
        rej(err);
      }

      res(result);
    }));
  }

}

module.exports = {
  class: Database,
  pages: new Database(pages)
};