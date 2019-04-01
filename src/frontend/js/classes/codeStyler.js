import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import css from 'highlight.js/lib/languages/css';
import style from 'highlight.js/styles/github-gist.css'; // eslint-disable-line no-unused-vars
import diffStyles from '../../styles/diff.pcss'; // eslint-disable-line no-unused-vars

/**
 * @class CodeStyles
 * @classdesc Provides styling for code blocks
 */
export default class CodeStyler {
  /**
   * @param {string} selector - CSS selector for code blocks
   * @param {string[]} languages - list of languages to highlight, see hljs.listLanguages()
   */
  constructor({ selector, languages = ['javascript', 'xml', 'json', 'css'] }) {
    this.codeBlocksSelector = selector;
    this.languages = languages;
    this.langsAvailable = {
      javascript,
      xml,
      json,
      css
    };

    this.init();
  }

  /**
   * Start to highlight
   */
  init() {
    const codeBlocks = document.querySelectorAll(this.codeBlocksSelector);

    if (!codeBlocks.length) {
      return;
    }

    this.languages.forEach(lang => {
      hljs.registerLanguage(lang, this.langsAvailable[lang]);
    });

    hljs.configure({
      languages: this.languages
    });

    Array.from(codeBlocks).forEach(block => {
      hljs.highlightBlock(block);

      block.innerHTML = block.innerHTML.replace(/\n([+].*)/ig, '\n<span class="diff diff-plus">$1</span>');
      block.innerHTML = block.innerHTML.replace(/\n([-].*)/ig, '\n<span class="diff diff-minus">$1</span>');
    });
  }
}
