"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Twig extensions
 */
const twig_1 = __importDefault(require("twig"));
const fs_1 = __importDefault(require("fs"));
const urlify_1 = __importDefault(require("./urlify"));
exports.default = (function () {
    'use strict';
    /**
     * Function for include svg on page
     *
     * @example svg('path/from/root/dir')
     * @param {string} filename - name of icon
     * @returns {string} - svg code
     */
    twig_1.default.extendFunction('svg', function (filename) {
        return fs_1.default.readFileSync(`${__dirname}/../frontend/svg/${filename}.svg`, 'utf-8');
    });
    /**
     * Convert text to URL-like string
     * Example: "What is <mark>clean data</mark>" -> "what-is-clean-data"
     *
     * @param {string} string - source string with HTML
     * @returns {string} alias-like string
     */
    twig_1.default.extendFilter('urlify', function (string) {
        return urlify_1.default(string);
    });
    /**
     * Parse link as URL object
     *
     * @param {string} linkUrl - link to be processed
     * @returns {UrlWithStringQuery} — url data
     */
    twig_1.default.extendFunction('parseLink', function (linkUrl) {
        try {
            return new URL(linkUrl).toString();
        }
        catch (e) {
            console.log(e);
            return "";
        }
    });
}());
