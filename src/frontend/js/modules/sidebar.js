import { Storage } from '../utils/storage';
import Shortcut from '@codexteam/shortcuts';

/**
 * Local storage key
 */
const LOCAL_STORAGE_KEY = 'docs_sidebar_state';
const SIDEBAR_VISIBILITY_KEY = 'docs_sidebar_visibility';

/**
 * Section list item height in px
 */
const ITEM_HEIGHT = 35;

/**
 * Sidebar module
 */
export default class Sidebar {
  /**
   * CSS classes
   *
   * @returns {Record<string, string>}
   */
  static get CSS() {
    return {
      toggler: 'docs-sidebar__section-toggler',
      section: 'docs-sidebar__section',
      sectionHidden: 'docs-sidebar__section--hidden',
      sectionCollapsed: 'docs-sidebar__section--collapsed',
      sectionAnimated: 'docs-sidebar__section--animated',
      sectionTitle: 'docs-sidebar__section-title',
      sectionTitleActive: 'docs-sidebar__section-title--active',
      sectionTitleSelected: 'docs-sidebar__section-title--selected',
      sectionList: 'docs-sidebar__section-list',
      sectionListItem: 'docs-sidebar__section-list-item',
      sectionListItemWrapperHidden: 'docs-sidebar__section-list-item-wrapper--hidden',
      sectionListItemActive: 'docs-sidebar__section-list-item--active',
      sectionListItemSlelected: 'docs-sidebar__section-list-item--selected',
      sidebarToggler: 'docs-sidebar__toggler',
      sidebarSlider: 'docs-sidebar__slider',
      sidebarCollapsed: 'docs-sidebar--collapsed',
      sidebarAnimated: 'docs-sidebar--animated',
      sidebarContent: 'docs-sidebar__content',
      sidebarContentHidden: 'docs-sidebar__content--hidden',
      sidebarContentInvisible: 'docs-sidebar__content--invisible',
      sidebarSearch: 'docs-sidebar__search',
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
    this.nodes = {
      sidebar: null,
      sections: [],
      sidebarContent: null,
      toggler: null,
      slider: null,
      search:null,
      searchResults: [],
      selectedSearchResultIndex: null,
    };
    this.sidebarStorage = new Storage(LOCAL_STORAGE_KEY);
    const storedState = this.sidebarStorage.get();

    this.sectionsState = storedState ? JSON.parse(storedState) : {};

    // Initialize localStorage that contains sidebar visibility
    this.sidebarVisibilityStorage = new Storage(SIDEBAR_VISIBILITY_KEY);
    // Get current sidebar visibility from storage
    const storedVisibility = this.sidebarVisibilityStorage.get();

    // Sidebar visibility
    this.isVisible = storedVisibility !== 'false';
  }

  /**
   * Called by ModuleDispatcher to initialize module from DOM
   *
   * @param {writingSettings} settings - module settings
   * @param {HTMLElement} moduleEl - module element
   */
  init(settings, moduleEl) {
    this.nodes.sidebar = moduleEl;
    this.nodes.sections = Array.from(moduleEl.querySelectorAll('.' + Sidebar.CSS.section));
    this.nodes.sections.forEach(section => this.initSection(section));
    this.nodes.sidebarContent = moduleEl.querySelector('.' + Sidebar.CSS.sidebarContent);
    this.nodes.toggler = moduleEl.querySelector('.' + Sidebar.CSS.sidebarToggler);
    this.nodes.toggler.addEventListener('click', () => this.toggleSidebar());
    this.nodes.slider = moduleEl.querySelector('.' + Sidebar.CSS.sidebarSlider);
    this.nodes.slider.addEventListener('click', () => this.handleSliderClick());

    this.nodes.search = moduleEl.querySelector('.' + Sidebar.CSS.sidebarSearch);
    let className =  Sidebar.CSS.sidebarSearchWrapperOther;

    // Search initialize with platform specific shortcut.
    if (window.navigator.userAgent.indexOf('Mac') != -1) {
      className = Sidebar.CSS.sidebarSearchWrapperMac;
    }
    this.nodes.search.parentElement.classList.add(className);
    // Add event listener for search input.
    this.nodes.search.addEventListener('input', e => {
      e.stopImmediatePropagation();
      e.preventDefault();
      this.search(e.target.value);
    });
    // Get search results if search input is empty.
    this.search('');
    // Add event listener for keyboard events.
    document.addEventListener('keydown', e => this.keyboardListener(e));
    this.ready();
  }

  /**
   * Initializes sidebar sections: applies stored state and adds event listeners
   *
   * @param {HTMLElement} section
   * @returns {void}
   */
  initSection(section) {
    const id = section.dataset.id;
    const togglerEl = section.querySelector('.' + Sidebar.CSS.toggler);

    if (!togglerEl) {
      return;
    }

    togglerEl.addEventListener('click', e => this.handleSectionTogglerClick(id, section, e));

    if (typeof this.sectionsState[id] === 'undefined') {
      this.sectionsState[id] = false;
    }
    if (this.sectionsState[id]) {
      this.setSectionCollapsed(section, true, false);
    }

    /**
     * Calculate and set sections list max height for smooth animation
     */
    const sectionList = section.querySelector('.' + Sidebar.CSS.sectionList);

    if (!sectionList) {
      return;
    }

    const itemsCount = sectionList.children.length;

    sectionList.style.maxHeight = `${itemsCount * ITEM_HEIGHT}px`;
  }

  /**
   * Toggles section expansion
   *
   * @param {number} sectionId - id of the section to toggle
   * @param {HTMLElement} sectionEl - section html element
   * @param {MouseEvent} event - click event
   * @returns {void}
   */
  handleSectionTogglerClick(sectionId, sectionEl, event) {
    event.preventDefault();
    this.sectionsState[sectionId] = !this.sectionsState[sectionId];
    this.sidebarStorage.set(JSON.stringify(this.sectionsState));
    this.setSectionCollapsed(sectionEl, this.sectionsState[sectionId]);
  }

  /**
   * Updates section's collapsed state
   *
   * @param {HTMLElement} sectionEl - element of the section to toggle
   * @param {boolean} collapsed - new collapsed state
   * @param {boolean} [animated] - true if state should change with animation
   */
  setSectionCollapsed(sectionEl, collapsed, animated = true) {
    const sectionList = sectionEl.querySelector('.' + Sidebar.CSS.sectionList);

    if (!sectionList) {
      return;
    }
    sectionEl.classList.toggle(Sidebar.CSS.sectionAnimated, animated);
    sectionEl.classList.toggle(Sidebar.CSS.sectionCollapsed, collapsed);

    /**
     * Highlight section item as active if active child item is collapsed.
     */
    const activeSectionListItem = sectionList.querySelector('.' + Sidebar.CSS.sectionListItemActive);
    const sectionTitle = sectionEl.querySelector('.' + Sidebar.CSS.sectionTitle);

    if (!activeSectionListItem) {
      return;
    }
    if (collapsed && animated) {
      /**
       * Highlights section title as active with a delay to let section collapse animation finish first
       */
      setTimeout(() => {
        sectionTitle.classList.toggle(Sidebar.CSS.sectionTitleActive, collapsed);
      }, 200);
    } else {
      sectionTitle.classList.toggle(Sidebar.CSS.sectionTitleActive, collapsed);
    }
  }

  /**
   * Toggles sidebar visibility
   *
   * @returns {void}
   */
  toggleSidebar() {
    this.nodes.sidebarContent.classList.toggle(Sidebar.CSS.sidebarContentHidden);
  }

  /**
   * Initializes sidebar
   *
   * @returns {void}
   */
  initSidebar() {
    if (!this.isVisible) {
      this.nodes.sidebar.classList.add(Sidebar.CSS.sidebarCollapsed);
    }

    /**
     * prevent sidebar animation on page load
     * Since animated class contains transition, hiding will be animated with it
     * To prevent awkward animation when visibility is set to false, we need to remove animated class
     */
    setTimeout(() => {
      this.nodes.sidebar.classList.add(Sidebar.CSS.sidebarAnimated);
    }, 200);

    // add event listener to execute keyboard shortcut
    // eslint-disable-next-line no-new
    new Shortcut({
      name: 'CMD+.',
      on: document.body,
      callback: () => this.handleSliderClick(),
    });
  }

  /**
   * Slides sidebar
   *
   * @returns {void}
   */
  handleSliderClick() {
    this.isVisible = !this.isVisible;
    this.sidebarVisibilityStorage.set(this.isVisible);
    this.nodes.sidebar.classList.toggle(Sidebar.CSS.sidebarCollapsed);
  }

  /**
   * Displays sidebar when ready
   *
   * @returns {void}
   */
  ready() {
    this.initSidebar();
    this.nodes.sidebarContent.classList.remove(Sidebar.CSS.sidebarContentInvisible);
  }

  /**
   * Keyboard event listener added
   *
   * @param {KeyboardEvent} e - keyboard event.
   */
  keyboardListener(e) {
    // If Ctrl+P or ⌘+P is pressed, focus search input.
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyP') {
      this.nodes.search.focus();
      e.preventDefault();
    }
    // If search is focused and arrow keys are pressed, move focus to next/previous item.
    if (this.nodes.search === document.activeElement) {
      if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.stopImmediatePropagation();
        e.preventDefault();
        // check for search results.
        if (this.nodes.searchResults.length === 0) {
          return;
        }
        // get current focused item.
        const prevSelectedSearchResultIndex = this.nodes.selectedSearchResultIndex;

        // get next item index.
        if (this.nodes.selectedSearchResultIndex === null) {
          // if no item is focused and up press, focus last item.
          if (e.code === 'ArrowUp') {
            this.nodes.selectedSearchResultIndex = this.nodes.searchResults.length - 1;
          }
          // if no item is focused and down press, focus first item.
          if (e.code === 'ArrowDown') {
            this.nodes.selectedSearchResultIndex = 0;
          }
        } else {
          // if item is focused and up press, focus previous item.
          if (e.code === 'ArrowUp') {
            this.nodes.selectedSearchResultIndex--;
            if ( this.nodes.selectedSearchResultIndex < 0 ) {
              this.nodes.selectedSearchResultIndex = this.nodes.searchResults.length - 1;
            }
          }
          // if item is focused and down press, focus next item.
          if (e.code === 'ArrowDown') {
            this.nodes.selectedSearchResultIndex++;
            if ( this.nodes.selectedSearchResultIndex >= this.nodes.searchResults.length ) {
              this.nodes.selectedSearchResultIndex = 0;
            }
          }
        }

        // remove focus from previous item.
        if (prevSelectedSearchResultIndex !== null) {
          const { element:preElement, type:preType } =  this.nodes.searchResults[prevSelectedSearchResultIndex];

          if (preElement) {
            // remove focus from previous item or title.
            if (preType === 'title') {
              preElement.classList.remove(Sidebar.CSS.sectionTitleSelected);
            }
            if (preType === 'item') {
              preElement.classList.remove(Sidebar.CSS.sectionListItemSlelected);
            }
          }
        }

        const { element, type } =  this.nodes.searchResults[this.nodes.selectedSearchResultIndex];

        if (element) {
          // add focus to next item or title.
          if (type === 'title') {
            element.classList.add(Sidebar.CSS.sectionTitleSelected);
          }
          if ( type === 'item') {
            element.classList.add(Sidebar.CSS.sectionListItemSlelected);
          }
          // find the parent section.
          const parentSection = element.closest('section');
          // check if it's visible.
          const rect = parentSection.getBoundingClientRect();
          const elemTop = rect.top;
          const elemBottom = rect.bottom;

          // scroll top if item is not visible.
          if ( elemTop < 0) {
            this.nodes.sidebarContent.scroll({
              top: elemTop,
              behavior: 'smooth',
            });
          }
          // scroll bottom if item is not visible.
          if (elemBottom > window.innerHeight) {
            this.nodes.sidebarContent.scroll({
              top: elemBottom,
              behavior: 'smooth',
            });
          }
        }
      }
      // if enter is pressed, click on focused item.
      if (e.code === 'Enter') {
        if (this.nodes.selectedSearchResultIndex!==null) {
          this.nodes.searchResults[this.nodes.selectedSearchResultIndex].element.click();
        }
      }
    }
  }

  /**
   * Search for items in the sidebar.
   *
   * @param {InputEvent} searchValue - search value.
   */
  search(searchValue) {
    // remove selection from previous search results.
    if (this.nodes.selectedSearchResultIndex) {
      const { element, type } = this.nodes.searchResults[this.nodes.selectedSearchResultIndex];

      if (element) {
        // remove focus from previous item or title.
        if (type === 'title') {
          element.classList.remove(Sidebar.CSS.sectionTitleSelected);
        }
        if ( type === 'item') {
          element.classList.remove(Sidebar.CSS.sectionListItemSlelected);
        }
        // empty selected index.
        this.nodes.selectedSearchResultIndex = null;
      }
    }
    // empty search results.
    this.nodes.searchResults = [];

    // match search value with sidebar sections.
    this.nodes.sections.forEach(section => {
      // match with section title.
      const sectionTitle = section.querySelector('.' + Sidebar.CSS.sectionTitle);
      let isTitleMatch = true;
      const matchResults = [];

      if (sectionTitle.innerText.trim().toLowerCase()
        .indexOf(searchValue.toLowerCase()) === -1) {
        isTitleMatch = false;
      }

      // match with section items.
      const sectionList = section.querySelector('.' + Sidebar.CSS.sectionList);
      let isItemMatch = false;

      if (sectionList) {
        const sectionListItems = sectionList.querySelectorAll('.' + Sidebar.CSS.sectionListItem);

        sectionListItems.forEach(item => {
          if (item.innerText.trim().toLowerCase()
            .indexOf(searchValue.toLowerCase()) !== -1) {
            // remove hiden class from item.
            item.parentElement.classList.remove(Sidebar.CSS.sectionListItemWrapperHidden);
            // add item to search results.
            matchResults.push({
              element:item,
              type:'item',
            });
            isItemMatch = true;
          } else {
            // hide item if it is not a match.
            item.parentElement.classList.add(Sidebar.CSS.sectionListItemWrapperHidden);
          }
        });
      }
      if (!isTitleMatch && !isItemMatch) {
        // hide section and it's items are not a match.
        section.classList.add(Sidebar.CSS.sectionHidden);
      } else {
        // show section and it's items are a match.
        section.classList.remove(Sidebar.CSS.sectionHidden);
        // add section title to search results.
        this.nodes.searchResults.push({
          element:sectionTitle,
          type:'title',
        }, ...matchResults);
      }
    });
  }
}
