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
export default async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies.authToken;

  try {
    const userDoc = await Users.get();

    if (!userDoc.password) {
      res.locals.isAuthorized = false;
      next();

      return;
    }

    const decodedToken = jwt.verify(token, userDoc.password + config.get('secret'));

    res.locals.isAuthorized = !!decodedToken;

    next();
  } catch (err) {
    res.locals.isAuthorized = false;
    next();
  }
}
