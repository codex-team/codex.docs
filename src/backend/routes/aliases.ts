import express, { Request, Response } from 'express';
import Aliases from '../controllers/aliases';
import Pages from '../controllers/pages';
import Alias from '../models/alias';
import verifyToken from './middlewares/token';
import PageOrder from '../models/pageOrder';
import Page from '../models/page';

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
      throw new Error('Alias not found');
    }

    switch (alias.type) {
      case Alias.types.PAGE: {
        const page = await Pages.get(alias.id);

        const pageParent = await page.getParent();

        let previousPage;

        let nextPage;

        const previousPageId = await PageOrder.getPreviousNavigationPage(alias.id);

        const nextPageId = await PageOrder.getNextNavigationPage(alias.id);

        if (previousPageId){
          previousPage = await Page.get(previousPageId);
        }

        if (nextPageId) {
          nextPage = await Page.get(nextPageId);
        }

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
    res.status(400).json({
      success: false,
      error: err,
    });
  }
});

export default router;
