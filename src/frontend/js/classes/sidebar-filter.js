/**
 * HEIGHT of the header in px
 */
const HEADER_HEIGHT = parseInt(window.getComputedStyle(
  document.documentElement).getPropertyValue('--layout-height-header'));

/**
 * Enum for the direction of the navigation during the filtering.
 */
const Direction = {
  Next: 1,
  Previous: 2,
};

/**
 * Sidebar Search module.
 */
export default class SidebarFilter {
  /**
   * CSS classes
   *
   * @returns {Record<string, string>}
   */
  static get CSS() {
    return {
      sectionHidden: 'docs-sidebar__section--hidden',
      sectionTitle: 'docs-sidebar__section-title',
      sectionTitleSelected: 'docs-sidebar__section-title--selected',
      sectionTitleActive: 'docs-sidebar__section-title--active',
      sectionList: 'docs-sidebar__section-list',
      sectionListItem: 'docs-sidebar__section-list-item',
      sectionListItemWrapperHidden: 'docs-sidebar__section-list-item-wrapper--hidden',
      sectionListItemSlelected: 'docs-sidebar__section-list-item--selected',
      sidebarSearchWrapper: 'docs-sidebar__search-wrapper',
    };
  }

  /**
   * Creates base properties
   */
  constructor() {
    /**
     * Stores refs to HTML elements needed for sidebar filter to work.
     */
    this.sidebar = null;
    this.sections = [];
    this.sidebarContent = null;
    this.search = null;
    this.searchResults = [];
    this.selectedSearchResultIndex = null;
  }

  /**
   * Initialize sidebar filter.
   *
   * @param {HTMLElement[]} sections - Array of sections.
   * @param {HTMLElement} sidebarContent - Sidebar content.
   * @param {HTMLElement} search - Search input.
   * @param {Function} setSectionCollapsed - Function to set section collapsed.
   */
  init(sections, sidebarContent, search, setSectionCollapsed) {
    // Store refs to HTML elements.
    this.sections = sections;
    this.sidebarContent = sidebarContent;
    this.search = search;
    this.setSectionCollapsed = setSectionCollapsed;
    let shortcutText = 'Ctrl P';

    // Search initialize with platform specific shortcut.
    if (window.navigator.userAgent.indexOf('Mac') !== -1) {
      shortcutText = '⌘ P';
    }
      shortcutText = '⌘ P';
    this.search.parentElement.setAttribute('data-shortcut', shortcutText);

    // Initialize search input.
    this.search.value = '';

    // Add event listener for search input.
    this.search.addEventListener('input', e => {
      e.stopImmediatePropagation();
      e.preventDefault();
      this.filter(e.target.value);
    });
    // Add event listener for keyboard events.
    this.search.addEventListener('keydown', e => this.handleKeyboardEvent(e));
  }

  /**
   * Handle keyboard events while search input is focused.
   *
   * @param {Event} e - Event Object.
   */
  handleKeyboardEvent(e) {
    // Return if search is not focused.
    if (this.search !== document.activeElement) {
      return;
    }

    // handle enter key when item is focused.
    if (e.code === 'Enter' && this.selectedSearchResultIndex !== null) {
      // navigate to focused item.
      this.searchResults[this.selectedSearchResultIndex].element.click();
      // prevent default action.
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }

    // handle up and down navigation.
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      // check for search results.
      if (this.searchResults.length === 0) {
        return;
      }

      // get current focused item.
      const prevSelectedSearchResultIndex = this.selectedSearchResultIndex;

      // get next item to be focus.
      if (e.code === 'ArrowUp') {
        this.selectedSearchResultIndex = this.getNextIndex(
          Direction.Previous,
          this.selectedSearchResultIndex,
          this.searchResults.length - 1);
      } else if (e.code === 'ArrowDown') {
        this.selectedSearchResultIndex = this.getNextIndex(
          Direction.Next,
          this.selectedSearchResultIndex,
          this.searchResults.length - 1);
      }

      // blur previous focused item.
      this.blurTitleOrItem(prevSelectedSearchResultIndex);
      // focus next item.
      this.focusTitleOrItem(this.selectedSearchResultIndex);

      // prevent default action.
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  /**
   * Get index of next item to be focused.
   *
   * @param {number} direction - direction for navigation.
   * @param {number} titleOrItemIndex - Current title or item index.
   * @param {number} maxNumberOfTitlesOrItems - Max number of titles or items.
   * @returns {number} - Next section or item index.
   */
  getNextIndex(direction, titleOrItemIndex, maxNumberOfTitlesOrItems) {
    let nextTitleOrItemIndex = titleOrItemIndex;

    if (direction === Direction.Previous) {
      // if no item is focused, focus last item.
      if (titleOrItemIndex === null) {
        return maxNumberOfTitlesOrItems;
      }

      // focus previous item.
      nextTitleOrItemIndex--;

      // circular navigation.
      if (nextTitleOrItemIndex < 0) {
        nextTitleOrItemIndex = maxNumberOfTitlesOrItems;
      }

      return nextTitleOrItemIndex;
    } else if (direction === Direction.Next) {
      // if no item is focused, focus first item.
      if (titleOrItemIndex === null) {
        return 0;
      }

      // focus next item.
      nextTitleOrItemIndex++;

      // circular navigation.
      if (nextTitleOrItemIndex > maxNumberOfTitlesOrItems) {
        nextTitleOrItemIndex = 0;
      }

      return nextTitleOrItemIndex;
    }
  }

  /**
   * Focus title or item at given index.
   *
   * @param {number} titleOrItemIndex - Title or item index.
   */
  focusTitleOrItem(titleOrItemIndex) {
    // check for valid index.
    if (titleOrItemIndex === null) {
      return;
    }

    const { element, type } = this.searchResults[titleOrItemIndex];

    if (!element || !type) {
      return;
    }

    // focus title or item.
    if (type === 'title') {
      element.classList.add(SidebarFilter.CSS.sectionTitleSelected);
    } else if (type === 'item') {
      element.classList.add(SidebarFilter.CSS.sectionListItemSlelected);
    }

    // scroll to focused title or item.
    this.scrollToTitleOrItem(element);
  }

  /**
   * Blur title or item at given index.
   *
   * @param {number} titleOrItemIndex - Title or item index.
   */
  blurTitleOrItem(titleOrItemIndex) {
    // check for valid index.
    if (titleOrItemIndex === null) {
      return;
    }

    const { element, type } = this.searchResults[titleOrItemIndex];

    if (!element || !type) {
      return;
    }

    // blur title or item.
    if (type === 'title') {
      element.classList.remove(SidebarFilter.CSS.sectionTitleSelected);
    } else if (type === 'item') {
      element.classList.remove(SidebarFilter.CSS.sectionListItemSlelected);
    }
  }

  /**
   * Scroll to title or item.
   *
   * @param {HTMLElement} titleOrItem - Title or item element.
   */
  scrollToTitleOrItem(titleOrItem) {
    // check if it's visible.
    const rect = titleOrItem.getBoundingClientRect();
    let elemTop = rect.top;
    let elemBottom = rect.bottom;
    const halfOfViewport = window.innerHeight / 2;
    const scrollTop = this.sidebarContent.scrollTop;

    // scroll top if item is not visible.
    if (elemTop < HEADER_HEIGHT) {
      // scroll half viewport up.
      const nextTop = scrollTop - halfOfViewport;

      // check if element visible after scroll.
      elemTop = (elemTop + nextTop) < HEADER_HEIGHT ? elemTop : nextTop;
      this.sidebarContent.scroll({
        top: elemTop,
        behavior: 'smooth',
      });
    } else if (elemBottom > window.innerHeight) {
      // scroll bottom if item is not visible.
      // scroll half viewport down.
      const nextDown = halfOfViewport + scrollTop;

      // check if element visible after scroll.
      elemBottom = (elemBottom - nextDown) > window.innerHeight ? elemBottom : nextDown;
      this.sidebarContent.scroll({
        top: elemBottom,
        behavior: 'smooth',
      });
    }
  }

  /**
   * Check if content contains search text.
   *
   * @param {string} content - content to be searched.
   * @param {string} searchValue - Search value.
   * @returns {boolean} - true if content contains search value.
   */
  isValueMatched(content, searchValue) {
    return content.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1;
  }

  /**
   * filter sidebar items.
   *
   * @param {HTMLElement} section - Section element.
   * @param {string} searchValue - Search value.
   */
  filterSection(section, searchValue) {
    // match with section title.
    const sectionTitle = section.querySelector('.' + SidebarFilter.CSS.sectionTitle);
    const sectionList = section.querySelector('.' + SidebarFilter.CSS.sectionList);

    // check if section title matches.
    const isTitleMatch = this.isValueMatched(sectionTitle.textContent, searchValue);

    const matchResults = [];
    // match with section items.
    let isSingleItemMatch = false;

    if (sectionList) {
      const sectionListItems = sectionList.querySelectorAll('.' + SidebarFilter.CSS.sectionListItem);

      sectionListItems.forEach(item => {
        if (this.isValueMatched(item.textContent, searchValue)) {
          // remove hiden class from item.
          item.parentElement.classList.remove(SidebarFilter.CSS.sectionListItemWrapperHidden);
          // add item to search results.
          matchResults.push({
            element: item,
            type: 'item',
          });
          isSingleItemMatch = true;
        } else {
          // hide item if it is not a match.
          item.parentElement.classList.add(SidebarFilter.CSS.sectionListItemWrapperHidden);
        }
      });
    }
    if (!isTitleMatch && !isSingleItemMatch) {
      // hide section if it's items are not a match.
      section.classList.add(SidebarFilter.CSS.sectionHidden);
    } else {
      const parentSection = sectionTitle.closest('section');

      // if item is in collapsed section, expand it.
      if (!parentSection.classList.contains(SidebarFilter.CSS.sectionTitleActive)) {
        this.setSectionCollapsed(parentSection, false);
      }
      // show section if it's items are a match.
      section.classList.remove(SidebarFilter.CSS.sectionHidden);
      // add section title to search results.
      this.searchResults.push({
        element: sectionTitle,
        type: 'title',
      }, ...matchResults);
    }
  }

  /**
   * Filter sidebar sections.
   *
   * @param {string} searchValue - Search value.
   */
  filter(searchValue) {
    // remove selection from previous search results.
    this.blurTitleOrItem(this.selectedSearchResultIndex);
    // empty selected index.
    this.selectedSearchResultIndex = null;
    // empty search results.
    this.searchResults = [];
    // match search value with sidebar sections.
    this.sections.forEach(section => {
      this.filterSection(section, searchValue);
    });
  }
}
