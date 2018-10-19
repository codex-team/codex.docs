const Pages = require('../../controllers/pages');
const asyncMiddleware = require('../../utils/asyncMiddleware');

/**
 * Process one-level pages list to parent-childrens list
 * @param {Page[]} pages - list of all available pages
 * @return {Page[]}
 */
function createMenuTree(pages) {
  return pages.filter(page => page._parent === '0').map(page => {
    return Object.assign({
      children: pages.filter(child => child._parent === page._id).reverse()
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
  try {
    const menu = await Pages.getAll();

    res.locals.menu = createMenuTree(menu);
  } catch (error) {
    console.log('Can not load menu:', error);
  }

  next();
});
