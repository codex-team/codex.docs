/**
 * Generate dynamic table of content
 */
export default class TableOfContent {
  /**
   * Initialize table of content
   *
   * @param {string} tagSelector - selector for tags to observe
   * @param {string} tocParentElement - selector for table of content wrapper
   * @param {string|null} fixedHeaderSelector - selector for fixed site header
   */
  constructor({ tagSelector, tocParentElement, fixedHeaderSelector = null }) {
    /**
     * Array of tags to observe
     */
    this.tags = [];
    this.tagsSectionsMap = [];

    /**
     * Selector for tags to observe
     */
    this.tagSelector = tagSelector || 'h2,h3,h4';

    /**
     * Selector for table of content wrapper
     */
    this.tocParentElement = tocParentElement;

    /**
     * Selector for getting real height of the fixed header to detect active section correctly
     * @type {null}
     */
    this.fixedHeaderSelector = fixedHeaderSelector;

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

    /**
     * Initialize table of content element
     */
    this.createTableOfContent();
    this.addTableOfContent();

    /**
     * Calculate boundings for each tag and watch active section
     */
    this.calculateBoundings();
    this.watchActiveSection();
  }

  /**
   * Find all section tags on the page
   *
   * @return {HTMLElement[]}
   */
  getSectionTagsOnThePage() {
    return Array.from(document.querySelectorAll(this.tagSelector));
  }

  /**
   * Calculate top line position for each tag
   */
  calculateBoundings() {
    this.tagsSectionsMap = this.tags.map((tag) => {
      const rect = tag.getBoundingClientRect();
      const top = rect.top + window.scrollY;

      return {
        top,
        tag,
      };
    });
  }

  /**
   * Watch active section while scrolling
   */
  watchActiveSection() {
    const detectSection = (scrollPosition) => {
      /**
       * Find the nearest section above the scroll position
       */
      const section = this.tagsSectionsMap.filter((tag) => {
        return tag.top < scrollPosition;
      }).pop();

      /**
       * If section found then set it as active
       */
      if (section) {
        const targetLink = section.tag.querySelector('a').getAttribute('href');

        this.setActiveLink(targetLink);
      } else {
        /**
         * Otherwise no active link will be highlighted
         */
        this.setActiveLink();
      }
    };

    /**
     * Define a flag to reduce number of calls to detectSection function
     */
    let ticking;

    /**
     * Scroll listener
     */
    document.addEventListener('scroll', (event) => {
      /**
       * Calculate scroll position
       */
      let lastKnownScrollPosition = 1 + window.scrollY;

      /**
       * If fixed header is present then calculate scroll position based on it
       */
      if (this.fixedHeaderSelector) {
        const fixedHeader = document.querySelector(this.fixedHeaderSelector);

        if (fixedHeader) {
          lastKnownScrollPosition += fixedHeader.getBoundingClientRect().height;
        } else {
          console.warn(`Fixed header was not found by selector ${this.fixedHeaderSelector}`);
        }
      }

      /**
       * Call section detecting function
       */
      if (!ticking) {
        window.requestAnimationFrame(() => {
          detectSection(lastKnownScrollPosition);

          ticking = false;
        });

        ticking = true;
      }
    });
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
   * Highlight link's item with a given href
   *
   * @param {string} targetLink - href of the link
   * @param {boolean} [needHighlightPrevious=false] - need to highlight previous link instead of current
   */
  setActiveLink(targetLink, needHighlightPrevious = false) {
    /**
     * Clear all links
     */
    this.tocElement.querySelectorAll(`.${this.CSS.tocElementItem}`).forEach((link) => {
      link.classList.remove(this.CSS.tocElementItemActive);
    });

    /**
     * If targetLink is not defined then do nothing
     */
    if (!targetLink) {
      return;
    }

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
