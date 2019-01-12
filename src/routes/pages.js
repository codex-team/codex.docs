const express = require('express');
const router = express.Router();
const Pages = require('../controllers/pages');

/**
 * Create new page form
 */
router.get('/page/new', async (req, res) => {
  let pagesAvailable = await Pages.getAll();

  res.render('pages/form', {
    pagesAvailable,
    page: null
  });
});

/**
 * Edit page form
 */
router.get('/page/edit/:id', async (req, res, next) => {
  const pageId = req.params.id;

  try {
    const page = await Pages.get(pageId);
    const pagesAvailable = await Pages.getAll();

    /**
     * get parent with children
     */
    let parentsChildren = [];

    let parentsChildrenOrdered = [];

    if (page._parent && page._parent !== '0') {
      const parentPage = await Pages.get(page._parent);

      parentsChildren = pagesAvailable.filter(_page => _page._parent === parentPage._id);

      /** Order children */
      parentPage.childrenOrder.forEach(_pageId => {
        parentsChildren.forEach(_page => {
          if (_page._id === _pageId && _pageId !== pageId) {
            parentsChildrenOrdered.push(_page);
          }
        });
      });
    }

    res.render('pages/form', {
      page,
      parentsChildrenOrdered,
      pagesAvailable
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

/**
 * View page
 */
router.get('/page/:id', async (req, res, next) => {
  const pageId = req.params.id;

  try {
    let page = await Pages.get(pageId);

    let pageParent = await page.parent;

    res.render('pages/page', {
      page, pageParent
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

module.exports = router;
