import express, { Request, Response } from 'express';
import Aliases from '../controllers/aliases.js';
import Pages from '../controllers/pages.js';
import Alias from '../models/alias.js';
import verifyToken from './middlewares/token.js';
import PagesFlatArray from '../models/pagesFlatArray.js';
import HttpException from '../exceptions/httpException.js';


const router = express.Router();

/**
 * GET /*
 *
 * Return document with given alias
 */
router.get('*', verifyToken, async (req: Request, res: Response) => {
  try {
    let url = req.originalUrl.slice(1); // Cuts first '/' character
    const queryParamsIndex = url.indexOf('?');

    if (queryParamsIndex !== -1) {
      url = url.slice(0, queryParamsIndex); // Cuts off query params
    }

    const alias = await Aliases.get(url);

    if (alias.id === undefined) {
      throw new HttpException(404, 'Alias not found');
    }

    switch (alias.type) {
      case Alias.types.PAGE: {
        const page = await Pages.get(alias.id);

        const pageParent = await page.getParent();

        const previousPage = await PagesFlatArray.getPageBefore(alias.id);
        const nextPage = await PagesFlatArray.getPageAfter(alias.id);

        res.render('pages/page', {
          page,
          pageParent,
          previousPage,
          nextPage,
          config: req.app.locals.config,
        });
      }
    }
  } catch (err) {
    if (err instanceof HttpException && (err as HttpException).status === 404) {
      res.status(404).render('error', {
        message: 'Page not found',
        status: 404,
      });
    } else {
      res.status(500).json({
        success: false,
        error: err,
      });
    }
  }
});

export default router;
