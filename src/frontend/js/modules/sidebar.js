import { Storage } from '../utils/storage';
import Shortcut from '@codexteam/shortcuts';
import SidebarFilter from '../classes/sidebar-filter';
/**
 * Local storage key
 */
const LOCAL_STORAGE_KEY = 'docs_sidebar_state';
const SIDEBAR_VISIBILITY_KEY = 'docs_sidebar_visibility';

/**
 * Slack beyond scrollHeight + vertical borders for max-height (subpixels, hover radius).
 */
const SIDEBAR_LIST_MAX_HEIGHT_SLACK_PX = 4;

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
      sidebarToggler: 'docs-sidebar__toggler',
      sidebarSlider: 'docs-sidebar__slider',
      sidebarCollapsed: 'docs-sidebar--collapsed',
      sidebarAnimated: 'docs-sidebar--animated',
      sidebarContent: 'docs-sidebar__content',
      sidebarContentVisible: 'docs-sidebar__content--visible',
      sidebarContentInvisible: 'docs-sidebar__content--invisible',
      sidebarSearch: 'docs-sidebar__search',
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
      search: null,
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
    // Sidebar filter module
    this.filter = new SidebarFilter();
    /** @type {number | null} */
    this._recalcListsRaf = null;
  }

  /**
   * Called by ModuleDispatcher to initialize module from DOM
   *
   * @param {writingSettings} settings - module settings
   * @param {HTMLElement} moduleEl - module element
   */
  init(settings, moduleEl) {
    this.nodes.sidebar = moduleEl;
    this.nodes.sidebarContent = moduleEl.querySelector('.' + Sidebar.CSS.sidebarContent);
    this.nodes.sections = Array.from(moduleEl.querySelectorAll('.' + Sidebar.CSS.section));
    this.nodes.rootSections = Array.from(
      this.nodes.sidebarContent.querySelectorAll(':scope > .' + Sidebar.CSS.section)
    );
    this.nodes.sections.forEach((section) => this.initSection(section));
    this.scheduleRecalcSectionLists();
    this.nodes.toggler = moduleEl.querySelector('.' + Sidebar.CSS.sidebarToggler);
    this.nodes.toggler.addEventListener('click', () => this.toggleSidebar());
    this.nodes.slider = moduleEl.querySelector('.' + Sidebar.CSS.sidebarSlider);
    this.nodes.slider.addEventListener('click', () => this.handleSliderClick());

    this.nodes.search = moduleEl.querySelector('.' + Sidebar.CSS.sidebarSearch);
    this.filter.init(
      this.nodes.rootSections,
      this.nodes.sidebarContent,
      this.nodes.search,
      this.setSectionCollapsed.bind(this)
    );

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

    togglerEl.addEventListener('click', (e) => this.handleSectionTogglerClick(id, section, e));

    if (typeof this.sectionsState[id] === 'undefined') {
      this.sectionsState[id] = false;
    }
    if (this.sectionsState[id]) {
      this.setSectionCollapsed(section, true, false);
    }
  }

  /**
   * Recompute max-height for every expanded section list (nested opens change ancestor scrollHeight).
   * Uses a two-phase measure so parents see full child height (ITEM_HEIGHT * li was wrong for deep trees).
   */
  recalcSectionListsMaxHeight() {
    this.nodes.sections.forEach((section) => {
      if (section.classList.contains(Sidebar.CSS.sectionCollapsed)) {
        return;
      }
      const list = section.querySelector(':scope > .' + Sidebar.CSS.sectionList);

      if (list) {
        list.style.maxHeight = 'none';
      }
    });

    requestAnimationFrame(() => {
      [...this.nodes.sections].reverse().forEach((section) => {
        if (section.classList.contains(Sidebar.CSS.sectionCollapsed)) {
          return;
        }
        const list = section.querySelector(':scope > .' + Sidebar.CSS.sectionList);

        if (!list) {
          return;
        }
        const cs = globalThis.getComputedStyle(list);
        const borderY =
          (Number.parseFloat(cs.borderTopWidth) || 0) +
          (Number.parseFloat(cs.borderBottomWidth) || 0);

        list.style.maxHeight = `${list.scrollHeight + borderY + SIDEBAR_LIST_MAX_HEIGHT_SLACK_PX}px`;
      });
    });
  }

  /**
   * Batches recalc after collapse/expand and filter-driven opens.
   */
  scheduleRecalcSectionLists() {
    if (this._recalcListsRaf !== null) {
      return;
    }
    this._recalcListsRaf = requestAnimationFrame(() => {
      this._recalcListsRaf = null;
      this.recalcSectionListsMaxHeight();
    });
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
    const sectionList = sectionEl.querySelector(':scope > .' + Sidebar.CSS.sectionList);

    if (!sectionList) {
      return;
    }
    sectionEl.classList.toggle(Sidebar.CSS.sectionAnimated, animated);
    sectionEl.classList.toggle(Sidebar.CSS.sectionCollapsed, collapsed);

    this.scheduleRecalcSectionLists();

    /**
     * Highlight section item as active if active child item is collapsed.
     */
    const activeInSubtree = sectionList.querySelector('.' + Sidebar.CSS.sectionTitleActive);
    const sectionTitle = sectionEl.querySelector('.' + Sidebar.CSS.sectionTitle);

    if (!activeInSubtree) {
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
    this.nodes.sidebarContent.classList.toggle(Sidebar.CSS.sidebarContentVisible);
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

    // Add event listener to focus search input on Ctrl+P or ⌘+P is pressed.
    // eslint-disable-next-line no-new
    new Shortcut({
      name: 'CMD+P',
      on: document.body,
      callback: (e) => {
        // If sidebar is not visible.
        if (!this.isVisible) {
          // make sidebar visible.
          this.handleSliderClick();
        }
        // focus search input.
        this.nodes.search.focus();
        // Stop propagation of event.
        e.stopPropagation();
        e.preventDefault();
      },
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
}
