import express from 'express';

import pagesAPI from './pages';
import transportAPI from './transport';
import linksAPI from './links';
import searchAPI from './search';

const router = express.Router();

router.use('/', pagesAPI);
router.use('/', transportAPI);
router.use('/', linksAPI);
router.use('/', searchAPI);

export default router;
