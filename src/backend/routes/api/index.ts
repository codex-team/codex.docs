import express from 'express';
import pagesAPI from './pages.js';
import transportAPI from './transport.js';
import linksAPI from './links.js';

const router = express.Router();

router.use('/', pagesAPI);
router.use('/', transportAPI);
router.use('/', linksAPI);

export default router;
