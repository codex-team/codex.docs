import express, { NextFunction, Request, Response } from 'express';
import Pages from '../controllers/pages';
import PagesOrder from '../controllers/pagesOrder';
import verifyToken from './middlewares/token';
import allowEdit from './middlewares/locals';

const router = express.Router();

/**
 * Create new page form
 */
router.get('/page/new', verifyToken, allowEdit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagesAvailableGrouped = await Pages.groupByParent();

    res.render('pages/form', {
      pagesAvailableGrouped,
      page: null,
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

/**
 * Edit page form
 */
router.get('/page/edit/:id', verifyToken, allowEdit, async (req: Request, res: Response, next: NextFunction) => {
  const pageId = req.params.id;

  try {
    const page = await Pages.get(pageId);
    const pagesAvailable = await Pages.getAllExceptChildren(pageId);
    const pagesAvailableGrouped = await Pages.groupByParent(pageId);

    if (!page._parent) {
      throw new Error('Parent not found');
    }

    const parentsChildrenOrdered = await PagesOrder.getOrderedChildren(pagesAvailable, pageId, page._parent, true);

    res.render('pages/form', {
      page,
      parentsChildrenOrdered,
      pagesAvailableGrouped,
      pagesAvailable,
      config: req.app.locals.config,
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

/**
 * View page
 */
router.get('/page/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  const pageId = req.params.id;

  try {
    const page = await Pages.get(pageId);

    const pageParent = await page.parent;

    res.render('pages/page', {
      page,
      pageParent,
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

export default router;
