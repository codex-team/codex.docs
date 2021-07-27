import Model from '../models/pageOrder';
import PageOrder from '../models/pageOrder';
import Page from '../models/page';

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
  static async get(parentId: string): Promise<PageOrder> {
    const order = await Model.get(parentId);

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
  static async getAll(): Promise<PageOrder[]> {
    return Model.getAll();
  }

  /**
   * Pushes the child page to the parent's order list
   *
   * @param {string} parentId - parent page's id
   * @param {string} childId - new page pushed to the order
   */
  static async push(parentId: string, childId: string) {
    const order = await Model.get(parentId);

    order.push(childId);
    await order.save();
  }

  /**
   * Move one page to another Page's order
   *
   * @param {string} oldParentId - old parent page's id
   * @param {string} newParentId - new parent page's id
   * @param {string} targetPageId - page's id which is changing the parent page
   */
  static async move(oldParentId: string, newParentId: string, targetPageId: string) {
    const oldParentOrder = await Model.get(oldParentId);

    oldParentOrder.remove(targetPageId);
    await oldParentOrder.save();

    const newParentOrder = await Model.get(newParentId);

    newParentOrder.push(targetPageId);
    await newParentOrder.save();
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
  static async getOrderedChildren(pages: Page[], currentPageId: string, parentPageId: string, ignoreSelf = false) {
    const children = await Model.get(parentPageId);
    const unordered = pages.filter(page => page._parent === parentPageId).map(page => page._id);

    // Create unique array with ordered and unordered pages id
    const ordered = Array.from(new Set([...children.order, ...unordered]));

    const result: Page[] = [];

    ordered.forEach(pageId => {
      pages.forEach(page => {
        if (page._id === pageId && (pageId !== currentPageId || !ignoreSelf)) {
          result.push(page);
        }
      });
    });

    return result;
  }

  /**
   * @param {string[]} unordered
   * @param {string} currentPageId - page's id that changes the order
   * @param {string} parentPageId - parent page's id that contains both two pages
   * @param {string} putAbovePageId - page's id above which we put the target page
   */
  static async update(unordered: string[], currentPageId: string, parentPageId: string, putAbovePageId: string) {
    const pageOrder = await Model.get(parentPageId);

    // Create unique array with ordered and unordered pages id
    pageOrder.order = Array.from(new Set([...pageOrder.order, ...unordered]));
    pageOrder.putAbove(currentPageId, putAbovePageId);
    await pageOrder.save();
  }

  /**
   * @param {string} parentId
   * @returns {Promise<void>}
   */
  static async remove(parentId: string) {
    const order = await Model.get(parentId);

    if (!order._id) {
      throw new Error('Page with given id does not contain order');
    }

    return order.destroy();
  }
}

export default PagesOrder;
