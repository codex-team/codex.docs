const express = require('express');
const router = express.Router();

const home = require('./home');
const pages = require('./pages');
const api = require('./api');

router.use('/', home);
router.use('/', pages);
router.use('/api', api);

module.exports = router;
