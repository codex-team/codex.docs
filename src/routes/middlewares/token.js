require('dotenv').config();
const config = require('../../../config/index');
const jwt = require('jsonwebtoken');
const Users = require('../../controllers/users');

/**
 * Middleware for checking jwt token
 * @param req
 * @param res
 * @param next
 */
module.exports = async function verifyToken(req, res, next) {
  let token = req.cookies.authToken;
  const userDoc = await Users.get();

  if (!userDoc) {
    res.locals.isAuthorized = false;
    next();
  }

  jwt.verify(token, userDoc.passHash + config.secret, (err, decodedToken) => {
    res.locals.isAuthorized = !(err || !decodedToken);
    next();
  });
};
