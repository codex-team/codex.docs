const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const bodyParser = require('body-parser');
const { password: db } = require('../utils/database/index');
const jwt = require('jsonwebtoken');
const config = require('../../config/index');
const md5 = require('md5');

const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });

/* GET authorization page. */
router.get('/auth', csrfProtection, function (req, res, next) {
  res.render('auth', { title: 'Login page ', header: 'Enter password', csrfToken: req.csrfToken() });
});

router.post('/auth', parseForm, csrfProtection, async (req, res) => {
  const passwordDoc = await db.findOne({ 'password': md5(req.body.password) });

  if (passwordDoc !== null) {
    const token = jwt.sign({
      'iss': 'Codex Team',
      'sub': 'auth',
      'iat': Date.now()
    }, passwordDoc.password + config.secret);

    res.cookie('authToken', token);

    res.redirect('/');
  } else {
    res.render('auth', { title: 'Login page', header: 'Wrong password' });
  }
});

module.exports = router;
