import Page from './page.js';
import PageOrder from './pageOrder.js';
import NodeCache from 'node-cache';
import { EntityId } from '../database/types.js';
import { isEqualIds } from '../database/index.js';

// Create cache for flat array
const cache = new NodeCache({ stdTTL: 120 });

const cacheKey = 'pagesFlatArray';

/**
 * Element for pagesFlatArray
 */
export interface PagesFlatArrayData {
  /**
   * Page id
   */
  id: EntityId;

  /**
   * Page parent id
   */
  parentId?: EntityId;

  /**
   * id of parent with parent id '0'
   */
  rootId: string;

  /**
   * Page level in sidebar view
   */
  level: number;

  /**
   * Page title
   */
  title: string;

  /**
   * Page uri
   */
  uri?: string;
}

/**
 * @class PagesFlatArray model - flat array of pages, which are ordered like in sidebar
 */
class PagesFlatArray {
  /**
   * Returns pages flat array
   *
   * @param nestingLimit - number of flat array nesting, set null to dismiss the restriction, default nesting 2
   * @returns {Promise<Array<PagesFlatArrayData>>}
   */
  public static async get(nestingLimit: number | null = 2): Promise<Array<PagesFlatArrayData>> {
    // Get flat array from cache
    let arr = cache.get(cacheKey) as Array<PagesFlatArrayData>;

    // Check is flat array consists in cache
    if (!arr) {
      arr = await this.regenerate();
    }

    if (!nestingLimit) {
      return arr;
    }

    return arr.filter( (item) => item.level < nestingLimit );
  }

  /**
   * Generates new flat array, saves it to cache, returns it
   * Calls, when there is no pages flat array data in cache or when page or pageOrder data updates
   *
   * @returns {Promise<Array<PagesFlatArrayData>>}
   */
  public static async regenerate(): Promise<Array<PagesFlatArrayData>> {
    const pages = await Page.getAll();
    const pagesOrders = await PageOrder.getAll();

    let arr = new Array<PagesFlatArrayData>();

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
    cache.set(cacheKey, arr);

    return arr;
  }

  /**
   * Returns previous page
   *
   * @param pageId - page id
   * @returns {Promise<PagesFlatArrayData | undefined>}
   */
  public static async getPageBefore(pageId: EntityId): Promise<PagesFlatArrayData | undefined> {
    const arr = await this.get();

    const pageIndex = arr.findIndex((item) => isEqualIds(item.id, pageId));

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
   * @returns {Promise<PagesFlatArrayData | undefined>}
   */
  public static async getPageAfter(pageId: EntityId): Promise<PagesFlatArrayData | undefined> {
    const arr = await this.get();

    const pageIndex = arr.findIndex( (item) => isEqualIds(item.id, pageId));

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
   * @returns {Promise<Array<PagesFlatArrayData>>}
   */
  private static getChildrenFlatArray(pageId: EntityId, level: number,
    pages: Array<Page>, orders: Array<PageOrder>): Array<PagesFlatArrayData> {
    let arr: Array<PagesFlatArrayData> = new Array<PagesFlatArrayData>();

    const page = pages.find(item => isEqualIds(item._id, pageId));

    // Add element to child array
    if (page) {
      arr.push( {
        id: page._id!,
        level: level,
        parentId: page._parent,
        rootId: '0',
        title: page.title!,
        uri: page.uri,
      } );
    }

    const order = orders.find(item => isEqualIds(item.page, pageId));

    if (order) {
      for (const childPageId of order.order) {
        arr = arr.concat(this.getChildrenFlatArray(childPageId, level + 1,
          pages, orders));
      }
    }

    return arr;
  }
}

export default PagesFlatArray;
