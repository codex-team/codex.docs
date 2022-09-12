import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rcParser from './utils/rcparser.js';
import routes from './routes/index.js';
import HttpException from './exceptions/httpException.js';
import * as dotenv from 'dotenv';
import config from 'config';
import HawkCatcher from '@hawk.so/nodejs';
import os from 'os';
import appConfig from 'config';
import { downloadFavicon, FaviconData } from './utils/downloadFavicon.js';

/**
 * The __dirname CommonJS variables are not available in ES modules.
 * https://nodejs.org/api/esm.html#no-__filename-or-__dirname
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();
const app = express();
const localConfig = rcParser.getConfiguration();

// Initialize the backend error tracking catcher.
if (process.env.HAWK_TOKEN_BACKEND) {
  HawkCatcher.init(process.env.HAWK_TOKEN_BACKEND);
}

// Get url to upload favicon from config
const favicon: string = appConfig.get('favicon');

app.locals.config = localConfig;
// Set client error tracking token as app local.
if (process.env.HAWK_TOKEN_CLIENT) {
  app.locals.config.hawkClientToken = process.env.HAWK_TOKEN_CLIENT;
}

// view engine setup
app.set('views', path.join(__dirname, './', 'views'));
app.set('view engine', 'twig');
import('./utils/twig.js');

const downloadedFaviconFolder = os.tmpdir();

// Check if favicon is not empty
if (favicon) {
  // Upload favicon by url, it's path on server is '/temp/favicon.{format}'
  downloadFavicon(favicon, downloadedFaviconFolder).then((res) => {
    app.locals.favicon = res;
    console.log('Favicon successfully uploaded');
  })
    .catch( (err) => {
      console.log(err);
      console.log('Favicon has not uploaded');
    });
} else {
  console.log('Favicon is empty, using default path');
  app.locals.favicon = {
    destination: '/favicon.png',
    type: 'image/png',
  } as FaviconData;
}

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/uploads', express.static(config.get('uploads')));
app.use('/favicon', express.static(downloadedFaviconFolder));

app.use('/', routes);


// global error handler
app.use(function (err: unknown, req: Request, res: Response, next: NextFunction) {
  // send any type of error to hawk server.
  if (process.env.HAWK_TOKEN_BACKEND && err instanceof Error) {
    HawkCatcher.send(err);
  }
  // only send Http based exception to client.
  if (err instanceof HttpException) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  }
  next(err);
});


export default app;
