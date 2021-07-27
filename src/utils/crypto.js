"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
/**
 *
 * @param {string} hexStr - input hex string
 * @returns {string} - output binary string
 */
function hexToBinary(hexStr) {
    return (parseInt(hexStr, 16).toString(2)).padStart(8, '0');
}
/**
 * Create binary md5
 *
 * @param stringToHash - string to hash
 * @returns {string} - binary hash of argument
 */
function binaryMD5(stringToHash) {
    return hexToBinary(crypto_1.default.createHash('md5')
        .update(stringToHash)
        .digest('hex'));
}
/**
 * Returns 16 random bytes in hex format
 *
 * @returns {Promise<string>}
 */
function random16() {
    return new Promise((resolve, reject) => {
        crypto_1.default.randomBytes(16, (err, raw) => {
            if (err) {
                reject(err);
            }
            resolve(raw.toString('hex'));
        });
    });
}
exports.default = {
    binaryMD5,
    random16,
};
