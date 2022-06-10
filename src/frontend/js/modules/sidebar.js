/**
 * Local storage key
 */
const LOCAL_STORAGE_KEY = 'docs_siedabar_state';

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
      sectionCollapsed: 'docs-sidebar__section--collapsed',
      sectionAnimated: 'docs-sidebar__section--animated',
      sectionTitle: 'docs-sidebar__section-title',
      sectionTitleActive: 'docs-sidebar__section-title--active',
      sectionList: 'docs-sidebar__section-list',
      sectionListItemActive: 'docs-sidebar__section-list-item--active',
      sidebarToggler: 'docs-sidebar__toggler',
      sidebarContent: 'docs-sidebar__content',
      sidebarContentHidden: 'docs-sidebar__content--hidden',
    };
  }

  /**
   * Creates base properties
   */
  constructor() {
    this.nodes = {};
    const storedState = window.localStorage.getItem(LOCAL_STORAGE_KEY);

    this.collapsed = storedState ? JSON.parse(storedState) : {};
  }

  /**
   * Called by ModuleDispatcher to initialize module from DOM
   *
   * @param {writingSettings} settings - module settings
   * @param {HTMLElement} moduleEl - module element
   */
  init(settings, moduleEl) {
    this.nodes.sections = Array.from(moduleEl.querySelectorAll('.' + Sidebar.CSS.section));
    this.nodes.sections.forEach(section => {
      const id = section.getAttribute('data-id');
      const togglerEl = section.querySelector('.' + Sidebar.CSS.toggler);

      if (!togglerEl) {
        return;
      }

      togglerEl.addEventListener('click', e => this.handleSectionTogglerClick(id, section, togglerEl, e));

      if (typeof this.collapsed[id] === 'undefined') {
        this.collapsed[id] = false;
      }
      if (this.collapsed[id]) {
        this.setSectionCollapsed(section, true, false);
      }
    });
    this.nodes.sidebarContent = moduleEl.querySelector('.' + Sidebar.CSS.sidebarContent);
    this.nodes.toggler = moduleEl.querySelector('.' + Sidebar.CSS.sidebarToggler);
    this.nodes.toggler.addEventListener('click', () => this.toggleSidebar());
    this.ready();
  }

  /**
   * Toggles section expansion
   *
   * @param {number} sectionId - id of the section to toggle
   * @param {HTMLElement} sectionEl - section html element
   * @param {HTMLElement} togglerEl - toggler button html element
   * @param {MouseEvent} event - click event
   * @returns {void}
   */
  handleSectionTogglerClick(sectionId, sectionEl, togglerEl, event) {
    event.preventDefault();
    this.collapsed[sectionId] = !this.collapsed[sectionId];
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.collapsed));
    this.setSectionCollapsed(sectionEl, this.collapsed[sectionId]);
  }

  /**
   * Updates section's collapsed state
   *
   * @param {HTMLElement} sectionEl - element of the section to toggle
   * @param {HTMLElement} togglerEl - section's toggler button element
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
    this.nodes.sidebarContent.classList.remove(Sidebar.CSS.sidebarContentHidden);
  }
}
