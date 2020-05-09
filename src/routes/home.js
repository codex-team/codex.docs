const express = require('express');
const verifyToken = require('./middlewares/token');
const router = express.Router();

/* GET home page. */
router.get('/', verifyToken, async (req, res) => {
  const config = req.app.locals.config;
  if (config.startPage) {
    return res.redirect(config.startPage);
  }
  res.render('pages/index', { isAuthorized: res.locals.isAuthorized });
});

module.exports = router;
