require('dotenv').config();
const config = require('../../../config/index');
const jwt = require('jsonwebtoken');

module.exports = async function verifyToken(req, res, next) {
  let token = req.cookies.authToken;

  jwt.verify(token, process.env.PASSHASH + config.secret, (err, decodedToken) => {
    res.locals.isAuthorized = !(err || !decodedToken);
    next();
  });
};
