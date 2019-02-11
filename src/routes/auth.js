const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Users = require('../controllers/users');
const config = require('../../config/index');
const bcrypt = require('bcrypt');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });

/**
 * Authorization page
 */
router.get('/auth', csrfProtection, function (req, res) {
  res.render('auth', { title: 'Login page ', header: 'Enter password', csrfToken: req.csrfToken() });
});

/**
 * Process given password
 */
router.post('/auth', parseForm, csrfProtection, async (req, res) => {
  let salt = await Users.getSalt();

  bcrypt.hash(req.body.password, salt, async function (err, hash) {
    if (err) {
      res.status(500);
    }

    const userDoc = await Users.get(hash);

    if (userDoc) {
      const token = jwt.sign({
        'iss': 'Codex Team',
        'sub': 'auth',
        'iat': Date.now()
      }, userDoc.passHash + config.secret);

      res.cookie('authToken', token);

      res.redirect('/');
    } else {
      res.render('auth', { title: 'Login page', header: 'Wrong password', csrfToken: req.csrfToken() });
    }
  });
});

module.exports = router;
