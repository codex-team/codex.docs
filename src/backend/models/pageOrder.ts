import database, { isEntityId, isEqualIds } from '../database/index.js';
import { ObjectId } from 'mongodb';
import { EntityId } from '../database/types.js';

const db = database['pagesOrder'];

/**
 * @typedef {object} PageOrderData
 * @property {string} _id - row unique id
 * @property {string} page - page id
 * @property {Array<string>} order - list of ordered pages
 */
export interface PageOrderData {
  _id?: EntityId;
  page?: EntityId;
  order?: EntityId[];
}

/**
 * @class PageOrder
 * @classdesc PageOrder
 *
 * Creates order for Pages with children
 */
class PageOrder {
  public _id?: EntityId;
  public page?: EntityId;
  private _order?: EntityId[];


  /**
   * @class
   * @param {PageOrderData} data - info about pageOrder
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
   * Returns current Page's children order
   *
   * @param {string} pageId - page's id
   * @returns {Promise<PageOrder>}
   */
  public static async get(pageId: EntityId): Promise<PageOrder> {
    const order = await db.findOne({ page: pageId });

    let data: PageOrderData = {};

    if (order === null) {
      data.page = pageId;
    } else {
      data = order;
    }

    return new PageOrder(data);
  }

  /**
   * Find all pages which match passed query object
   *
   * @param {object} query - input query
   * @returns {Promise<PageOrder[]>}
   */
  public static async getAll(query: Record<string, unknown> = {}): Promise<PageOrder[]> {
    const docs = await db.find(query);

    return Promise.all(docs.map(doc => new PageOrder(doc)));
  }

  /**
   * Returns only root page's order
   *
   * @returns {Promise<PageOrder[]>}
   */
  public static async getRootPageOrder(): Promise<PageOrder> {
    const docs = await db.findOne({ 'page': '0' });

    return new PageOrder(docs);
  }

  /**
   * Returns only child page's order
   *
   * @returns {Promise<PageOrder[]>}
   */
  public static async getChildPageOrder(): Promise<PageOrder[]> {
    const docs = await this.getAll({ 'page': { $ne: '0' } });

    return Promise.all(docs.map(doc => new PageOrder(doc)));
  }

  /**
   * constructor data setter
   *
   * @param {PageOrderData} pageOrderData - info about pageOrder
   */
  public set data(pageOrderData: PageOrderData) {
    this.page = pageOrderData.page || '0' as EntityId;
    this.order = pageOrderData.order || [];
  }

  /**
   * Return Page Children order
   *
   * @returns {PageOrderData}
   */
  public get data(): PageOrderData {
    return {
      _id: this._id,
      page: this.page,
      order: this.order,
    };
  }

  /**
   * Pushes page id to the orders array
   *
   * @param {string} pageId - page's id
   */
  public push(pageId: EntityId): void {
    if (isEntityId(pageId)) {
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
  public remove(pageId: EntityId): void {
    if (this.order === undefined) {
      return;
    }

    const found = this.order.findIndex(order => isEqualIds(order, pageId));

    if (found >= 0) {
      this.order.splice(found, 1);
    }
  }

  /**
   * @param {string} currentPageId - page's id that changes the order
   * @param {string} putAbovePageId - page's id above which we put the target page
   * @returns {void}
   */
  public putAbove(currentPageId: EntityId, putAbovePageId: EntityId): void {
    if (this.order === undefined) {
      return;
    }

    const found1 = this.order.findIndex(order => isEqualIds(order, putAbovePageId));
    const found2 = this.order.findIndex(order => isEqualIds(order, currentPageId));

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
   * @param {string} pageId - identity of page
   */
  public getSubPageBefore(pageId: EntityId): EntityId | null {
    if (this.order === undefined) {
      return null;
    }

    const currentPageInOrder = this.order.findIndex(order => isEqualIds(order, pageId));

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
   * @param pageId - identity of page
   */
  public getSubPageAfter(pageId: EntityId): EntityId | null {
    if (this.order === undefined) {
      return null;
    }

    const currentPageInOrder = this.order.findIndex(order => isEqualIds(order, pageId));

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
  public set order(order: EntityId[]) {
    this._order = order;
  }

  /**
   * Returns ordered list
   *
   * @returns {string[]}
   */
  public get order(): EntityId[] {
    return this._order || [];
  }

  /**
   * Save or update page data in the database
   *
   * @returns {Promise<PageOrder>}
   */
  public async save(): Promise<PageOrder> {
    if (!this._id) {
      const insertedRow = await db.insert(this.data) as { _id: EntityId};

      this._id = insertedRow._id;
    } else {
      await db.update({ _id: this._id }, this.data);
    }

    return this;
  }

  /**
   * Remove page data from the database
   *
   * @returns {Promise<void>}
   */
  public async destroy(): Promise<void> {
    await db.remove({ _id: this._id });

    delete this._id;
  }
}

export default PageOrder;
