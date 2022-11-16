import PageOrder from '../models/pageOrder.js';
import Page from '../models/page.js';
import PagesFlatArray from '../models/pagesFlatArray.js';
import { EntityId } from '../database/types.js';
import { isEqualIds, toEntityId } from '../database/index.js';

/**
 * @class PagesOrder
 * @classdesc PagesOrder controller
 *
 * Manipulates with Pages: changes the order, deletes, updates and so on...
 */
class PagesOrder {
  /**
   * Returns Page's order
   *
   * @param {string} parentId - of which page we want to get children order
   * @returns {Promise<PageOrder>}
   */
  public static async get(parentId: EntityId): Promise<PageOrder> {
    const order = await PageOrder.get(parentId);

    if (!order._id) {
      throw new Error('Page with given id does not contain order');
    }

    return order;
  }

  /**
   * Returns all records about page's order
   *
   * @returns {Promise<PageOrder[]>}
   */
  public static async getAll(): Promise<PageOrder[]> {
    return PageOrder.getAll();
  }

  /**
   * Returns only root page's order
   *
   * @returns {Promise<PageOrder[]>}
   */
  public static async getRootPageOrder(): Promise<PageOrder> {
    return PageOrder.getRootPageOrder();
  }

  /**
   * Returns only child page's order
   *
   * @returns {Promise<PageOrder[]>}
   */
  public static async getChildPageOrder(): Promise<PageOrder[]> {
    return PageOrder.getChildPageOrder();
  }

  /**
   * Pushes the child page to the parent's order list
   *
   * @param {string} parentId - parent page's id
   * @param {string} childId - new page pushed to the order
   */
  public static async push(parentId: EntityId, childId: EntityId): Promise<void> {
    const order = await PageOrder.get(parentId);

    order.push(childId);
    await order.save();
    await PagesFlatArray.regenerate();
  }

  /**
   * Move one page to another Page's order
   *
   * @param {string} oldParentId - old parent page's id
   * @param {string} newParentId - new parent page's id
   * @param {string} targetPageId - page's id which is changing the parent page
   */
  public static async move(oldParentId: EntityId, newParentId: EntityId, targetPageId: EntityId): Promise<void> {
    const oldParentOrder = await PageOrder.get(oldParentId);

    oldParentOrder.remove(targetPageId);
    await oldParentOrder.save();
    await PagesFlatArray.regenerate();

    const newParentOrder = await PageOrder.get(newParentId);

    newParentOrder.push(targetPageId);
    await newParentOrder.save();
    await PagesFlatArray.regenerate();
  }

  /**
   * Returns new array with ordered pages
   *
   * @param {Page[]} pages - list of all available pages
   * @param {string} currentPageId - page's id around which we are ordering
   * @param {string} parentPageId - parent page's id that contains page above
   * @param {boolean} ignoreSelf - should we ignore current page in list or not
   * @returns {Page[]}
   */
  public static async getOrderedChildren(pages: Page[], currentPageId: EntityId, parentPageId: EntityId, ignoreSelf = false): Promise<Page[]> {
    const children = await PageOrder.get(parentPageId);
    const unordered = pages.filter(page => isEqualIds(page._parent, parentPageId)).map(page => page._id);

    // Create unique array with ordered and unordered pages id
    const ordered = Array.from(new Set([...children.order, ...unordered].map(id => id?.toString())));

    const result: Page[] = [];

    ordered.forEach(pageId => {
      const id = pageId ? toEntityId(pageId): undefined;

      pages.forEach(page => {
        if (isEqualIds(page._id, id) && (!isEqualIds(id, currentPageId) || !ignoreSelf)) {
          result.push(page);
        }
      });
    });

    return result;
  }

  /**
   * @param {string[]} unordered - list of pages
   * @param {string} currentPageId - page's id that changes the order
   * @param {string} parentPageId - parent page's id that contains both two pages
   * @param {string} putAbovePageId - page's id above which we put the target page
   */
  public static async update(unordered: EntityId[], currentPageId: EntityId, parentPageId: EntityId, putAbovePageId: EntityId): Promise<void> {
    const pageOrder = await PageOrder.get(parentPageId);

    // Create unique array with ordered and unordered pages id
    pageOrder.order = Array
      .from(new Set([...pageOrder.order, ...unordered].map(id => id?.toString())))
      .map(toEntityId);
    pageOrder.putAbove(currentPageId, putAbovePageId);
    await pageOrder.save();
    await PagesFlatArray.regenerate();
  }

  /**
   * @param {string} parentId - identity of parent page
   * @returns {Promise<void>}
   */
  public static async remove(parentId: EntityId): Promise<void> {
    const order = await PageOrder.get(parentId);

    if (!order._id) {
      throw new Error('Page with given id does not contain order');
    }

    await order.destroy();
    await PagesFlatArray.regenerate();
  }
}

export default PagesOrder;
