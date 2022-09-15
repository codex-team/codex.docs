import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from 'config';
import csrf from 'csurf';
import User from '../models/user.js';
import { binaryMD5 } from '../utils/crypto.js';

const router = express.Router();
const csrfProtection = csrf({ cookie: true });
const parseForm = express.urlencoded({ extended: false });

/**
 * Authorization page
 */
router.get('/auth', csrfProtection, function (req: Request, res: Response) {
  res.render('auth', {
    title: 'Login page',
    csrfToken: req.csrfToken(),
    redirectUrl: req.query.redirect || '/',
  });
});

/**
 * Process given password
 */
router.post('/auth', parseForm, csrfProtection, async (req: Request, res: Response) => {
  const { ADMIN_PASSWORD } = process.env;
  const { _redirect: redirectUrl } = req.body;

  try {
    if (!ADMIN_PASSWORD) {
      res.render('auth', {
        title: 'Login page',
        header: 'Admin password not set',
        csrfToken: req.csrfToken(),
        redirectUrl,
      });

      return;
    }

    const { username, password } = req.body;

    if (!username) {
      res.render('auth', {
        title: 'Login page',
        header: 'Username required',
        csrfToken: req.csrfToken(),
        redirectUrl,
      });

      return;
    }

    if (username === 'admin' && password !== ADMIN_PASSWORD) {
      res.render('auth', {
        title: 'Login page',
        header: 'Wrong password',
        csrfToken: req.csrfToken(),
        redirectUrl,
      });

      return;
    }

    const passwordHash = binaryMD5(password + config.get('secret'));
    const user = await User.getByUsername(username);

    if (username !== 'admin' && typeof user.username === 'undefined') {
      res.render('auth', {
        title: 'Login page',
        header: 'Wrong username',
        csrfToken: req.csrfToken(),
        redirectUrl,
      });

      return;
    }

    if (username !== 'admin' && user.passwordHash !== passwordHash) {
      res.render('auth', {
        title: 'Login page',
        header: 'Wrong password',
        csrfToken: req.csrfToken(),
        redirectUrl,
      });

      return;
    }

    const token = jwt.sign({
      iss: 'Codex Team',
      sub: 'auth',
      username, 
      role: user.role || 'admin',
      iat: Date.now(),
    }, config.get('secret'));

    res.cookie('authToken', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    res.redirect(redirectUrl || '/');
  } catch (err) {
    res.render('auth', {
      title: 'Login page',
      header: 'Unexpected error',
      csrfToken: req.csrfToken(),
      redirectUrl,
    });

    return;
  }
});

export default router;
