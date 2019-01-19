require('dotenv').config();
const config = require('../../../config/index');

const jwt = require('jsonwebtoken');

module.exports = function verifyToken(token) {
  let isAuthorized = false;

  jwt.verify(token, process.env.PASSWORD + config.secret, (err, decodedToken) => {
    if (err || !decodedToken) {
      return (err);
    } else {
      isAuthorized = true;
    }
  });

  return isAuthorized;
};
