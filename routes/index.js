const express = require('express')
const router = express.Router();

const home = require('./home');
const pages = require('./pages');

router.use('/', home);
router.use('/', pages);

module.exports = router;
