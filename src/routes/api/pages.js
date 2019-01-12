const express = require('express');
const router = express.Router();
const multer = require('multer')();
const Pages = require('../../controllers/pages');

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

    /**
     * Each new page push to order at the last
     */
    if (parent && parent !== '0') {
      const parentPage = await Pages.get(page._parent);

      /** Push to parents children order */
      parentPage.childrenOrder.push(page._id);
      parentPage.save();
    }

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
    const page = await Pages.update(id, {title, body, parent});

    /** update child order */
    if (parent && parent !== '0') {
      const parentPage = await Pages.get(parent);
      const found1 = parentPage.childrenOrder.indexOf(putAbovePageId);
      const found2 = parentPage.childrenOrder.indexOf(id);

      if (found1 < found2) {
        for(let i = found2; i >= found1; i--) {
          parentPage.childrenOrder[i] = parentPage.childrenOrder[i - 1];
        }
        parentPage.childrenOrder[found1] = id;
      } else {
        for(let i = found2; i < found1; i++) {
          parentPage.childrenOrder[i] = parentPage.childrenOrder[i + 1];
        }
        parentPage.childrenOrder[found1 - 1] = id;
      }
      parentPage.save();
    }

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
