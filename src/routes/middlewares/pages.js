const Pages = require('../../controllers/pages');
const PagesOrder = require('../../controllers/pagesOrder');
const asyncMiddleware = require('../../utils/asyncMiddleware');

const RootPage = '0';

/**
 * Process one-level pages list to parent-children list
 * @param {string[]} pages - list of all available pages
 * @param {number} level
 * @param {number} currentLevel
 *
 * @return {Page[]}
 */
async function createMenuTree(pages, level = 1, currentLevel = 1) {
  return await Promise.all(pages.map(async pageId => {
    const parent = await Pages.get(pageId);

    /**
     * By default we accept that deepestChildren is empty Array
     * @type {Array}
     */
    let deepestChildren = [];

    /**
     * Here we try to check parent's children order
     * If we got something, pluck to found Page deeper and get its children order
     */
    try {
      /**
       * Go deeper until we didn't get the deepest level
       * On each 'currentLevel' create new Menu Tree with ordered Page ids
       */
      if (currentLevel !== level) {
        const children = await PagesOrder.get(pageId);
        deepestChildren = await createMenuTree(children.order, level, currentLevel + 1)
      }
    } catch (e) {}

    /**
     * Assign parent's children with found Menu Tree
     */
    return Object.assign({
      children: deepestChildren
    }, parent.data);
  }));
}

/**
 * Middleware for all /page/... routes
 * @param req
 * @param res
 * @param next
 */
module.exports = asyncMiddleware(async function (req, res, next) {
  try {
    const rootPages = await PagesOrder.get(RootPage);
    res.locals.menu = await createMenuTree(rootPages.order, 2);
  } catch (error) {
    console.log('Can not load menu:', error);
  }

  next();
});
