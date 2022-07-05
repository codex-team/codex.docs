/**
 * @typedef {object} pageModuleSettings
 */

/**
 * @class Page
 * @classdesc Class for page module
 */
export default class Page {
  /**
   * Creates base properties
   */
  constructor() {
    this.codeStyler = null;
    this.tableOfContent = null;
  }

  /**
   * Called by ModuleDispatcher to initialize module from DOM
   * @param {pageModuleSettings} settings - module settings
   * @param {HTMLElement} moduleEl - module element
   */
  init(settings = {}, moduleEl) {
    this.codeStyler = this.createCodeStyling();
    this.tableOfContent = this.createTableOfContent();
  }

  /**
   * Init code highlighting
   */
  async createCodeStyling() {
    const { default: CodeStyler } = await import(/* webpackChunkName: "code-styling" */ './../classes/codeStyler');

    return new CodeStyler({
      selector: '.block-code__content',
    });
  }

  /**
   * Init table of content
   * @return {Promise<TableOfContent>}
   */
  async createTableOfContent() {
    const { default: TableOfContent } = await import(/* webpackChunkName: "table-of-content" */ '../classes/table-of-content');

    return new TableOfContent({
      tagSelector:
        'h2.block-header--anchor,' +
        'h3.block-header--anchor,' + 
        'h4.block-header--anchor',
      tocWrapperSelector: '#layout-sidebar-right',
    });
  }
}
