const {pagesChildrenOrder: db} = require('../utils/database/index');

/**
 * PagesChildrenOrder
 */
class PageChildrenOrder {
  /**
   * Returns current Page's children order
   *
   * @param pageId
   */
  static async get(pageId) {
    const childrenOrder = await db.findOne({pageId});

    let data = {};

    if (!childrenOrder) {
      data.pageId = pageId;
    } else {
      data = childrenOrder;
    }

    return new PageChildrenOrder(data);
  }

  /**
   * @param data
   */
  constructor(data) {
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
   * @param pagesChildrenOrderData
   */
  set data(pagesChildrenOrderData) {
    this._pageId = pagesChildrenOrderData.pageId || 0;
    this._childrenOrder = pagesChildrenOrderData.childrenOrder || [];
  }

  /**
   * Return Page Children order
   */
  get data() {
    return {
      _id: this._id,
      pageId: '' + this._pageId,
      childrenOrder: this._childrenOrder
    };
  }

  /**
   * Pushes to the orders array
   * @param pageChild
   */
  pushChild(pageChild) {
    this._childrenOrder.push(pageChild);
  }

  /**
   * Removes child
   * @param pageChild
   */
  removeChild(pageChild) {
    const found = this._childrenOrder.indexOf(pageChild);

    if (found >= 0) {
      this._childrenOrder.splice(found, 1);
    }
  }

  /**
   * @return {Array}
   */
  get order() {
    return this._childrenOrder;
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

module.exports = PageChildrenOrder;
