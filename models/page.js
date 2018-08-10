const uuid4 = require('uuid4');
const {pages} = require('../database');

class Page {

  constructor (id, data = {}) {
    this.db = pages;

    if (id) {
      this.db.findOne({_id: id}).then(page => {
        console.log(page)

        if (!page) {
          this.data = data;
          return;
        }

        this._id = page._id;
        this.data = page;
      }).catch(ignored => {
        this.data = data;
      })
    } else {
      this.data = data;
    }
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
    this._parent = parentPage.id;
  }

  get parent () {
    return this.db.find({_id: this._parent});
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

}

module.exports = Page;