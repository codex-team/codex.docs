const express = require('express');
const router = express.Router();
const Aliases = require('../controllers/aliases');
const Pages = require('../controllers/pages');
const Alias = require('../models/alias');
const verifyToken = require('./middlewares/token');

/**
 * GET /*
 *
 * Return document with given alias
 */
router.get('*', verifyToken, async (req, res) => {
  try {
    let url = req.originalUrl.slice(1); // Cuts first '/' character
    const queryParamsIndex = url.indexOf('?');

    if (queryParamsIndex !== -1) {
      url = url.slice(0, queryParamsIndex); // Cuts off query params
    }

    const alias = await Aliases.get(url);

    switch (alias.type) {
      case Alias.types.PAGE: {
        const page = await Pages.get(alias.id);

        const pageParent = await page.parent;

        res.render('pages/page', {
          page,
          pageParent,
        });
      }
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
