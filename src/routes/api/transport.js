const express = require('express');
const router = express.Router();
const multer = require('multer')
const Transport = require('../../controllers/transport');

/**
 * Multer middleware for image uploading
 */
const imageUploader = multer({
  dest: 'public/uploads/',
  fileFilter: (req, file, cb) => {
    if (!/image/.test(file.mimetype)) {
      cb(null, false);
      return;
    }

    cb(null, true);
  }
}).fields([{name: 'image', maxCount: 1}]);

/**
 * Multer middleware for file uploading
 */
const fileUploader = multer({
  dest: 'public/uploads/',
}).fields([{name: 'file', maxCount: 1}]);

/**
 * Accepts images to upload
 */
router.post('/transport/image', imageUploader, async (req, res) => {
  let response = {success: 0};

  if (!req.files.image) {
    res.status(400).json(response);
    return;
  }

  try {
    Object.assign(response, await Transport.save(req.files.image[0], JSON.parse(req.body.map)));

    response.success = 1;
    res.status(200).json(response);
  } catch (e) {
    res.status(500).json(response);
  }
});

/**
 * Accepts files to upload
 */
router.post('/transport/file', fileUploader, async (req, res) => {
  let response = {success: 0};

  if (!req.files.file) {
    res.status(400).json(response);
    return;
  }

  try {
    Object.assign(response, await Transport.save(req.files.file[0], JSON.parse(req.body.map)));

    response.success = 1;
    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(response);
  }
});

/**
 * Accept file url to fetch
 */
router.post('/transport/fetch', multer().none(), async (req, res) => {
  let response = {success: 0};

  if (!req.body.url) {
    res.status(400).json(response);
    return;
  }

  try {
    Object.assign(response, await Transport.fetch(req.body.url, JSON.parse(req.body.map)));

    response.success = 1;
    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(response);
  }
});

module.exports = router;
