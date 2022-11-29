import copyToClipboard from '../utils/copyToClipboard';

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
   * CSS classes used in the codes
   *
   * @returns {Record<string, string>}
   */
  static get CSS() {
    return {
      page: 'page'
    };
  }

  /**
   * Called by ModuleDispatcher to initialize module from DOM
   */
  init() {
    this.codeStyler = this.createCodeStyling();
    this.tableOfContent = this.createTableOfContent();

    /**
     * Add click event listener
     */
    const page = document.querySelector(`.${Page.CSS.page}`);

    page.addEventListener('click', (event) => { });
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
        tagSelector: '.block-header',
        appendTo: document.getElementById('layout-sidebar-right'),
      });
    } catch (error) {
      console.error(error); // @todo send to Hawk
    }
  }
}
