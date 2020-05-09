require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Users = require('../controllers/users');
const config = require('../../config/index');
const bcrypt = require('bcrypt');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const parseForm = express.urlencoded({ extended: false });

/**
 * Authorization page
 */
router.get('/auth', csrfProtection, function (req, res) {
  res.render('auth', {
    title: 'Login page',
    csrfToken: req.csrfToken(),
  });
});

/**
 * Process given password
 */
router.post('/auth', parseForm, csrfProtection, async (req, res) => {
  const userDoc = await Users.get();

  if (!userDoc) {
    res.render('auth', {
      title: 'Login page',
      header: 'Password not set',
      csrfToken: req.csrfToken(),
    });
  }

  const passHash = userDoc.passHash;

  bcrypt.compare(req.body.password, passHash, async (err, result) => {
    if (err || result === false) {
      res.render('auth', {
        title: 'Login page',
        header: 'Wrong password',
        csrfToken: req.csrfToken(),
      });
    }

    const token = jwt.sign({
      iss: 'Codex Team',
      sub: 'auth',
      iat: Date.now(),
    }, passHash + config.secret);

    res.cookie('authToken', token, { httpOnly: true });

    res.redirect('/');
  });
});

module.exports = router;
