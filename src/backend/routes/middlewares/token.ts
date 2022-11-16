import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import appConfig from '../../utils/appConfig.js';


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
    if (!appConfig.auth.password) {
      res.locals.isAuthorized = false;
      next();

      return;
    }

    const decodedToken = jwt.verify(token, appConfig.auth.password + appConfig.auth.secret);

    res.locals.isAuthorized = !!decodedToken;

    next();
  } catch (err) {
    res.locals.isAuthorized = false;
    next();
  }
}
