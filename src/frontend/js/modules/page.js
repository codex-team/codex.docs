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
   */
  init() {
    this.codeStyler = this.createCodeStyling();
    this.tableOfContent = this.createTableOfContent();
    this.search = this.createSearch();
  }

  /**
   * Init code highlighting
   */
  async createCodeStyling() {
    const { default: CodeStyler } = await import(/* webpackChunkName: "code-styling" */ './../classes/codeStyler');

    try {
      // eslint-disable-next-line no-new
      new CodeStyler({
        selector: '.block-code__content',
      });
    } catch (error) {
      console.error(error); // @todo send to Hawk
    }
  }

  /**
   * Init table of content
   *
   * @returns {Promise<TableOfContent>}
   */
  async createTableOfContent() {
    const { default: TableOfContent } = await import(/* webpackChunkName: "table-of-content" */ '../classes/table-of-content');

    try {
      // eslint-disable-next-line no-new
      new TableOfContent({
        tagSelector:
          'h2.block-header--anchor,' +
          'h3.block-header--anchor,' +
          'h4.block-header--anchor',
        appendTo: document.getElementById('layout-sidebar-right'),
      });
    } catch (error) {
      console.error(error); // @todo send to Hawk
    }
  }
}
