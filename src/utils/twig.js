/**
 * Twig extensions
 */
const twig = require('twig');
const fs = require('fs');
const urlify = require('./urlify');
const url = require('url');

module.exports = (function () {
  'use strict';

  /**
   * Function for include svg on page
   *
   * @example svg('path/from/root/dir')
   * @param filename - name of icon
   * @returns {string} - svg code
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

  /**
   * Parse link as URL object
   *
   * @param {string} linkUrl - link to be processed
   * @returns {UrlWithStringQuery} — url data
   */
  twig.extendFunction('parseLink', function (linkUrl) {
    try {
      return url.parse(linkUrl);
    } catch (e) {
      console.log(e);
    }
  });
}());
