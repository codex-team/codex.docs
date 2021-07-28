"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const translation_1 = __importDefault(require("./translation"));
/**
 * Convert text to URL-like string
 * Example: "What is <mark>clean data</mark>" -> "what-is-clean-data"
 *
 * @param {string} string - source string with HTML
 * @returns {string} alias-like string
 */
function urlify(string) {
    // strip tags
    string = string.replace(/(<([^>]+)>)/ig, '');
    // remove nbsp
    string = string.replace(/&nbsp;/g, ' ');
    // remove all symbols except chars
    string = string.replace(/[^a-zA-Z0-9А-Яа-яЁё ]/g, ' ');
    // remove whitespaces
    string = string.replace(/  +/g, ' ').trim();
    // lowercase
    string = string.toLowerCase();
    // join words with hyphens
    string = string.split(' ').join('-');
    // translate
    string = translation_1.default(string);
    return string;
}
exports.default = urlify;
