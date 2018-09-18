// No inspection for unused var `css` because it's used for css bundle
// eslint-disable-next-line no-unused-vars
import css from '../styles/main.pcss';

/**
 * Module Dispatcher
 * @see {@link https://github.com/codex-team/moduleDispatcher}
 * @author CodeX
 */
import ModuleDispatcher from 'module-dispatcher';

/**
 * Import modules
 */
import Writing from './modules/writing';

/**
 * Main app class
 */
class Docs {
  /**
   * @constructor
   */
  constructor() {
    console.log('CodeX Docs initialized');
    this.writing = new Writing();

    document.addEventListener('DOMContentLoaded', (event) => {
      this.docReady();
    });
  }

  /**
   * Document is ready
   */
  docReady() {
    this.moduleDispatcher = new ModuleDispatcher({
      Library: window.Docs
    });
  }
}

module.exports = new Docs();
