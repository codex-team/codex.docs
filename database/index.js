const pages = require('./pages');

class Database {

  constructor (nedbInstance) {
    this.db = nedbInstance;
  }

  async insert (doc) {
    return new Promise((res, rej) => this.db.insert(doc, (err, newDoc) => {
      if (err) {
        rej(err);
      }

      res(newDoc);
    }))
  }

  async find (query, projection) {
    const cbk = (res, rej) => (err, docs) => {
      if (err) {
        rej(err);
      }

      res(docs);
    }

    return new Promise((res, rej) => {
      if (projection) {
        this.db.find(query, projection, cbk(res, rej));
      } else {
        this.db.find(query, cbk(res, rej));
      }
    })
  }

  async findOne (query, projection) {
    const cbk = (res, rej) => (err, doc) => {
      if (err) {
        rej(err);
      }

      res(doc);
    }

    return new Promise((res, rej) => {
      if (projection) {
        this.db.findOne(query, projection, cbk(res, rej));
      } else {
        this.db.findOne(query, cbk(res, rej));
      }
    })
  }

  async update (query, update, options = {}) {
    return new Promise((res, rej) => this.db.update(query, update, options, (err, result) => {
      if (err) {
        rej(err);
      }

      res(result);
    }))
  }

  async remove (query, options = {}) {
    return new Promise((res, rej) => this.db.remove(query, options, (err, result) => {
      if (err) {
        rej(err);
      }

      res(result);
    }))
  }

}

module.exports = {
  pages: new Database(pages)
};