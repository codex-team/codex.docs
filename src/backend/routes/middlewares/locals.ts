import { NextFunction, Request, Response } from 'express';

/**
 * Middleware for checking locals.isAuthorized property, which allows to edit/create pages
 *
 * @param req - request object
 * @param res - response object
 * @param next - next function
 */
export function allowEdit(req: Request, res: Response, next: NextFunction): void {
  if (res.locals.isAuthorized) {
    next();
  } else {
    res.redirect('/auth?redirect=' + req.path);
  }
}

/**
 * Middleware for checking locals.isAuthorized property and checking that username is equal admin, which allows to edit/create users
 *
 * @param req - request object
 * @param res - response object
 * @param next - next function
 */
export function allowAdmin(req: Request, res: Response, next: NextFunction): void {
  if (res.locals.isAuthorized && res.locals.tokenData.username === 'admin') {
    next();
  } else {
    res.redirect('/auth?redirect=' + req.path);
  }
}
