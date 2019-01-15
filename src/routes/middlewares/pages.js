const Pages = require('../../controllers/pages');
const PagesOrder = require('../../controllers/pagesOrder');
const asyncMiddleware = require('../../utils/asyncMiddleware');

const RootPage = '0';
/**
 * Process one-level pages list to parent-children list
 * @param {Page[]} pages - list of all available pages
 * @return {Page[]}
 */
async function createMenuTree(pages) {

  const children = await PagesOrder.get(RootPage);
  const firstLevelPages = [];

  children.order.forEach(pageId => {
    pages.forEach(page => {
      if (page._id === pageId) {
        firstLevelPages.push(page);
      }
    });
  });

  return Promise.all(firstLevelPages.map(async page => {
    const childrenOrdered = [];
    try {
      const children = await PagesOrder.get(page._id);
      children.order.forEach(pageId => {
        pages.forEach(_page => {
          if (_page._id === pageId) {
            childrenOrdered.push(_page);
          }
        })
      });
    } catch (e) {}

    return Object.assign({
      children: childrenOrdered
    }, page.data);
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
    const menu = await Pages.getAll();

    res.locals.menu = await createMenuTree(menu)
  } catch (error) {
    console.log('Can not load menu:', error);
  }

  next();
});
