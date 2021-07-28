import database from '../utils/database/index';

const db = database['pagesOrder'];

/**
 * @typedef {object} PageOrderData
 * @property {string} _id - row unique id
 * @property {string} page - page id
 * @property {Array<string>} order - list of ordered pages
 */

export interface PageOrderData {
  _id?: string;
  page?: string;
  order?: string[];
}

/**
 * @class PageOrder
 * @classdesc PageOrder
 *
 * Creates order for Pages with children
 */
class PageOrder {
  _id?: string;
  page?: string;
  _order?: string[];
  /**
   * Returns current Page's children order
   *
   * @param {string} pageId - page's id
   * @returns {Promise<PageOrder>}
   */
  static async get(pageId: string): Promise<PageOrder> {
    const order = await db.findOne({ page: pageId });

    let data = {} as PageOrderData;

    if (order instanceof Error || order === null) {
      data.page = pageId;
    } else {
      data = order;
    }

    return new PageOrder(data);
  }

  /**
   * Find all pages which match passed query object
   *
   * @param {object} query
   * @returns {Promise<PageOrder[]>}
   */
  static async getAll(query: object = {}): Promise<PageOrder[]> {
    const docs = await db.find(query);

    if (docs === null || docs instanceof Error) {
      return [];
    }

    return Promise.all(docs.map(doc => new PageOrder(doc)));
  }

  /**
   * @class
   *
   * @param {PageOrderData} data
   */
  constructor(data: PageOrderData = {}) {
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
   *
   * @param {PageOrderData} pageOrderData
   */
  set data(pageOrderData: PageOrderData) {
    this.page = pageOrderData.page || '0';
    this.order = pageOrderData.order || [];
  }

  /**
   * Return Page Children order
   *
   * @returns {PageOrderData}
   */
  get data(): PageOrderData {
    return {
      _id: this._id,
      page: '' + this.page,
      order: this.order,
    };
  }

  /**
   * Pushes page id to the orders array
   *
   * @param {string} pageId - page's id
   */
  push(pageId: string): void {
    if (typeof pageId === 'string') {
      if (this.order === undefined) {
        this.order = [];
      }
      this.order.push(pageId);
    } else {
      throw new Error('given id is not string');
    }
  }

  /**
   * Removes page id from orders array
   *
   * @param {string} pageId - page's id
   */
  remove(pageId: string): void {
    if (this.order === undefined) {
      return;
    }

    const found = this.order.indexOf(pageId);

    if (found >= 0) {
      this.order.splice(found, 1);
    }
  }

  /**
   * @param {string} currentPageId - page's id that changes the order
   * @param {string} putAbovePageId - page's id above which we put the target page
   *
   * @returns void
   */
  putAbove(currentPageId: string, putAbovePageId: string): void {
    if (this.order === undefined) {
      return;
    }

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
   * Returns page before passed page with id
   *
   * @param {string} pageId
   */
  getPageBefore(pageId: string): string | null {
    if (this.order === undefined) {
      return null;
    }

    const currentPageInOrder = this.order.indexOf(pageId);

    /**
     * If page not found or first return nothing
     */
    if (currentPageInOrder <= 0) {
      return null;
    }

    return this.order[currentPageInOrder - 1];
  }

  /**
   * Returns page before passed page with id
   *
   * @param pageId
   */
  getPageAfter(pageId: string): string | null {
    if (this.order === undefined) {
      return null;
    }

    const currentPageInOrder = this.order.indexOf(pageId);

    /**
     * If page not found or is last
     */
    if (currentPageInOrder === -1 || currentPageInOrder === this.order.length - 1) {
      return null;
    }

    return this.order[currentPageInOrder + 1];
  }

  /**
   * @param {string[]} order - define new order
   */
  set order(order: string[]) {
    this._order = order;
  }

  /**
   * Returns ordered list
   *
   * @returns {string[]}
   */
  get order(): string[] {
    return this._order || [];
  }

  /**
   * Save or update page data in the database
   * @returns {Promise<PageOrder>}
   */
  async save(): Promise<PageOrder> {
    if (!this._id) {
      const insertedRow = await db.insert(this.data) as { _id: string};

      if (!(insertedRow instanceof Error)) {
        this._id = insertedRow._id;
      }
    } else {
      await db.update({ _id: this._id }, this.data);
    }

    return this;
  }

  /**
   * Remove page data from the database
   * @returns {Promise<void>}
   */
  async destroy(): Promise<void> {
    await db.remove({ _id: this._id });

    delete this._id;

    // return this;
  }
}

export default PageOrder;
