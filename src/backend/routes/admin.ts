import express, { NextFunction, Request, Response } from 'express';
import { allowAdmin } from './middlewares/locals.js';
import verifyToken from './middlewares/token.js';

const router = express.Router();

/**
 * Admin settings
 */
router.get('/admin/settings', verifyToken, allowAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render('pages/settings', {
      users: [],
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

export default router;
