const express = require('express');
const router = express.Router();
const Pages = require('../controllers/pages');
const verifyToken = require('./middlewares/token');

/**
 * Create new page form
 */
router.get('/page/new', async (req, res) => {
  verifyToken(req.cookies.authToken).then(
    async () => {
      let pagesAvailable = await Pages.getAll();

      res.render('pages/form', {
        pagesAvailable,
        page: null
      });
    },
    () => {
      res.render('auth', { title: 'Login page', header: 'Enter password to do this!' });
    }

  );
});

/**
 * Edit page form
 */
router.get('/page/edit/:id', async (req, res, next) => {
  const isAuthorized = await verifyToken(req.cookies.authToken);

  if (isAuthorized) {
    const pageId = req.params.id;

    try {
      let page = await Pages.get(pageId);
      let pagesAvailable = await Pages.getAllExceptChildrens(pageId);

      res.render('pages/form', {
        pagesAvailable,
        page
      });
    } catch (error) {
      res.status(404);
      next(error);
    }
  } else {
    res.render('auth', { title: 'Login page', header: 'Enter password to do this!' });
  }
});

/**
 * View page
 */
router.get('/page/:id', async (req, res, next) => {
  const pageId = req.params.id;
  let isAuthorized = await verifyToken(req.cookies.authToken);

  try {
    let page = await Pages.get(pageId);

    let pageParent = await page.parent;

    res.render('pages/page', {
      page, pageParent, isAuthorized
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

module.exports = router;
