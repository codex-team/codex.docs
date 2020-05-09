const express = require('express');
const router = express.Router();
const Pages = require('../controllers/pages');
const PagesOrder = require('../controllers/pagesOrder');

const verifyToken = require('./middlewares/token');
const allowEdit = require('./middlewares/locals');

/**
 * Create new page form
 */
router.get('/page/new', verifyToken, allowEdit, async (req, res, next) => {
  const pagesAvailable = await Pages.getAll();

  res.render('pages/form', {
    pagesAvailable,
    page: null,
  });
});

/**
 * Edit page form
 */
router.get('/page/edit/:id', verifyToken, allowEdit, async (req, res, next) => {
  const pageId = req.params.id;

  try {
    const page = await Pages.get(pageId);
    const pagesAvailable = await Pages.getAllExceptChildren(pageId);
    const parentsChildrenOrdered = await PagesOrder.getOrderedChildren(pagesAvailable, pageId, page._parent, true);

    res.render('pages/form', {
      page,
      parentsChildrenOrdered,
      pagesAvailable,
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

/**
 * View page
 */
router.get('/page/:id', verifyToken, async (req, res, next) => {
  const pageId = req.params.id;

  try {
    const page = await Pages.get(pageId);

    const pageParent = await page.parent;

    res.render('pages/page', {
      page,
      pageParent,
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

module.exports = router;
