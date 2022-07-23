import { Storage } from '../utils/storage';

/**
 * Local storage key
 */
const LOCAL_STORAGE_KEY = 'docs_sidebar_state';


/**
 * Section list item height in px
 */
const ITEM_HEIGHT = 31;

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
      sectionList: 'docs-sidebar__section-list',
      sectionListItem: 'docs-sidebar__section-list-item',
      sectionListItemWrapperHidden: 'docs-sidebar__section-list-item-wrapper--hidden',
      sectionListItemActive: 'docs-sidebar__section-list-item--active',
      sidebarToggler: 'docs-sidebar__toggler',
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
      sections: [],
      sidebarContent: null,
      toggler: null,
      search:null,
    };
    this.sidebarStorage = new Storage(LOCAL_STORAGE_KEY);
    const storedState = this.sidebarStorage.get();

    this.sectionsState = storedState ? JSON.parse(storedState) : {};
  }

  /**
   * Called by ModuleDispatcher to initialize module from DOM
   *
   * @param {writingSettings} settings - module settings
   * @param {HTMLElement} moduleEl - module element
   */
  init(settings, moduleEl) {
    this.nodes.sections = Array.from(moduleEl.querySelectorAll('.' + Sidebar.CSS.section));
    this.nodes.sections.forEach(section => this.initSection(section));
    this.nodes.sidebarContent = moduleEl.querySelector('.' + Sidebar.CSS.sidebarContent);
    this.nodes.toggler = moduleEl.querySelector('.' + Sidebar.CSS.sidebarToggler);
    this.nodes.toggler.addEventListener('click', () => this.toggleSidebar());

    this.nodes.search = moduleEl.querySelector('.' + Sidebar.CSS.sidebarSearch);
    let className =  Sidebar.CSS.sidebarSearchWrapperOther;

    if (window.navigator.userAgent.indexOf('Mac') != -1) {
      className = Sidebar.CSS.sidebarSearchWrapperMac;
    }
    this.nodes.search.parentElement.classList.add(className);
    this.nodes.search.addEventListener('keydown', e => this.search(e));
    this.nodes.search.addEventListener('keyup', e => this.search(e));
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

    sectionList.style.maxHeight = `${ itemsCount * ITEM_HEIGHT }px`;
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
   * Displays sidebar when ready
   *
   * @returns {void}
   */
  ready() {
    this.nodes.sidebarContent.classList.remove(Sidebar.CSS.sidebarContentInvisible);
    document.addEventListener('keydown', e => this.keyboardShortcutListener(e));
  }

  keyboardShortcutListener(e) {
    if (e.ctrlKey && e.code === 'KeyP') {
      this.nodes.search.focus();
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    if (this.nodes.search === document.activeElement) {
      if (e.code === 'ArrowUp') {
      }
      if (e.code === 'ArrowDown') {
      }
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }

  search(e) {
    const searchValue = e.target.value;

    this.nodes.sections.forEach(section => {
      const sectionTitle = section.querySelector('.' + Sidebar.CSS.sectionTitle);
      let isTitleMatch = true;

      if (sectionTitle.innerText.trim().toLowerCase()
        .indexOf(searchValue.toLowerCase()) === -1) {
        isTitleMatch = false;
      }

      const sectionList = section.querySelector('.' + Sidebar.CSS.sectionList);
      let isItemMatch = false;

      if (sectionList) {
        const sectionListItems = sectionList.querySelectorAll('.' + Sidebar.CSS.sectionListItem);

        sectionListItems.forEach(item => {
          if (item.innerText.trim().toLowerCase()
            .indexOf(searchValue.toLowerCase()) !== -1) {
            item.parentElement.classList.remove(Sidebar.CSS.sectionListItemWrapperHidden);
            isItemMatch = true;
          } else {
            item.parentElement.classList.add(Sidebar.CSS.sectionListItemWrapperHidden);
          }
        });
      }
      if (!isTitleMatch && !isItemMatch) {
        section.classList.add(Sidebar.CSS.sectionHidden);
      } else {
        section.classList.remove(Sidebar.CSS.sectionHidden);
      }
    });
    e.stopImmediatePropagation();
  }
}
