const model = require('../models/page');

class Pages {
  static get REQUIRED_FIELDS () {
    return ['title', 'body'];
  }

  static async get (id) {
      const page = await model.get(id);

      if (!page._id) {
          throw new Error('Page with given id does not exist');
      }

      return page;
  }

  static async getAll() {
      return await model.getAll();
  }

  static async insert (data) {
    if (!Pages.validate(data)) {
      throw new Error('Invalid request format')
    }

    const page = new model(data);

    return page.save();
  }

  static validate (data) {
    return Pages.REQUIRED_FIELDS.every(field => typeof data[field] !== 'undefined');
  }

  static async update (id, data) {
    const page = await model.get(id);

    if (!page._id) {
      throw new Error('Page with given id does not exist');
    }

    page.data = data;

    return page.save()
  }

  static async remove (id) {
      const page = await model.get(id);

      if (!page._id) {
          throw new Error('Page with given id does not exist');
      }

      return page.destroy();
  }
}

module.exports = Pages;