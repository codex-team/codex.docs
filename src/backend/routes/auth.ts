import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from 'config';
import csrf from 'csurf';

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
  });
});

/**
 * Process given password
 */
router.post('/auth', parseForm, csrfProtection, async (req: Request, res: Response) => {
  try {
    if (!process.env.PASSWORD) {
      res.render('auth', {
        title: 'Login page',
        header: 'Password not set',
        csrfToken: req.csrfToken(),
      });

      return;
    }

    if (req.body.password !== process.env.PASSWORD) {
      res.render('auth', {
        title: 'Login page',
        header: 'Wrong password',
        csrfToken: req.csrfToken(),
      });

      return;
    }

    const token = jwt.sign({
      iss: 'Codex Team',
      sub: 'auth',
      iat: Date.now(),
    }, process.env.PASSWORD + config.get('secret'));

    res.cookie('authToken', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    res.redirect('/');
  } catch (err) {
    res.render('auth', {
      title: 'Login page',
      header: 'Password not set',
      csrfToken: req.csrfToken(),
    });

    return;
  }
});

export default router;
