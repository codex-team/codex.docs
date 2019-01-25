const Model = require('../models/pageOrder');

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
  static async get(parentId) {
    const order = await Model.get(parentId);

    if (!order._id) {
      throw new Error('Page with given id does not contain order');
    }

    return order;
  }

  /**
   * Pushes the child page to the parent's order list
   *
   * @param {string} parentId - parent page's id
   * @param {string} childId - new page pushed to the order
   */
  static async push(parentId, childId) {
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
  static async move(oldParentId, newParentId, targetPageId) {
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
   * @param {Boolean} ignoreSelf - should we ignore current page in list or not
   * @return {Page[]}
   */
  static async getOrderedChildren(pages, currentPageId, parentPageId, ignoreSelf = false) {
    const children = await PagesOrder.get(parentPageId);
    const result = [];

    children.order.forEach(pageId => {
      pages.forEach(page => {
        if (page._id === pageId && (pageId !== currentPageId || !ignoreSelf)) {
          result.push(page);
        }
      });
    });

    return result;
  }

  /**
   * @param {string} currentPageId - page's id that changes the order
   * @param {string} parentPageId - parent page's id that contains both two pages
   * @param {string} putAbovePageId - page's id above which we put the target page
   */
  static async update(currentPageId, parentPageId, putAbovePageId) {
    const pageOrder = await Model.get(parentPageId);

    pageOrder.putAbove(currentPageId, putAbovePageId);
    await pageOrder.save();
  }

  /**
   * @param parentId
   * @returns {Promise<void>}
   */
  static async remove(parentId) {
    const order = await Model.get(parentId);

    if (!order._id) {
      throw new Error('Page with given id does not contain order');
    }

    return order.destroy();
  }
}

module.exports = PagesOrder;
