const express = require('express');
const verifyToken = require('./middlewares/token');
const router = express.Router();

/* GET home page. */
router.get('/', verifyToken, async (req, res) => {
  res.render('pages/index', { isAuthorized: res.locals.isAuthorized });
});

module.exports = router;
