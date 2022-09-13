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
      page: 'page',
      copyLinkBtn: 'block-header__copy-link',
      header: 'block-header--anchor',
      headerLinkCopied: 'block-header--link-copied',
    };
  }

  /**
   * Called by ModuleDispatcher to initialize module from DOM
   */
  init() {
    this.codeStyler = this.createCodeStyling();
    this.tableOfContent = this.createTableOfContent();

    /**
     * Add click event listener to capture copy link button clicks
     */
    const page = document.querySelector(`.${Page.CSS.page}`);

    page.addEventListener('click', this.copyAnchorLinkIfNeeded);
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

  /**
   * Checks if 'copy link' button was clicked and copies the link to clipboard
   *
   * @param e - click event
   */
  copyAnchorLinkIfNeeded = async (e) => {
    const copyLinkButtonClicked = e.target.closest(`.${Page.CSS.copyLinkBtn}`);

    if (!copyLinkButtonClicked) {
      return;
    }

    const header = e.target.closest(`.${Page.CSS.header}`);
    const link = header.querySelector('a').href;

    await copyToClipboard(link);
    header.classList.add(Page.CSS.headerLinkCopied);

    header.addEventListener('mouseleave', () => {
      setTimeout(() => {
        header.classList.remove(Page.CSS.headerLinkCopied);
      }, 500);
    }, { once: true });
  }
}
