import express from 'express';
const router = express.Router();

import home from './home';
import pages from './pages';
import auth from './auth';
import aliases from './aliases';
import api from './api';

import pagesMiddleware from './middlewares/pages';

router.use('/', pagesMiddleware, home);
router.use('/', pagesMiddleware, pages);
router.use('/', pagesMiddleware, auth);
router.use('/api', api);
router.use('/', aliases);

export default router;
