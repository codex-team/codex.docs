const crypto = require('crypto');

/**
 * Create binary md5
 * @param stringToHash - string to hash
 * @returns {string} - binary hash of argument
 */
module.exports = function md5(stringToHash) {
  return crypto.createHash('md5')
    .update(stringToHash)
    .digest('binary');
};
