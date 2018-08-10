const model = require('../models/page');

class Pages {
  static get REQUIRED_FIELDS () {
    return ['title', 'body'];
  }

  static async insert(data) {
    if (!Pages.validate(data)) {
      throw new Error('Invalid request format')
    }

    const page = new model(null, data);

    return page.save();
  }

  static validate (data) {
    return Pages.REQUIRED_FIELDS.every(field => data.hasOwnProperty(field));
  }

  static async update(id, data) {
    const page = new model(id, data);

    if (!page._id) {
      throw new Error('Page with given id does not exist');
    }

    return page.save()
  }
}

module.exports = Pages;