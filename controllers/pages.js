const model = require('../models/page');

/**
 * @class Pages
 * @classdesc Pages controller
 */
class Pages {
  /**
   * @static
   * Fields required for page model creation
   *
   * @returns {['title', 'body']}
   */
  static get REQUIRED_FIELDS () {
    return ['title', 'body'];
  }

  /**
   * @static
   * Find and return page model with passed id
   *
   * @param {string} id - page id
   * @returns {Promise<Page>}
   */
  static async get (id) {
      const page = await model.get(id);

      if (!page._id) {
          throw new Error('Page with given id does not exist');
      }

      return page;
  }

  /**
   * Return all pages
   *
   * @returns {Promise<Page[]>}
   */
  static async getAll() {
      return await model.getAll();
  }

  /**
   * Create new page model and save it in the database
   *
   * @param {PageData} data
   * @returns {Promise<Page>}
   */
  static async insert (data) {
    if (!Pages.validate(data)) {
      throw new Error('Invalid request format')
    }

    const page = new model(data);

    return page.save();
  }

  /**
   * Check PageData object for required fields
   *
   * @param {PageData} data
   * @returns {boolean}
   */
  static validate (data) {
    return Pages.REQUIRED_FIELDS.every(field => typeof data[field] !== 'undefined');
  }

  /**
   * Update page with given id in the database
   *
   * @param {string} id - page id
   * @param {PageData} data
   * @returns {Promise<Page>}
   */
  static async update (id, data) {
    const page = await model.get(id);

    if (!page._id) {
      throw new Error('Page with given id does not exist');
    }

    page.data = data;

    return page.save()
  }

  /**
   * Remove page with given id from the database
   *
   * @param {string} id - page id
   * @returns {Promise<Page>}
   */
  static async remove (id) {
      const page = await model.get(id);

      if (!page._id) {
          throw new Error('Page with given id does not exist');
      }

      return page.destroy();
  }
}

module.exports = Pages;