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
    let page = await Pages.get(pageId);
    let pagesAvailable = await Pages.getAll();

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
router.get('/page/:id', async (req, res, next) => {
  const pageId = req.params.id;

  try {
    let page = await Pages.get(pageId);

    res.render('pages/page', {
      page
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

module.exports = router;
