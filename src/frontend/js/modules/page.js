/**
 * @typedef {object} pageModuleSettings
 */

/**
 * @class Page
 * @classdesc Class for page module
 */
export default class Writing {
  /**
   * Creates base properties
   */
  constructor() {
    this.codeStyler = null;
  }

  /**
   * Called by ModuleDispatcher to initialize module from DOM
   * @param {pageModuleSettings} settings - module settings
   * @param {HTMLElement} moduleEl - module element
   */
  init(settings = {}, moduleEl) {
    this.codeStyler = this.createCodeStyling();
  };

  /**
   * Init code highlighting
   */
  async createCodeStyling() {
    const {default: CodeStyler} = await import(/* webpackChunkName: "code-styling" */ './../classes/codeStyler');

    return new CodeStyler({
      selector: '.block-code',
    });
  };
}
