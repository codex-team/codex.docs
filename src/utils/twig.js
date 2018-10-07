/**
 * Twig extensions
 */
const twig = require('twig');
const fs = require('fs');

module.exports = (function () {
  'use strict';

  /**
   * Function for include svg on page
   *
   * @example svg('path/from/root/dir')
   * @param filename - name of icon
   * @returns {String} - svg code
   */
  twig.extendFunction('svg', function (filename) {
    return fs.readFileSync(`${__dirname}/../frontend/svg/${filename}.svg`, 'utf-8');
  });
}());
