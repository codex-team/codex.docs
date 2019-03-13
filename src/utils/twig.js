/**
 * Twig extensions
 */
const twig = require('twig');
const fs = require('fs');
const urlify = require('./urlify');

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

  /**
   * Convert text to URL-like string
   * Example: "What is <mark>clean data</mark>" -> "what-is-clean-data"
   *
   * @param {string} string - source string with HTML
   * @returns {string} alias-like string
   */
  twig.extendFilter('urlify', function (string) {
    return urlify(string);
  });
}());
