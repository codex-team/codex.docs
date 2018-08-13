const express = require('express');
const router = express.Router();
const multer = require('multer')();
const Pages = require('../controllers/pages');

router.get('/page/:id', async (req, res) => {
  try {
    const page = await Pages.get(req.params.id);

    res.json({
        success: true,
        result: page.data
    })
  } catch (err) {
    res.status(400).json({
        success: false,
        error: err.message
    })
  }
});

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

router.put('/page', multer.any(), async (req, res,) => {
  try {
    const page = await Pages.insert(req.body);
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

router.post('/page/:id', multer.any(), async (req, res) => {
  const {id} = req.params;

  try {
    const page = await Pages.update(id, req.body);

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

router.delete('/page/:id', async (req, res) => {
  try {
    const page = await Pages.remove(req.params.id);

    res.json({
      success: true,
      result: page
    })
  } catch (err) {
      res.status(400).json({
          success: false,
          error: err.message
      })
  }
});

module.exports = router;
