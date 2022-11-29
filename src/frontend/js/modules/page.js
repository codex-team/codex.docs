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
      copyButton: 'copy-button',
      copyButtonCopied: 'copy-button__copied',
      page: 'page',
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

    page.addEventListener('click', (event) => {
      if (event.target.classList.contains(Page.CSS.copyButton)) {
        this.handleCopyButtonClickEvent(event);
      }
    });
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

  /**
   * Handles copy button click events
   *
   * @param {Event} e - Event Object.
   * @returns {Promise<void>}
   */
  async handleCopyButtonClickEvent({ target }) {
    if (target.classList.contains(Page.CSS.copyButtonCopied)) return;

    let textToCopy = target.getAttribute('data-text-to-copy');
    if (!textToCopy) return;

    // Check if text to copy is an anchor link
    if (/^#\S*$/.test(textToCopy))
      textToCopy = window.location.origin + window.location.pathname + textToCopy;

    try {
      await copyToClipboard(textToCopy);

      target.classList.add(Page.CSS.copyButtonCopied);
      target.addEventListener('mouseleave', () => {
        setTimeout(() => target.classList.remove(Page.CSS.copyButtonCopied), 5e2);
      }, { once: true });

    } catch (error) {
      console.error(error); // @todo send to Hawk
    }
  }
}
