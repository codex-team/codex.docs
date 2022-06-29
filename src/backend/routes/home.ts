import express, { Request, Response } from 'express';
import verifyToken from './middlewares/token';
import appConfig from 'config';
import uploadFavicon from '../utils/uploadFavicon';

const router = express.Router();

// Get url to upload favicon from config
const faviconURL: string = appConfig.get('faviconURL');

let fileFormat: string;

// Upload favicon by url, it's path on server is '/temp/favicon.{format}'
uploadFavicon(faviconURL).then((res) => {
  fileFormat = res;
  console.log('Favicon successfully uploaded');
})
  .catch( (err) => {
    console.log(err);
    console.log('Favicon has not uploaded');
  });

/* GET home page. */
router.get('/', verifyToken, async (req: Request, res: Response) => {
  const config = req.app.locals.config;

  if (config.startPage) {
    return res.redirect(config.startPage);
  }
  res.render('pages/index', { isAuthorized: res.locals.isAuthorized,
    faviconFormat: `image/${fileFormat}`,
    faviconRoute: `favicon/favicon.${fileFormat}` });
});

export default router;
