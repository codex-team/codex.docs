require('dotenv').config();

const jwt = require('jsonwebtoken');

module.exports = function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.PASSWORD, (err, decodedToken) => {
      if (err || !decodedToken) {
        return reject(err);
      }
      resolve(decodedToken);
    });
  });
};
