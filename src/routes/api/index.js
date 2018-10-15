const express = require('express');
const router = express.Router();

const pagesAPI = require('./pages');

router.use('/', pagesAPI);

module.exports = router;
