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
    const {title, body, parent, putAbovePageId} = req.body;
    let page = await Pages.get(id);

    if (page._parent !== parent) {
      await PagesOrder.move(page._parent, parent, id);
    } else {
      if (putAbovePageId && putAbovePageId !== '0') {
        await PagesOrder.update(page._id, page._parent, putAbovePageId);
      }
    }

    page = await Pages.update(id, {title, body, parent});
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
    const page = await Pages.remove(req.params.id);

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

module.exports = router;
