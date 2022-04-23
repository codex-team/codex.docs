import config from 'config';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';


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
    if (!process.env.PASSWORD) {
      res.locals.isAuthorized = false;
      next();

      return;
    }

    const decodedToken = jwt.verify(token, process.env.PASSWORD + config.get('secret'));

    res.locals.isAuthorized = !!decodedToken;

    next();
  } catch (err) {
    res.locals.isAuthorized = false;
    next();
  }
}
