const express = require('express');
const verifyToken = require('./middlewares/token');
const router = express.Router();

/* GET home page. */
router.get('/', async function (req, res) {
  const isAuthorized = await verifyToken(req.cookies.authToken);

  res.render('index', { title: 'Express', isAuthorized: isAuthorized });
});

module.exports = router;
