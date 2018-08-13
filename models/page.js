const {pages} = require('../database');

class Page {

  static async get(_id) {
    const data = await pages.findOne({_id});

    return new Page(data);
  }

  static async getAll(query = {}) {
    const docs = await pages.find(query);

    return Promise.all(docs.map(doc => new Page(doc)));
  }

  constructor (data = {}) {
      if (data === null) {
          data = {};
      }

      this.db = pages;

      if (data._id) {
          this._id = data._id;
      }

      this.data = data;
  }

  set data (pageData) {
    const {title, body, parent} = pageData;

    this.title = title || this.title;
    this.body = body || this.body;
    this._parent = parent || this._parent;
  }

  get data () {
    return {
      _id: this._id,
      title: this.title,
      body: this.body,
      parent: this._parent
    }
  }

  set parent (parentPage) {
    this._parent = parentPage._id;
  }

  get parent () {
    return this.db.findOne({_id: this._parent})
        .then(data => new Page(data));
  }

  get children () {
      return this.db.find({parent: this._id})
          .then(data => data.map(page => new Page(page)));
  }

  async save () {
      if (!this._id) {
          const insertedRow = await this.db.insert(this.data);

          this._id = insertedRow._id;
      } else {
          await this.db.update({_id: this._id}, this.data);
      }

      return this;
  }

  async destroy () {
    await this.db.remove({_id: this._id});

    delete this._id;

    return this;
  }

  toJSON () {
    return this.data;
  }
}

module.exports = Page;