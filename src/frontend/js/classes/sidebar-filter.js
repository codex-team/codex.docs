/**
 * HEIGHT of the header in px
 */
const HEADER_HEIGHT = 56;

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
      sectionList: 'docs-sidebar__section-list',
      sectionListItem: 'docs-sidebar__section-list-item',
      sectionListItemWrapperHidden: 'docs-sidebar__section-list-item-wrapper--hidden',
      sectionListItemSlelected: 'docs-sidebar__section-list-item--selected',
      sidebarSearchWrapperMac: 'docs-sidebar__search-wrapper-mac',
      sidebarSearchWrapperOther: 'docs-sidebar__search-wrapper-other',
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

  init(sections, sidebarContent, search)
  {
    this.sections = sections;
    this.sidebarContent = sidebarContent;
    this.search = search;
    let className = SidebarFilter.CSS.sidebarSearchWrapperOther;

    // Search initialize with platform specific shortcut.
    if (window.navigator.userAgent.indexOf('Mac') != -1) {
      className = SidebarFilter.CSS.sidebarSearchWrapperMac;
    }
    this.search.parentElement.classList.add(className);

    // Add event listener for search input.
    this.search.addEventListener('input', e => {
      e.stopImmediatePropagation();
      e.preventDefault();
      this.filterSections(e.target.value);
    });
    // Initialize the search results.
    this.filterSections('');

    // Add event listener for keyboard events.
    this.search.addEventListener('keydown', e => this.handleKeyboardEvent(e));
  }


  /**
   * Handle keyboard events when search input is focused.
   *
   * @param {Event} e - Event Object.
   * @returns {void}
   */
  handleKeyboardEvent(e) {
    // Return if search is not focused.
    if (this.search !== document.activeElement) {
      return;
    }

    // if enter is pressed and item is focused, then click on focused item.
    if (e.code === 'Enter' && this.selectedSearchResultIndex !== null) {
      // goto focused item.
      this.searchResults[this.selectedSearchResultIndex].element.click();
      // prevent default action.
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }

    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      // check for search results.
      if (this.searchResults.length === 0) {
        return;
      }
      // get current focused item.
      const prevSelectedSearchResultIndex = this.selectedSearchResultIndex;

      this.selectedSearchResultIndex = this.getNextSectionOrItemIndex(e.code,
        this.selectedSearchResultIndex,
        this.searchResults.length - 1);

      this.blurSectionOrItem(prevSelectedSearchResultIndex);

      this.focusSectionOrItem(this.selectedSearchResultIndex);

      // prevent default action.
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  getNextSectionOrItemIndex(code, sectionOrItemIndex, maxNumberOfSectionsOrItems) {
    let nextSectionOrItemIndex = sectionOrItemIndex;

    if (code === 'ArrowUp') {
      if (sectionOrItemIndex === null) {
        return maxNumberOfSectionsOrItems;
      }

      nextSectionOrItemIndex--;

      if (nextSectionOrItemIndex < 0) {
        nextSectionOrItemIndex = maxNumberOfSectionsOrItems;
      }

      return nextSectionOrItemIndex;
    }
    else if (code === 'ArrowDown') {
      if (sectionOrItemIndex === null) {
        return 0;
      }

      nextSectionOrItemIndex++;

      if (nextSectionOrItemIndex > maxNumberOfSectionsOrItems) {
        nextSectionOrItemIndex = 0;
      }

      return nextSectionOrItemIndex;
    }
  }

  focusSectionOrItem(sectionOrItemIndex) {
    if (sectionOrItemIndex === null) {
      return;
    }

    const { element, type } = this.searchResults[sectionOrItemIndex];

    if (!element || !type) {
      return;
    }

    if (type === 'title') {
      element.classList.add(SidebarFilter.CSS.sectionTitleSelected);
    } else if (type === 'item') {
      element.classList.add(SidebarFilter.CSS.sectionListItemSlelected);
    }

    this.scrollToSectionOrItem(element);
  }

  blurSectionOrItem(sectionOrItemIndex) {
    if (sectionOrItemIndex === null) {
      return;
    }

    const { element, type } = this.searchResults[sectionOrItemIndex];

    if (!element || !type) {
      return;
    }

    if (type === 'title') {
      element.classList.remove(SidebarFilter.CSS.sectionTitleSelected);
    } else if (type === 'item') {
      element.classList.remove(SidebarFilter.CSS.sectionListItemSlelected);
    }
  }

  scrollToSectionOrItem(sectionOrItem) {
    // check if it's visible.
    const rect = sectionOrItem.getBoundingClientRect();
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

  filterSections(searchValue) {
    // remove selection from previous search results.
    this.blurSectionOrItem(this.selectedSearchResultIndex);
    // empty selected index.
    this.selectedSearchResultIndex = null;
    // empty search results.
    this.searchResults = [];
    // match search value with sidebar sections.
    this.sections.forEach(section => {
      // match with section title.
      const sectionTitle = section.querySelector('.' + SidebarFilter.CSS.sectionTitle);
      const isTitleMatch = sectionTitle.innerText.trim().toLowerCase()
        .indexOf(searchValue.toLowerCase()) !== -1;
      const matchResults = [];
      // match with section items.
      const sectionList = section.querySelector('.' + SidebarFilter.CSS.sectionList);
      let isSingleItemMatch = false;

      if (sectionList) {
        const sectionListItems = sectionList.querySelectorAll('.' + SidebarFilter.CSS.sectionListItem);

        sectionListItems.forEach(item => {
          if (item.innerText.trim().toLowerCase()
            .indexOf(searchValue.toLowerCase()) !== -1) {
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
        // hide section and it's items are not a match.
        section.classList.add(SidebarFilter.CSS.sectionHidden);
      } else {
        // show section and it's items are a match.
        section.classList.remove(SidebarFilter.CSS.sectionHidden);
        // add section title to search results.
        this.searchResults.push({
          element: sectionTitle,
          type: 'title',
        }, ...matchResults);
      }
    });
  }
}
