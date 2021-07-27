"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const rcparser_1 = __importDefault(require("./utils/rcparser"));
const routes_1 = __importDefault(require("./routes"));
const app = express_1.default();
const config = rcparser_1.default.getConfiguration();
app.locals.config = config;
// view engine setup
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'twig');
require('./utils/twig');
app.use(morgan_1.default('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(cookie_parser_1.default());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/', routes_1.default);
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') == 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
exports.default = app;
