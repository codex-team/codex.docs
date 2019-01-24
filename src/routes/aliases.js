const express = require('express');
const router = express.Router();
const Aliases = require('../controllers/aliases');
const Pages = require('../controllers/pages');
const Alias = require('../models/alias');

/**
 * GET /*
 *
 * Return document with given alias
 */
router.get('*', async (req, res) => {
  try {
    const alias = await Aliases.get(req.originalUrl.slice(1)); // Cuts first '/' character

    switch (alias.type) {
      case Alias.types.PAGE: {
        let page = await Pages.get(alias.id);

        let pageParent = await page.parent;

        res.render('pages/page', {
          page, pageParent
        });
      }
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
