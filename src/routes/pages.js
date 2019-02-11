const express = require('express');
const router = express.Router();
const Pages = require('../controllers/pages');
const verifyToken = require('./middlewares/token');
const allowEdit = require('./middlewares/locals');

/**
 * Create new page form
 */
router.get('/page/new', verifyToken, allowEdit, async (req, res, next) => {
  let pagesAvailable = await Pages.getAll();

  res.render('pages/form', {
    pagesAvailable,
    page: null
  });
});

/**
 * Edit page form
 */
router.get('/page/edit/:id', verifyToken, allowEdit, async (req, res, next) => {
  const pageId = req.params.id;

  try {
    let page = await Pages.get(pageId);
    let pagesAvailable = await Pages.getAllExceptChildren(pageId);

    res.render('pages/form', {
      pagesAvailable,
      page
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
    let page = await Pages.get(pageId);

    let pageParent = await page.parent;

    res.render('pages/page', {
      page, pageParent, isAuthorized: res.locals.isAuthorized
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

module.exports = router;
