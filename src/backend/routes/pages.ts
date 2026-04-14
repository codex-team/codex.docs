import express, { NextFunction, Request, Response } from 'express';
import Pages from '../controllers/pages.js';
import PagesOrder from '../controllers/pagesOrder.js';
import verifyToken from './middlewares/token.js';
import allowEdit from './middlewares/locals.js';
import PagesFlatArray from '../models/pagesFlatArray.js';
import { toEntityId } from '../database/index.js';
import { buildPageBreadcrumbs } from '../utils/breadcrumbs.js';

const router = express.Router();

/**
 * Create new page form
 */
router.get('/page/new', verifyToken, allowEdit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parentSelectOptions = await Pages.getParentSelectOptions();

    res.render('pages/form', {
      parentSelectOptions,
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
  const pageId = toEntityId(req.params.id);

  try {
    const page = await Pages.get(pageId);
    const pagesAvailable = await Pages.getAllExceptChildren(pageId);
    const parentSelectOptions = await Pages.getParentSelectOptions(pageId);

    if (!page._parent) {
      throw new Error('Parent not found');
    }

    const parentsChildrenOrdered = await PagesOrder.getOrderedChildren(pagesAvailable, pageId, page._parent, true);

    res.render('pages/form', {
      page,
      parentsChildrenOrdered,
      parentSelectOptions,
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
  const pageId = toEntityId(req.params.id);

  try {
    const page = await Pages.get(pageId);

    const breadcrumbItems = await buildPageBreadcrumbs(page);

    const previousPage = await PagesFlatArray.getPageBefore(pageId);
    const nextPage = await PagesFlatArray.getPageAfter(pageId);

    res.render('pages/page', {
      page,
      breadcrumbItems,
      config: req.app.locals.config,
      previousPage,
      nextPage,
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
});

export default router;
