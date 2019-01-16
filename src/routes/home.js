const express = require('express');
const verifyToken = require('./middlewares/token');
const router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
  let isAuthorized = false;

  await verifyToken(req.cookies.authToken).then(
    async () => {
      console.log('Authorized user entered page');
      isAuthorized = true;
    },
    () => {
      console.log('Not authorized');
    }
  );
  res.render('index', { title: 'Express', isAuthorized: isAuthorized });
});

module.exports = router;
