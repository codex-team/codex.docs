import translateString from './translation.js';

/**
 * Convert text to URL-like string
 * Example: "What is <mark>clean data</mark>" -> "what-is-clean-data"
 *
 * @param {string} string - source string with HTML
 * @returns {string} alias-like string
 */
export default function urlify(string: string): string {
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
  string = translateString(string);

  return string;
}
