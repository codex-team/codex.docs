// No inspection for unused var `css` because it's used for css bundle
// eslint-disable-next-line no-unused-vars
import '../styles/main.pcss';

/**
 * Module Dispatcher
 *
 * @see {@link https://github.com/codex-team/moduleDispatcher}
 * @author CodeX
 */
import ModuleDispatcher from 'module-dispatcher';

/**
 * Import modules
 */
import Writing from './modules/writing';
import Page from './modules/page';
import Extensions from './modules/extensions';
import Sidebar from './modules/sidebar';
import Search from './modules/search';
import HawkCatcher from '@hawk.so/javascript';

/**
 * Main app class
 */
class Docs {
  /**
   * @class
   */
  constructor() {
    this.writing = new Writing();
    this.page = new Page();
    this.extensions = new Extensions();
    this.sidebar = new Sidebar();
    this.search = new Search();

    if (window.config.hawkClientToken) {
      this.hawk = new HawkCatcher(window.config.hawkClientToken);
    }

    document.addEventListener('DOMContentLoaded', (event) => {
      this.docReady();
    });

    console.log('CodeX Docs initialized');
  }

  /**
   * Document is ready
   */
  docReady() {
    this.moduleDispatcher = new ModuleDispatcher({
      Library: this,
    });
  }
}

export default new Docs();
