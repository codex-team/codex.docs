/**
 * Generate dynamic table of content
 */
export default class TableOfContent {
  /**
   * Initialize table of content
   *
   * @param {string} tagSelector - selector for tags to observe
   * @param {string} tocParentElement - selector for table of content wrapper
   */
  constructor({ tagSelector, tocParentElement }) {
    /**
     * Array of tags to observe
     */
    this.tags = [];

    /**
     * Selector for tags to observe
     */
    this.tagSelector = tagSelector || 'h2,h3,h4';

    /**
     * Selector for table of content wrapper
     */
    this.tocParentElement = tocParentElement;

    this.CSS = {
      tocContainer: 'table-of-content',
      tocHeader: 'table-of-content__header',
      tocElement: 'table-of-content__list',
      tocElementItem: 'table-of-content__list-item',
      tocElementItemActive: 'table-of-content__list-item--active',
      tocElementItemIndent: number => `table-of-content__list-item--indent-${number}x`,
    };

    this.init();
  }

  /**
   * Initialize table of content
   */
  init() {
    this.tags = this.getSectionTagsOnThePage();

    /**
     * Check if no tags found then table of content is not needed
     */
    if (this.tags.length === 0) {
      return;
    }

    this.createTableOfContent();
    this.addTableOfContent();
    this.initIntersectionObserver();
  }

  /**
   * Find all tags on the page
   *
   * @return {HTMLElement[]}
   */
  getSectionTagsOnThePage() {
    return Array.from(document.querySelectorAll(this.tagSelector));
  }

  /**
   * Create table of content
   *
   * <section>
   *   <header>On this page</header>
   *   <ul>
   *     <li><a href="#"></a></li>
   *     ...
   *   </ul>
   * </section>
   */
  createTableOfContent() {
    this.tocElement = document.createElement('section');
    this.tocElement.classList.add(this.CSS.tocElement);

    this.tags.forEach((tag) => {
      const linkTarget = tag.querySelector('a').getAttribute('href');

      const linkWrapper = document.createElement('li');
      const linkBlock = document.createElement('a');

      linkBlock.innerText = tag.innerText;
      linkBlock.href = `${linkTarget}`;

      linkWrapper.classList.add(this.CSS.tocElementItem);

      /**
       * Additional indent for h3-h6 headers
       */
      switch (tag.tagName.toLowerCase()) {
        case 'h3':
          linkWrapper.classList.add(this.CSS.tocElementItemIndent(1));
          break;
        case 'h4':
          linkWrapper.classList.add(this.CSS.tocElementItemIndent(2));
          break;
        case 'h5':
          linkWrapper.classList.add(this.CSS.tocElementItemIndent(3));
          break;
        case 'h6':
          linkWrapper.classList.add(this.CSS.tocElementItemIndent(4));
          break;
      }

      linkWrapper.appendChild(linkBlock);
      this.tocElement.appendChild(linkWrapper);
    });
  }

  /**
   * Add table of content to the page
   */
  addTableOfContent() {
    const header = document.createElement('header');
    const container = document.createElement('section');

    header.innerText = 'On this page';
    header.classList.add(this.CSS.tocHeader);
    container.appendChild(header);

    container.classList.add(this.CSS.tocContainer);
    container.appendChild(this.tocElement);

    const tocWrapper = document.querySelector(this.tocParentElement);

    if (!tocWrapper) {
      throw new Error('Table of content wrapper not found');
    }

    tocWrapper.appendChild(container);
  }

  /**
   * Init intersection observer
   */
  initIntersectionObserver() {
    const options = {
      rootMargin: '-5% 0 -60%',
    };

    const callback = (entries) => {
      entries.forEach((entry) => {
        const target = entry.target;
        const targetLink = target.querySelector('a').getAttribute('href');

        /**
         * Intersection state of block
         *
         * @type {boolean}
         */
        const isVisible = entry.isIntersecting;

        /**
         * Calculate scroll direction whith the following logic:
         *
         * DOWN: if block top is BELOW (coordinate value is greater) the intersection root top
         * and block is NOT VISIBLE
         *
         * DOWN: if block top is ABOVE (coordinate value is less) the intersection root top
         * and block is VISIBLE
         *
         * UP: if block top is ABOVE (coordinate value is less) the intersection root top
         * and block is visible
         *
         * UP: if block top is BELOW (coordinate value is greater) the intersection root top
         * and block is NOT VISIBLE
         *
         * Therefore we can use XOR operator for
         * - is block's top is above root's top
         * - is block visible
         *
         * @type {string}
         */
        const scrollDirection = ((entry.boundingClientRect.top < entry.rootBounds.top) ^ (entry.isIntersecting)) ? 'down' : 'up';

        /**
         * If a header becomes VISIBLE on scroll DOWN
         * then highlight its link
         *
         * = moving to the new chapter
         */
        if (isVisible && scrollDirection === 'down') {
          this.setActiveLink(targetLink);
        }

        /**
         * If a header becomes NOT VISIBLE on scroll UP
         * then highlight previous link
         *
         * = moving to the previous chapter
         */
        if (!isVisible && scrollDirection === 'up') {
          this.setActiveLink(targetLink, true);
        }
      });
    };

    /**
     * Create intersection observer
     */
    this.observer = new IntersectionObserver(callback, options);

    /**
     * Add observer to found tags
     */
    this.tags.reverse().forEach((tag) => {
      this.observer.observe(tag);
    });
  }

  /**
   * Highlight link's item with a given href
   *
   * @param {string} targetLink - href of the link
   * @param {boolean} [needHighlightPrevious=false] - need to highlight previous link instead of current
   */
  setActiveLink(targetLink, needHighlightPrevious = false) {
    /**
     * Clear all links
     */
    this.tocElement.querySelectorAll(this.CSS.tocElementItem).forEach((link) => {
      link.classList.remove(this.CSS.tocElementItemActive);
    });

    /**
     * Looking for a target link
     */
    const targetElement = this.tocElement.querySelector(`a[href="${targetLink}"]`);

    /**
     * Getting link's wrapper
     */
    let listItem = targetElement.parentNode;

    /**
     * Change target list item if it is needed
     */
    if (needHighlightPrevious) {
      listItem = listItem.previousSibling;
    }

    /**
     * If target list item is found then highlight it
     */
    if (listItem) {
      listItem.classList.add(this.CSS.tocElementItemActive);
    }
  }
}
