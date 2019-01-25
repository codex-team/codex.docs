require('dotenv').config();
const config = require('../../../config/index');
const jwt = require('jsonwebtoken');

module.exports = async function verifyToken(req, res, next) {
  let token = req.cookies.authToken;
  let isAuthorized = false;

  jwt.verify(token, process.env.PASSWORD + config.secret, (err, decodedToken) => {
    if (err || !decodedToken) {
      return (err);
    } else {
      isAuthorized = true;
    }
  });

  req.isAuthorized = isAuthorized;
  next();
};
