import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rcParser from './utils/rcparser';
import routes from './routes';
import HttpException from './exceptions/httpException';
import * as dotenv from 'dotenv';
import config from 'config';
import HawkCatcher from '@hawk.so/nodejs';


dotenv.config();
const app = express();
const localConfig = rcParser.getConfiguration();

// Initialize the backend error tracking catcher.
if (process.env.HAWK_TOKEN_BACKEND) {
  HawkCatcher.init(process.env.HAWK_TOKEN_BACKEND);
}

app.locals.config = localConfig;
// Set client error tracking token as app local.
if (process.env.HAWK_TOKEN_CLIENT) {
  app.locals.config.hawkClientToken = process.env.HAWK_TOKEN_CLIENT;
}

// view engine setup
app.set('views', path.join(__dirname, './', 'views'));
app.set('view engine', 'twig');
require('./utils/twig');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/uploads', express.static(config.get('uploads')));

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
