import express, { Request, Response } from 'express';
import multerFunc from 'multer';
import Pages from '../../controllers/pages.js';
import PagesOrder from '../../controllers/pagesOrder.js';
import { EntityId } from '../../database/types.js';
import { isEntityId, isEqualIds, toEntityId } from '../../database/index.js';

const router = express.Router();
const multer = multerFunc();

/**
 * GET /page/:id
 *
 * Return PageData of page with given id
 */

router.get('/page/:id', async (req: Request, res: Response) => {
  try {
    const page = await Pages.get(toEntityId(req.params.id));

    res.json({
      success: true,
      result: page.data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: (err as Error).message,
    });
  }
});

/**
 * GET /pages
 *
 * Return PageData for all pages
 */
router.get('/pages', async (req: Request, res: Response) => {
  try {
    const pages = await Pages.getAllPages();

    res.json({
      success: true,
      result: pages,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: (err as Error).message,
    });
  }
});

/**
 * PUT /page
 *
 * Create new page in the database
 */
router.put('/page', multer.none(), async (req: Request, res: Response) => {
  try {
    const { title, body } = req.body;
    const parent = toEntityId(req.body.parent);
    const page = await Pages.insert({
      title,
      body,
      parent,
    });

    if (page._id === undefined) {
      throw new Error('Page not found');
    }

    /** push to the orders array */
    await PagesOrder.push(parent, page._id);

    res.json({
      success: true,
      result: page,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: (err as Error).message,
    });
  }
});

/**
 * POST /page/:id
 *
 * Update page data in the database
 */
router.post('/page/:id', multer.none(), async (req: Request, res: Response) => {
  const id = toEntityId(req.params.id);

  try {
    const { title, body, putAbovePageId, uri } = req.body;
    const parent = toEntityId(req.body.parent);
    const pages = await Pages.getAllPages();
    let page = await Pages.get(id);

    if (page._id === undefined) {
      throw new Error('Page not found');
    }

    if (!page._parent) {
      throw new Error('Parent not found');
    }

    if (!isEqualIds(page._parent, parent)) {
      await PagesOrder.move(page._parent, parent, id);
    } else {
      if (putAbovePageId && putAbovePageId !== '0') {
        const unordered = pages.filter(_page => isEqualIds(_page._parent, page._parent)).map(_page => _page._id);

        const unOrdered: EntityId[] = [];

        unordered.forEach(item => {
          if (isEntityId(item)) {
            unOrdered.push(item);
          }
        });

        await PagesOrder.update(unOrdered, page._id, page._parent, putAbovePageId);
      }
    }

    page = await Pages.update(id, {
      title,
      body,
      parent,
      uri,
    });
    res.json({
      success: true,
      result: page,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: (err as Error).message,
    });
  }
});

/**
 * DELETE /page/:id
 *
 * Remove page from the database
 */
router.delete('/page/:id', async (req: Request, res: Response) => {
  try {
    const pageId = toEntityId(req.params.id);
    const page = await Pages.get(pageId);

    if (page._id === undefined) {
      throw new Error('Page not found');
    }

    if (!page._parent) {
      throw new Error('Parent not found');
    }

    const parentPageOrder = await PagesOrder.get(page._parent);
    const pageBeforeId = parentPageOrder.getSubPageBefore(page._id);
    const pageAfterId = parentPageOrder.getSubPageAfter(page._id);

    let pageToRedirect;

    if (pageBeforeId) {
      pageToRedirect = await Pages.get(pageBeforeId);
    } else if (pageAfterId) {
      pageToRedirect = await Pages.get(pageAfterId);
    } else {
      pageToRedirect = page._parent !== '0' ? await Pages.get(page._parent) : null;
    }

    /**
     * remove current page and go deeper to remove children with orders
     *
     * @param {string} startFrom - start point to delete
     * @returns {Promise<void>}
     */
    const deleteRecursively = async (startFrom: EntityId): Promise<void> => {
      let order: EntityId[] = [];

      try {
        const children = await PagesOrder.get(startFrom);

        order = children.order;
      } catch (e) {
        order = [];
      }

      order.forEach(async id => {
        await deleteRecursively(id);
      });

      await Pages.remove(startFrom);
      try {
        await PagesOrder.remove(startFrom);
      } catch (e) {
        order = [];
      }
    };

    const id = toEntityId(req.params.id);

    await deleteRecursively(id);

    // remove also from parent's order
    parentPageOrder.remove(id);
    await parentPageOrder.save();

    res.json({
      success: true,
      result: pageToRedirect,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: (err as Error).message,
    });
  }
});

export default router;
