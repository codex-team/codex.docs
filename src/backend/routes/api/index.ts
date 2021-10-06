import express from 'express';
import pagesAPI from './pages';
import transportAPI from './transport';
import linksAPI from './links';

const router = express.Router();

router.use('/', pagesAPI);
router.use('/', transportAPI);
router.use('/', linksAPI);

export default router;
