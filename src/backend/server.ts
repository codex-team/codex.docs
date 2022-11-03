#!/usr/bin/env node
/**
 * Module dependencies.
 */
import http from 'http';
import Debug from 'debug';
import appConfig from './utils/appConfig.js';
import { drawBanner } from './utils/banner.js';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import HawkCatcher from '@hawk.so/nodejs';
import os from 'os';
import { downloadFavicon, FaviconData } from './utils/downloadFavicon.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import HttpException from './exceptions/httpException.js';

const debug = Debug.debug('codex.docs:server');

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(appConfig.port.toString() || '3000');

/**
 * Create Express server
 */
function createApp(): express.Express {
  /**
   * The __dirname CommonJS variables are not available in ES modules.
   * https://nodejs.org/api/esm.html#no-__filename-or-__dirname
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const cwd = process.cwd();

  const app = express();
  const localConfig = appConfig.frontend;

  // Initialize the backend error tracking catcher.
  if (appConfig.hawk?.backendToken) {
    HawkCatcher.init(appConfig.hawk.backendToken);
  }

  // Get url to upload favicon from config
  const favicon = appConfig.favicon;

  app.locals.config = localConfig;
  // Set client error tracking token as app local.
  if (appConfig.hawk?.frontendToken) {
    app.locals.config.hawkClientToken = appConfig.hawk.frontendToken;
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
      .catch((err) => {
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

  if (appConfig.uploads.driver === 'local') {
    const uploadsPath = path.join(cwd, appConfig.uploads.local.path);

    app.use('/uploads', express.static(uploadsPath));
  }

  app.use('/favicon', express.static(downloadedFaviconFolder));

  app.use('/', routes);


  // global error handler
  app.use(function (err: unknown, req: Request, res: Response, next: NextFunction) {
    // send any type of error to hawk server.
    if (appConfig.hawk?.backendToken && err instanceof Error) {
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

  return app;
}

/**
 * Create and run HTTP server.
 */
export default function runHttpServer(): void {
  const app = createApp();

  app.set('port', port);

  /**
   * Create HTTP server.
   */
  const server = http.createServer(app);

  /**
   * Event listener for HTTP server 'listening' event.
   */
  function onListening(): void {
    const addr = server.address();

    if (addr === null) {
      debug('Address not found');
      process.exit(1);
    }

    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;

    debug('Listening on ' + bind);

    drawBanner([
      `CodeX Docs server is running`,
      ``,
      `Main page: http://localhost:${port}`,
    ]);
  }

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
}

/**
 * Normalize a port into a number, string, or false.
 *
 * @param val
 */
function normalizePort(val: string): number | string | false {
  const value = parseInt(val, 10);

  if (isNaN(value)) {
    // named pipe
    return val;
  }

  if (value >= 0) {
    // port number
    return value;
  }

  return false;
}

/**
 * Event listener for HTTP server 'error' event.
 *
 * @param error
 */
function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
