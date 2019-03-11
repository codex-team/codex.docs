const express = require('express');
const router = express.Router();

const pagesAPI = require('./pages');
const transportAPI = require('./transport');

router.use('/', pagesAPI);
router.use('/', transportAPI);

module.exports = router;
