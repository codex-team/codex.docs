const Model = require('../models/pageChildrenOrder');

/**
 * @class PagesChildrenOrder
 * @classdesc PagesChildrenOrder controller
 */
class PagesChildrenOrder {
  /**
   * @param parentId
   */
  static async get(parentId) {
    const order = await Model.get(parentId);

    if (!order._id) {
      throw new Error('Page with given id does not exist');
    }

    return order;
  }

  /**
   * @param parentId
   * @param childId
   * @return {Promise<void>}
   */
  static async push(parentId, childId) {
    const order = await Model.get(parentId);

    order.pushChild(childId);
    await order.save();
  }

  /**
   * Move one page to another Page's order
   */
  static async renew(oldParentId, newParentId, childId) {
    const oldParentOrder = await Model.get(oldParentId);

    oldParentOrder.removeChild(childId);
    oldParentOrder.save();

    const newParentOrder = await Model.get(newParentId);

    newParentOrder.pushChild(childId);
    await newParentOrder.save();
  }

  /**
   * @param pages
   * @param currentPageId
   * @param parentPageId
   * @param ignoreSelf
   * @return Array<Page>
   */
  static async getOrderedChildren(pages, currentPageId, parentPageId, ignoreSelf = false) {
    const children = await PagesChildrenOrder.get(parentPageId);
    const result = [];

    children.order.forEach(pageId => {
      pages.forEach(page => {
        if (page._id === pageId && pageId !== currentPageId) {
          result.push(page);
        }
      });
    });

    return result;
  }

  /**
   * @param currentPageId
   * @param parentPageId
   * @param putAbovePageId
   * @return {Promise<void>}
   */
  static async update(currentPageId, parentPageId, putAbovePageId) {
    const children = await Model.get(parentPageId);
    const found1 = children.order.indexOf(putAbovePageId);
    const found2 = children.order.indexOf(currentPageId);

    if (found1 < found2) {
      for (let i = found2; i >= found1; i--) {
        children.order[i] = children.order[i - 1];
      }
      children.order[found1] = currentPageId;
    } else {
      for (let i = found2; i < found1; i++) {
        children.order[i] = children.order[i + 1];
      }
      children.order[found1 - 1] = currentPageId;
    }
    children.save();
  }
}

module.exports = PagesChildrenOrder;
