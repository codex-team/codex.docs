/**
 * Middleware for checking locals.isAuthorized property, which allows to edit/create pages
 * @param req
 * @param res
 * @param next
 */
module.exports = function allowEdit(req, res, next) {
  if (res.locals.isAuthorized) {
    next();
  } else {
    res.redirect('/auth');
  }
};
