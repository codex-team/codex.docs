import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Users from '../controllers/users';
import config from 'config';
import bcrypt from 'bcrypt';
import csrf from 'csurf';

import * as dotenv from "dotenv";
dotenv.config();

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
  const userDoc = await Users.get();

  if (!userDoc || userDoc instanceof Error) {
    res.render('auth', {
      title: 'Login page',
      header: 'Password not set',
      csrfToken: req.csrfToken(),
    });

    return;
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
    }, passHash + config.get('secret'));

    res.cookie('authToken', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    res.redirect('/');
  });
});

export default router;
