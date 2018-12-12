const express = require('express');
const router = express.Router();
const Aliases = require('../controllers/aliases');

/**
 * GET /*
 *
 * Return document with given alias
 */
router.get('*', async (req, res) => {
  try {
    console.log('url ', req.originalUrl);
    const id = await Aliases.get(req.originalUrl);

    res.json({
      success: true,
      // result: page.data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
