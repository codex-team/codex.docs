/**
 *
 */
export default class Sidebar {
  /**
   *
   */
  static get CSS() {
    return {
      toggler: 'docs-sidebar__section-toggler',
      togglerCollapsed: 'docs-sidebar__section-toggler--collapsed',
      section: 'docs-sidebar__section',
      sectionTitle: 'docs-sidebar__section-title',
      sectionTitleActive: 'docs-sidebar__section-title--active',
      sectionList: 'docs-sidebar__section-list',
      sectionListCollapsed: 'docs-sidebar__section-list--collapsed',
      sectionListItemActive: 'docs-sidebar__section-list-item--active',
    };
  }
  /**
   *
   */
  constructor() {
    this.nodes = {
      section: null,
    };
    this.collapsed = {};
  }

  /**
   * @param settings
   * @param moduleEl
   */
  init(settings = {}, moduleEl) {
    this.nodes.sections = Array.from(moduleEl.querySelectorAll('.' + Sidebar.CSS.section));
    this.nodes.sections.forEach(section => {
      const id = section.getAttribute('data-id');

      this.collapsed[id] = false;
      const togglerEl = section.querySelector('.' + Sidebar.CSS.toggler);

      togglerEl.addEventListener('click', e => this.toggleSection(id, section, togglerEl,  e));
    });
  }

  /**
   * @param sectionId
   * @param sectionEl
   * @param togglerEl
   * @param event
   */
  toggleSection(sectionId, sectionEl, togglerEl, event) {
    event.preventDefault();

    this.collapsed[sectionId] = !this.collapsed[sectionId];
    togglerEl.classList.toggle(Sidebar.CSS.togglerCollapsed, this.collapsed[sectionId]);
    const sectionList =  sectionEl.querySelector('.' + Sidebar.CSS.sectionList);

    if (!sectionList) {
      return;
    }
    sectionList.classList.toggle(Sidebar.CSS.sectionListCollapsed, this.collapsed[sectionId]);

    /**
     * Highlight section item as active if active child item is collapsed.
     */
    const activeSectionListItem = sectionList.querySelector('.' + Sidebar.CSS.sectionListItemActive);
    const sectionTitle = sectionEl.querySelector('.' + Sidebar.CSS.sectionTitle);

    if (activeSectionListItem) {
      if (this.collapsed[sectionId]) {
        setTimeout(() => {
          sectionTitle.classList.toggle(Sidebar.CSS.sectionTitleActive, true);
        }, 200);
      } else {
        sectionTitle.classList.toggle(Sidebar.CSS.sectionTitleActive, false);
      }
    }
  }
}
