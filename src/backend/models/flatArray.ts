import Page from './page';
import PageOrder from './pageOrder';
import NodeCache from 'node-cache';

// Create cache for flat array
const cache = new NodeCache({ stdTTL: 120 });

/**
 * @typedef {object} FlatArrayData
 * @property {string} id - page id
 * @property {string} parentId - page parent id
 * @property {string} rootId - page root id
 * @property {number} level - page level in sidebar
 * @property {string} title - page title
 * @property {string} uri - page uri
 */
export interface FlatArrayData {
  id?: string;
  parentId?: string;
  rootId?: string;
  level?: number;
  title?: string;
  uri?: string;
}

/**
 * @class FlatArray
 * @class FlatArray model
 */
class FlatArray {
  /**
   * Returns pages flat array
   *
   * @returns {Promise<Array<FlatArrayData>>}
   */
  public static async get(): Promise<Array<FlatArrayData>> {
    // Get flat array from cache
    let arr = cache.get('flatArray') as Array<FlatArrayData>;

    // Check is flat array consists in cache
    if (!arr) {
      arr = await this.generate();
    }

    return arr;
  }

  /**
   * Generates flat array, saves it to cache, returns it
   *
   * @returns {Promise<Array<FlatArrayData>>}
   */
  public static async generate(): Promise<Array<FlatArrayData>> {
    const pages = await Page.getAll();
    const pagesOrders = await PageOrder.getAll();

    let arr = new Array<FlatArrayData>();

    // Get root order
    const rootOrder = pagesOrders.find( order => order.page == '0' );

    // Check is root order is not empty
    if (!rootOrder) {
      return [];
    }

    for (const pageId of rootOrder.order) {
      arr = arr.concat(this.getChildrenFlatArray(pageId, 0, pages,
        pagesOrders));
    }

    // Save generated flat array to cache
    cache.set('flatArray', arr);

    return arr;
  }

  /**
   * Returns previous page
   *
   * @param pageId - page id
   * @returns {Promise<FlatArrayData | undefined>}
   */
  public static async getPageBefore(pageId: string): Promise<FlatArrayData | undefined> {
    const arr = await this.get();

    const pageIndex = arr.findIndex( (item) => item.id == pageId);

    // Check if index is not the first
    if (pageIndex && pageIndex > 0) {
      // Return previous element from array
      return arr[pageIndex - 1];
    } else {
      return;
    }
  }

  /**
   * Returns next page
   *
   * @param pageId - page id
   * @returns {Promise<FlatArrayData | undefined>}
   */
  public static async getPageAfter(pageId: string): Promise<FlatArrayData | undefined> {
    const arr = await this.get();

    const pageIndex = arr.findIndex( (item) => item.id == pageId );

    // Check if index is not the last
    if (pageIndex < arr.length -1) {
      // Return next element from array
      return arr[pageIndex + 1];
    } else {
      return;
    }
  }

  /**
   * Returns child pages array
   *
   * @param pageId - parent page id
   * @param level - page level in sidebar
   * @param pages - all pages
   * @param orders - all page orders
   * @returns {Promise<Array<FlatArrayData>>}
   */
  private static getChildrenFlatArray(pageId: string, level: number,
    pages: Array<Page>, orders: Array<PageOrder>): Array<FlatArrayData> {
    let arr: Array<FlatArrayData> = new Array<FlatArrayData>();

    const page = pages.find( item => item._id == pageId );

    // Add element to child array
    if (page) {
      arr.push( {
        id: page._id,
        level: level,
        parentId: page._parent,
        rootId: '0',
        title: page.title,
        uri: page.uri,
      } );
    }

    const order = orders.find(item => item.page == pageId);

    if (order) {
      for (const childPageId of order.order) {
        arr = arr.concat(this.getChildrenFlatArray(childPageId, level + 1,
          pages, orders));
      }
    }

    return arr;
  }
}

export default FlatArray;
