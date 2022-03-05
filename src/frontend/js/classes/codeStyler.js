import hljs from 'highlight.js/lib/common';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import css from 'highlight.js/lib/languages/css';
import 'highlight.js/styles/github.css';
import '../../styles/diff.pcss';

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
      css,
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
      languages: this.languages,
    });

    Array.from(codeBlocks).forEach(block => {
      hljs.highlightBlock(block);
      this.highlightDiffs(block);
    });
  }

  /**
   * Highlight lines started from + or -
   * @param {Element} block
   */
  highlightDiffs(block) {
    const lines = block.innerHTML.split('\n').map((line, index) => {
      return line.replace(/^\+(.*)$/ig, '<span class="diff diff--added">$1</span>')
        .replace(/^-(.*)$/ig, '<span class="diff diff--removed">$1</span>');
    });

    block.innerHTML = lines.join('\n');
  }
}
