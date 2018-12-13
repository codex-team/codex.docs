const express = require('express');
const router = express.Router();
const Aliases = require('../controllers/aliases');
const Pages = require('../controllers/pages');
const aliasTypes = require('../constants/aliasTypes');

/**
 * GET /*
 *
 * Return document with given alias
 */
router.get('*', async (req, res) => {
  try {
    console.log('url ', req.originalUrl);
    const alias = await Aliases.get(req.originalUrl);

    switch (alias.type) {
      case aliasTypes.PAGE: {
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
