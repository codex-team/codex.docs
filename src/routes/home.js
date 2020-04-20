const express = require('express');
const verifyToken = require('./middlewares/token');
const router = express.Router();
const config = require('../../config/index');

/* GET home page. */
router.get('/', verifyToken, async (req, res) => {
  if (config.startPage) {
    return res.redirect(config.startPage);
  }
  res.render('pages/index', { isAuthorized: res.locals.isAuthorized });
});

module.exports = router;
