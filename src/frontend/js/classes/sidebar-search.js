/**
 * HEIGHT of the header in px
 */
const HEADER_HEIGHT = 56;

/**
 * Sidebar module
 */
export default class SidebarSearch {
  /**
   * CSS classes
   *
   * @returns {Record<string, string>}
   */
  static get CSS() {
    return {
      sectionHidden: 'docs-sidebar__section--hidden',
      sectionTitleSelected: 'docs-sidebar__section-title--selected',
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
     * Stores refs to HTML elements needed for correct sidebar work
     */
    this.sidebar = null;
    this.sections = [];
    this.sidebarContent = null;
    this.search = null;
    this.searchResults = [];
    this.selectedSearchResultIndex = null;
  }

  /**
   * 
   * @param {*} sections 
   * @param {*} sidebarContent 
   * @param {*} search 
   */
  init(sections, sidebarContent, search) 
  {
    this.sections = sections;
    this.sidebarContent = sidebarContent;
    this.search = search;
    let className = SidebarSearch.CSS.sidebarSearchWrapperOther;

    // Search initialize with platform specific shortcut.
    if (window.navigator.userAgent.indexOf('Mac') != -1) {
      className = SidebarSearch.CSS.sidebarSearchWrapperMac;
    }
    this.search.parentElement.classList.add(className);

    // Add event listener for search input.
    this.search.addEventListener('input', e => {
      e.stopImmediatePropagation();
      e.preventDefault();
      this.search(e.target.value);
    });
    // Initialize the search results.
    this.search('');

    // Add event listener for keyboard events.
    this.search.addEventListener('keydown', e => this.handleKeyboardEventOnSearch(e));
  }


  /**
   * Handle keyboard events when search input is focused.
   *
   * @param {Event} e - Event Object.
   * @returns {void}
   */
  handleKeyboardEventOnSearch(e) {
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

      // get next item index.
      if (this.selectedSearchResultIndex === null) {
        // if no item is focused and up press, focus last item.
        if (e.code === 'ArrowUp') {
          this.selectedSearchResultIndex = this.searchResults.length - 1;
        } else if (e.code === 'ArrowDown') {
        // if no item is focused and down press, focus first item.
          this.selectedSearchResultIndex = 0;
        }
      } else {
        // if item is focused and up press, focus previous item.
        if (e.code === 'ArrowUp') {
          this.selectedSearchResultIndex--;
          if (this.selectedSearchResultIndex < 0) {
            this.selectedSearchResultIndex = this.searchResults.length - 1;
          }
        } else if (e.code === 'ArrowDown') {
        // if item is focused and down press, focus next item.
          this.selectedSearchResultIndex++;
          if (this.selectedSearchResultIndex >= this.searchResults.length) {
            this.selectedSearchResultIndex = 0;
          }
        }
      }

      // remove focus from previous item.
      if (prevSelectedSearchResultIndex !== null) {
        const { element: preElement, type: preType } = this.searchResults[prevSelectedSearchResultIndex];

        if (preElement) {
          // remove focus from previous item or title.
          if (preType === 'title') {
            preElement.classList.remove(SidebarSearch.CSS.sectionTitleSelected);
          } else if (preType === 'item') {
            preElement.classList.remove(SidebarSearch.CSS.sectionListItemSlelected);
          }
        }
      }

      const { element, type } = this.searchResults[this.selectedSearchResultIndex];

      if (element) {
        // add focus to next item or title.
        if (type === 'title') {
          element.classList.add(SidebarSearch.CSS.sectionTitleSelected);
        } else if (type === 'item') {
          element.classList.add(SidebarSearch.CSS.sectionListItemSlelected);
        }

        // check if it's visible.
        const rect = element.getBoundingClientRect();
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
      // prevent default action.
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  /**
   * Search for items in the sidebar.
   *
   * @param {InputEvent} searchValue - search value.
   */
  search(searchValue) {
    // remove selection from previous search results.
    if (this.selectedSearchResultIndex) {
      const { element, type } = this.searchResults[this.selectedSearchResultIndex];

      if (element) {
        // remove focus from previous item or title.
        if (type === 'title') {
          element.classList.remove(SidebarSearch.CSS.sectionTitleSelected);
        } else if (type === 'item') {
          element.classList.remove(SidebarSearch.CSS.sectionListItemSlelected);
        }
        // empty selected index.
        this.selectedSearchResultIndex = null;
      }
    }
    // empty search results.
    this.searchResults = [];

    // match search value with sidebar sections.
    this.sections.forEach(section => {
      // match with section title.
      const sectionTitle = section.querySelector('.' + SidebarSearch.CSS.sectionTitle);
      let isTitleMatch = true;
      const matchResults = [];

      if (sectionTitle.innerText.trim().toLowerCase()
        .indexOf(searchValue.toLowerCase()) === -1) {
        isTitleMatch = false;
      }

      // match with section items.
      const sectionList = section.querySelector('.' + SidebarSearch.CSS.sectionList);
      let isItemMatch = false;

      if (sectionList) {
        const sectionListItems = sectionList.querySelectorAll('.' + SidebarSearch.CSS.sectionListItem);

        sectionListItems.forEach(item => {
          if (item.innerText.trim().toLowerCase()
            .indexOf(searchValue.toLowerCase()) !== -1) {
            // remove hiden class from item.
            item.parentElement.classList.remove(SidebarSearch.CSS.sectionListItemWrapperHidden);
            // add item to search results.
            matchResults.push({
              element: item,
              type: 'item',
            });
            isItemMatch = true;
          } else {
            // hide item if it is not a match.
            item.parentElement.classList.add(SidebarSearch.CSS.sectionListItemWrapperHidden);
          }
        });
      }
      if (!isTitleMatch && !isItemMatch) {
        // hide section and it's items are not a match.
        section.classList.add(SidebarSearch.CSS.sectionHidden);
      } else {
        // show section and it's items are a match.
        section.classList.remove(SidebarSearch.CSS.sectionHidden);
        // add section title to search results.
        this.searchResults.push({
          element: sectionTitle,
          type: 'title',
        }, ...matchResults);
      }
    });
  }
}
