const express = require('express');
const router = express.Router();
const multer = require('multer')();
const Pages = require('../../controllers/pages');
const PagesOrder = require('../../controllers/pagesOrder');
/**
 * GET /page/:id
 *
 * Return PageData of page with given id
 */
router.get('/page/:id', async (req, res) => {
  try {
    const page = await Pages.get(req.params.id);

    res.json({
      success: true,
      result: page.data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /pages
 *
 * Return PageData for all pages
 */
router.get('/pages', async (req, res) => {
  try {
    const pages = await Pages.getAll();

    res.json({
      success: true,
      result: pages
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * PUT /page
 *
 * Create new page in the database
 */
router.put('/page', multer.any(), async (req, res) => {
  try {
    const {title, body, parent} = req.body;
    const page = await Pages.insert({title, body, parent});

    /** push to the orders array */
    await PagesOrder.push(parent, page._id);

    res.json({
      success: true,
      result: page
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /page/:id
 *
 * Update page data in the database
 */
router.post('/page/:id', multer.any(), async (req, res) => {
  const {id} = req.params;

  try {
    const {title, body, parent, putAbovePageId, uri} = req.body;
    const pages = await Pages.getAll();
    let page = await Pages.get(id);

    if (page._parent !== parent) {
      await PagesOrder.move(page._parent, parent, id);
    } else {
      if (putAbovePageId && putAbovePageId !== '0') {
        const unordered = pages.filter( _page => _page._parent === page._parent).map(_page => _page._id);
        await PagesOrder.update(unordered, page._id, page._parent, putAbovePageId);
      }
    }

    page = await Pages.update(id, {title, body, parent, uri});
    res.json({
      success: true,
      result: page
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * DELETE /page/:id
 *
 * Remove page from the database
 */
router.delete('/page/:id', async (req, res) => {
  try {
    const pageId = req.params.id;
    const page = await Pages.get(pageId);
    const parentPageOrder = await PagesOrder.get(page._parent);
    const pageBeforeId = parentPageOrder.getPageBefore(page._id);
    const pageAfterId = parentPageOrder.getPageAfter(page._id);

    let pageToRedirect;
    if (pageBeforeId) {
      pageToRedirect = await Pages.get(pageBeforeId);
    } else if (pageAfterId) {
      pageToRedirect = await Pages.get(pageAfterId);
    } else {
      pageToRedirect = page._parent !== "0" ? await Pages.get(page._parent) : null;
    }

    /**
     * remove current page and go deeper to remove children with orders
     *
     * @param startFrom
     * @returns {Promise<void>}
     */
    async function deleteRecursively(startFrom) {
      let order = [];
      try {
        const children = await PagesOrder.get(startFrom);
        order = children.order;
      } catch (e) {}

      order.forEach(async id => {
        await deleteRecursively(id);
      });

      await Pages.remove(startFrom);
      try {
        await PagesOrder.remove(startFrom);
      } catch (e) {}
    }

    await deleteRecursively(req.params.id);

    // remove also from parent's order
    parentPageOrder.remove(req.params.id);
    await parentPageOrder.save();

    res.json({
      success: true,
      result: pageToRedirect
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
