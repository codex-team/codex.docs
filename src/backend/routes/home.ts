import express, { Request, Response } from 'express';
import verifyToken from './middlewares/token';

const router = express.Router();

/* GET home page. */
router.get('/', verifyToken, async (req: Request, res: Response) => {
  const config = req.app.locals.config;

  if (config.startPage) {
    return res.redirect(config.startPage);
  }
  res.render('pages/index', { isAuthorized: res.locals.isAuthorized });
});

export default router;
