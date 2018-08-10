const express = require('express');
const router = express.Router();
const multer = require('multer')();
const Pages = require('../controllers/pages');

/* GET users listing. */
router.put('/page', multer.any(), async (req, res,) => {

  try {
    const page = await Pages.insert(req.body);
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

router.post('/page/:id', multer.any(), async (req, res) => {
  const {id} = req.params;

  console.log(id);

  try {
    const page = await Pages.update(id, req.body);

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
})

router.put

module.exports = router;
