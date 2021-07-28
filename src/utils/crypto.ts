import crypto from 'crypto';

/**
 *
 * @param {string} hexStr - input hex string
 * @returns {string} - output binary string
 */
function hexToBinary(hexStr: string): string {
  return (parseInt(hexStr, 16).toString(2))
    .padStart(8, '0');
}

/**
 * Create binary md5
 *
 * @param stringToHash - string to hash
 * @returns {string} - binary hash of argument
 */
export function binaryMD5(stringToHash: string): string {
  return hexToBinary(crypto.createHash('md5')
    .update(stringToHash)
    .digest('hex'));
}

/**
 * Returns 16 random bytes in hex format
 *
 * @returns {Promise<string>}
 */
export function random16(): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, raw) => {
      if (err) {
        reject(err);
      }

      resolve(raw.toString('hex'));
    });
  });
}

export default {
  binaryMD5,
  random16,
};
