import { NextFunction, Request, Response } from 'express';

/**
 * Middleware for checking locals.isAuthorized property, which allows to edit/create pages
 *
 * @param req - request object
 * @param res - response object
 * @param next - next function
 */
export default function allowEdit(req: Request, res: Response, next: NextFunction): void {
  if (res.locals.isAuthorized) {
    next();
  } else {
    res.redirect('/auth');
  }
}
