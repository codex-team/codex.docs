/**
 * Function for getting hash from stringToHash
 *
 * @param stringToHash - stringToHash to encode
 * @returns {string} - hash index
 */
module.exports = function getHashFromString(stringToHash) {
  return stringToHash.split('').reduce((previousHashValue, currentChar) =>
    (((previousHashValue << 5) - previousHashValue) + currentChar.charCodeAt(0)) | 0, 0);
};
