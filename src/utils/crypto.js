const crypto = require('crypto');

/**
 * Create binary md5
 * @param stringToHash - string to hash
 * @returns {string} - binary hash of argument
 */
function binaryMD5(stringToHash) {
  return crypto.createHash('md5')
    .update(stringToHash)
    .digest('binary');
}

/**
 * Returns 16 random bytes in hex format
 * @return {Promise<string>}
 */
function random16() {
  return new Promise((resolve, reject) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      if (err) {
        reject(err);
      }

      resolve(raw.toString('hex'));
    });
  });
}

module.exports = {
  binaryMD5,
  random16
};
