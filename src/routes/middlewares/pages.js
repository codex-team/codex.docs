const Pages = require('../../controllers/pages');
const PagesOrder = require('../../controllers/pagesOrder');
const asyncMiddleware = require('../../utils/asyncMiddleware');

/**
 * Process one-level pages list to parent-children list
 *
 * @param {string} parentPageId - parent page id
 * @param {Page[]} pages - list of all available pages
 * @param {PagesOrder[]} pagesOrder - list of pages order
 * @param {number} level
 * @param {number} currentLevel
 *
 * @return {Page[]}
 */
function createMenuTree(parentPageId, pages, pagesOrder, level = 1, currentLevel = 1) {
  const childrenOrder = pagesOrder.find(order => order.data.page === parentPageId);

  /**
   * branch is a page children in tree
   * if we got some children order on parents tree, then we push found pages in order sequence
   * otherwise just find all pages includes parent tree
   */
  let ordered = [];
  if (childrenOrder) {
    ordered = childrenOrder.order.map( pageId => {
      return pages.find( page => page._id === pageId);
    });
  }

  const unordered = pages.filter( page => page._parent === parentPageId);
  const branch = [...new Set([...ordered, ...unordered])];

  /**
   * stop recursion when we got the passed max level
   */
  if (currentLevel === level + 1) {
    return [];
  }

  /**
   * Each parents children can have subbranches
   */
  return branch.filter(page => page && page._id).map( page => {
    return Object.assign({
      children: createMenuTree(page._id, pages, pagesOrder, level, currentLevel + 1)
    }, page.data);
  });

}

/**
 * Middleware for all /page/... routes
 * @param req
 * @param res
 * @param next
 */
module.exports = asyncMiddleware(async function (req, res, next) {
  /**
   * Pages without parent
   * @type {string}
   */
  const parentIdOfRootPages = '0';
  try {
    const pages = await Pages.getAll();
    const pagesOrder = await PagesOrder.getAll();
    res.locals.menu = createMenuTree(parentIdOfRootPages, pages, pagesOrder, 2);
  } catch (error) {
    console.log('Can not load menu:', error);
  }
  next();
});
