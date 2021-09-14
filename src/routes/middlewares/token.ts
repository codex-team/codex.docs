import * as dotenv from 'dotenv';
import config from 'config';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Users from '../../controllers/users';

dotenv.config();

/**
 * Middleware for checking jwt token
 *
 * @param req - request object
 * @param res - response object
 * @param next - next function
 */
export default function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies.authToken;

  Users.get()
    .then( userDoc => {
      if (!userDoc.passHash) {
        res.locals.isAuthorized = false;
        next();

        return;
      }

      const decodedToken = jwt.verify(token, userDoc.passHash + config.get('secret'));

      res.locals.isAuthorized = !!decodedToken;

      next();
    })
    .catch( () => {
      res.locals.isAuthorized = false;
      next();
    });
}
