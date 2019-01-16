const express = require('express');
const router = express.Router();
const { password: db } = require('../utils/database/index');
const jwt = require('jsonwebtoken');

/* GET authorization page. */
router.get('/auth', function (req, res, next) {
  res.render('auth', { title: 'Login page ', header: 'Enter password' });
});

router.post('/auth', async (req, res) => {
  const passwordDoc = await db.findOne({password: req.body.password});

  if (passwordDoc !== null) {
    const token = jwt.sign({
      'iss': 'Codex Team',
      'sub': 'auth',
      'iat': Date.now()
    }, passwordDoc.password);

    res.cookie('authToken', token);

    res.redirect('/');
  } else {
    res.render('auth', { title: 'Login page', header: 'Wrong password!<br \\/>Try once more' });
  }
});

module.exports = router;
