const express = require('express');
const router = express.Router();

const pagesAPI = require('./pages');
const transportAPI = require('./transport');
const linksAPI = require('./links');

router.use('/', pagesAPI);
router.use('/', transportAPI);
router.use('/', linksAPI);

module.exports = router;
