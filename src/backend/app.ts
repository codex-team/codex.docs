import express, { Request, Response } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rcParser from './utils/rcparser';
import routes from './routes';
import HttpException from './exceptions/httpException';
import * as dotenv from 'dotenv';
import config from 'config';

dotenv.config();
const app = express();
const localConfig = rcParser.getConfiguration();

app.locals.config = localConfig;
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

// error handler
app.use(function (err: HttpException, req: Request, res: Response) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
