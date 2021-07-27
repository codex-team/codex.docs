"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Middleware for checking locals.isAuthorized property, which allows to edit/create pages
 * @param req
 * @param res
 * @param next
 */
function allowEdit(req, res, next) {
    if (res.locals.isAuthorized) {
        next();
    }
    else {
        res.redirect('/auth');
    }
}
exports.default = allowEdit;
;
