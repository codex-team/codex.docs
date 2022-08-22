import express from 'express';
import home from './home.js';
import pages from './pages.js';
import auth from './auth.js';
import aliases from './aliases.js';
import api from './api/index.js';
import pagesMiddleware from './middlewares/pages.js';

const router = express.Router();

router.use('/', pagesMiddleware, home);
router.use('/', pagesMiddleware, pages);
router.use('/', pagesMiddleware, auth);
router.use('/api', api);
router.use('/', aliases);

export default router;
