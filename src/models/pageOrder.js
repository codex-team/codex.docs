const {pagesOrder: db} = require('../utils/database/index');

/**
 * @typedef {Object} PageOrderData
 * @property {string} _id - row unique id
 * @property {string} page - page id
 * @property {Array<string>} order - list of ordered pages
 */

/**
 * @class PageOrder
 * @classdesc PageOrder
 *
 * Creates order for Pages with children
 */
class PageOrder {
  /**
   * Returns current Page's children order
   *
   * @param {string} pageId - page's id
   */
  static async get(pageId) {
    const order = await db.findOne({page: pageId});

    let data = {};

    if (!order) {
      data.page = pageId;
    } else {
      data = order;
    }

    return new PageOrder(data);
  }

  /**
   * @constructor
   *
   * @param {PageOrderData} data
   */
  constructor(data = {}) {
    if (data === null) {
      data = {};
    }

    if (data._id) {
      this._id = data._id;
    }

    this.data = data;
  }

  /**
   * constructor data setter
   * @param {PageOrderData} pageOrderData
   */
  set data(pageOrderData) {
    this._page = pageOrderData.page || 0;
    this._order = pageOrderData.order || [];
  }

  /**
   * Return Page Children order
   * @returns {PageOrderData}
   */
  get data() {
    return {
      _id: this._id,
      page: '' + this._page,
      order: this._order
    };
  }

  /**
   * Pushes page id to the orders array
   *
   * @param {string} pageId - page's id
   */
  push(pageId) {
    if (typeof pageId === 'string') {
      this._order.push(pageId);
    } else {
      throw new Error('given id is not string');
    }
  }

  /**
   * Removes page id from orders array
   *
   * @param {string} pageId - page's id
   */
  remove(pageId) {
    const found = this._order.indexOf(pageId);

    if (found >= 0) {
      this._order.splice(found, 1);
    }
  }

  /**
   * @param {string} currentPageId - page's id that changes the order
   * @param {string} putAbovePageId - page's id above which we put the target page
   *
   * @returns void
   */
  putAbove(currentPageId, putAbovePageId) {
    const found1 = this.order.indexOf(putAbovePageId);
    const found2 = this.order.indexOf(currentPageId);

    if (found1 === -1 || found2 === -1) {
      return;
    }

    const margin = found1 < found2 ? 1 : 0;

    this.order.splice(found1, 0, currentPageId);
    this.order.splice(found2 + margin, 1);
  }

  /**
   * Returns ordered list
   *
   * @return {string[]}
   */
  get order() {
    return this._order;
  }

  /**
   * Save or update page data in the database
   */
  async save() {
    if (!this._id) {
      const insertedRow = await db.insert(this.data);

      this._id = insertedRow._id;
    } else {
      await db.update({_id: this._id}, this.data);
    }

    return this;
  }

  /**
   * Remove page data from the database
   */
  async destroy() {
    await db.remove({_id: this._id});

    delete this._id;

    return this;
  }
}

module.exports = PageOrder;
