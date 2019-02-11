module.exports = function allowEdit(req, res, next) {
  if (res.locals.isAuthorized) {
    next();
  } else {
    res.redirect('/auth');
  }
};
