import { NextFunction, Request, Response } from 'express';

interface InputFunction {
  (req: Request, res: Response, next: NextFunction): void;
}

/**
 * Helper for making async middlewares for express router
 *
 * @param {Function} fn - input function
 * @returns {function(*=, *=, *=)}
 */
export default function asyncMiddleware(fn: InputFunction): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
}
