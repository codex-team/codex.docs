import * as Decorators from '../utils/decorators';
import * as $ from '../utils/dom';

/**
 * Generate dynamic table of content
 */
export default class TableOfContent {
  /**
   * Initialize table of content
   *
   * @param {object} options - constructor params
   * @param {string} options.tagSelector - selector for tags to observe
   * @param {HTMLElement} options.appendTo - element for appending of the table of content
   */
  constructor({ tagSelector, appendTo }) {
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
     * Element to append the Table of Content
     */
    this.tocParentElement = appendTo;

    if (!this.tocParentElement) {
      throw new Error('Table of Content wrapper not found');
    }

    this.nodes = {
      /**
       * Main Table of Content element
       */
      wrapper: null,

      /**
       * List of Table of Content links
       */
      items: [],
    };

    /**
     * Currently highlighted element of ToC
     */
    this.activeItem = null;

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
     * Calculate bounds for each tag and watch active section
     */
    this.calculateBounds();
    this.watchActiveSection();
  }

  /**
   * Find all section tags on the page
   *
   * @returns {HTMLElement[]}
   */
  getSectionTagsOnThePage() {
    return Array.from(document.querySelectorAll(this.tagSelector));
  }

  /**
   * Calculate top line position for each tag
   */
  calculateBounds() {
    this.tagsSectionsMap = this.tags.map((tag) => {
      const rect = tag.getBoundingClientRect();
      const top = Math.floor(rect.top + window.scrollY);

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
    /**
     * Where content zone starts in document
     */
    const contentTopOffset = this.getScrollPadding();

    /**
     * Additional offset for correct calculation of active section
     *
     * Cause opening page with anchor could scroll almost
     * near to the target section and we need to add 1px to calculations
     */
    const activationOffset = 1;

    const detectSection = () => {
      /**
       * Calculate scroll position
       *
       * @todo research how not to use magic number
       */
      const scrollPosition = contentTopOffset + window.scrollY + activationOffset;

      /**
       * Find the nearest section above the scroll position
       */
      const section = this.tagsSectionsMap.filter((tag) => {
        return tag.top <= scrollPosition;
      }).pop();

      /**
       * If section found then set it as active
       */
      if (section) {
        const targetLink = section.tag.querySelector('a').getAttribute('href');

        this.setActiveItem(targetLink);
      } else {
        /**
         * Otherwise no active link will be highlighted
         */
        this.setActiveItem(null);
      }
    };

    /**
     * Define a flag to reduce number of calls to detectSection function
     */
    const throttledDetectSectionFunction = Decorators.throttle(() => {
      detectSection();
    }, 400);

    /**
     * Scroll listener
     */
    document.addEventListener('scroll', throttledDetectSectionFunction, {
      passive: true,
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
    this.tocElement = $.make('section', this.CSS.tocElement);

    this.tags.forEach((tag) => {
      const linkTarget = tag.querySelector('a').getAttribute('href');

      const linkWrapper = $.make('li', this.CSS.tocElementItem);
      const linkBlock = $.make('a', null, {
        innerText: tag.innerText.trim(),
        href: `${linkTarget}`,
      });

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

      this.nodes.items.push(linkWrapper);
    });
  }

  /**
   * Add table of content to the page
   */
  addTableOfContent() {
    this.nodes.wrapper = $.make('section', this.CSS.tocContainer);

    const header = $.make('header', this.CSS.tocHeader, {
      textContent: 'On this page',
    });

    this.nodes.wrapper.appendChild(header);
    this.nodes.wrapper.appendChild(this.tocElement);

    this.tocParentElement.appendChild(this.nodes.wrapper);
  }

  /**
   * Highlight link's item with a given href
   *
   * @param {string|null} targetLink - href of the link. Null if we need to clear all highlights
   */
  setActiveItem(targetLink) {
    /**
     * Clear current highlight
     */
    if (this.activeItem) {
      this.activeItem.classList.remove(this.CSS.tocElementItemActive);
    }

    /**
     * If targetLink is null, that means we reached top, nothing to highlight
     */
    if (targetLink === null) {
      this.activeItem = null;

      return;
    }

    /**
     * Looking for a target link
     *
     * @todo do not fire DOM search, use saved map instead
     */
    const targetElement = this.tocElement.querySelector(`a[href="${targetLink}"]`);

    /**
     * Getting link's wrapper
     */
    const listItem = targetElement.parentNode;

    /**
     * Highlight and save current item
     */
    listItem.classList.add(this.CSS.tocElementItemActive);
    this.activeItem = listItem;

    /**
     * If need, scroll parent to active item
     */
    this.scrollToActiveItemIfNeeded();
  }

  /**
   * Document scroll ending callback
   *
   * @returns {void}
   */
  scrollToActiveItemIfNeeded() {
    /**
     * Do nothing if the Table of Content has no internal scroll at this page
     *
     * @todo compute it once
     */
    const hasScroll = this.nodes.wrapper.scrollHeight > this.nodes.wrapper.clientHeight;

    if (!hasScroll) {
      return;
    }


    /**
     * If some item is highlighted, check whether we need to scroll to it or not
     */
    if (this.activeItem) {
      /**
       * First, check do we need to scroll to item?
       *   We need to scroll in case when:
       *   item bottom coord is bigger than parent height + current parent scroll
       *
       * @todo use memoization for calculating of the itemBottomCoordWithPadding
       */
      const itemOffsetTop = this.activeItem.offsetTop;
      const itemHeight = this.activeItem.offsetHeight;
      const itemBottomCoord = itemOffsetTop + itemHeight;
      const scrollPadding = 10; // scroll offset below/above item
      const itemBottomCoordWithPadding = itemBottomCoord + scrollPadding;
      const itemTopCoordWithPadding = itemOffsetTop - scrollPadding;

      const scrollableParentHeight = this.nodes.wrapper.offsetHeight; // @todo compute it once
      const scrollableParentScrolledDistance = this.nodes.wrapper.scrollTop;

      /**
       * Scroll bottom required if item ends below the parent bottom boundary
       */
      const isScrollDownRequired = itemBottomCoordWithPadding > scrollableParentHeight + scrollableParentScrolledDistance;

      /**
       * Scroll upward required when item starts above the visible parent zone
       */
      const isScrollUpRequired = itemTopCoordWithPadding < scrollableParentScrolledDistance;

      /**
       * If item is fully visible, scroll is not required
       */
      const isScrollRequired = isScrollDownRequired || isScrollUpRequired;


      if (isScrollRequired === false) {
        /**
         * Item is visible, scroll is not needed
         */
        return;
      }

      /**
       * Now compute the scroll distance to make item visible
       */
      let distanceToMakeItemFullyVisible;


      if (isScrollDownRequired) {
        distanceToMakeItemFullyVisible = itemBottomCoordWithPadding - scrollableParentHeight;
      } else { // scrollUpRequired=true
        distanceToMakeItemFullyVisible = itemTopCoordWithPadding;
      }

      /**
       * Change the scroll
       * Using RAF to prevent overloading of regular scroll animation FPS
       */
      window.requestAnimationFrame(() => {
        this.nodes.wrapper.scrollTop = distanceToMakeItemFullyVisible;
      });
    }
  }

  /**
   * Get scroll padding top value from HTML element
   *
   * @returns {number}
   */
  getScrollPadding() {
    const defaultScrollPaddingValue = 0;

    /**
     * Try to get calculated value or fallback to default value
     */
    try {
      /**
       * Getting the HTML element
       */
      const htmlElement = document.documentElement;

      /**
       * Getting css scroll padding value
       */
      const scrollPaddingTopValue = window.getComputedStyle(htmlElement)
        .getPropertyValue('scroll-padding-top');

      /**
       * Parse value to number
       */
      return parseInt(scrollPaddingTopValue, 10);
    } catch (e) {}

    /**
     * On any errors return default value
     */
    return defaultScrollPaddingValue;
  }
}
