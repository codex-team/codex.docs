import express from 'express';
const router = express.Router();

import pagesAPI from './pages';
import transportAPI from './transport';
import linksAPI from './links';

router.use('/', pagesAPI);
router.use('/', transportAPI);
router.use('/', linksAPI);

export default router;
