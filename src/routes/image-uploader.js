const express = require('express');
const router = express.Router();
const Capella = require('@codexteam/capella-pics');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now());
  }
});
const upload = multer({ storage: storage });

router.post('/uploadImage', upload.single('image'), async function (req, res, next) {
  try {
    let capella = new Capella();
    let body = req.file;

    let response = {};

    console.log(body);

    await new Promise(resolve => {
      capella.uploadFile(body.path, function (resp) {
        response = resp;

        resolve();
      });
    });

    res.json({
      success: true,
      file: {
        url: response.url,
        width: response.width,
        height: response.height,
        color: response.color
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

router.post('/uploadImageByURL', multer().any(), async function (req, res, next) {
  try {
    let capella = new Capella();
    let body = req.body;

    let response = {};

    await new Promise(resolve => {
      capella.uploadFileByURL(body.url, function (resp) {
        response = resp;

        resolve();
      });
    });

    res.json({
      success: true,
      file: {
        url: response.url,
        width: response.width,
        height: response.height,
        color: response.color
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
