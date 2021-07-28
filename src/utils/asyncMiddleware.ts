import { NextFunction, Request, Response } from 'express';

/**
 * Helper for making async middlewares for express router
 *
 * @param fn
 * @returns {function(*=, *=, *=)}
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export default function asyncMiddleware(fn: Function): (...params: any) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
}
