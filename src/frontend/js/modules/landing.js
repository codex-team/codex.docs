'use strict';

/**
 * Module to compose output JSON preview
 */
const {default: cPreview} = require('../classes/cPreview');

/**
 * Module for pages using Editor
 */
export default class Landing {
  constructor() {
    /**
     * Editor class Instance
     */
    this.editor = null;

    /**
     * DOM elements
     */
    this.nodes = {
      /**
       * Container to output saved Editor data
       */
      outputWrapper: null
    };
  }

  /**
   * @typedef {Object} editorLandingSettings - Editor landing class settings
   * @property {String} editorLandingSettings.output_id - ID of container where Editor's saved data will be shown
   * @property {function} editorLandingSettings.onChange - Modifications callback for the Editor
   */

  /**
   * Initialization. Called by Module Dispatcher
   */
  init(editorLandingSettings) {
    /**
     * Prepare node to output Editor data preview
     * @type {HTMLElement} - JSON preview container
     */
    this.nodes.outputWrapper = document.getElementById(editorLandingSettings.output_id);

    if (!this.nodes.outputWrapper) {
      console.warn('Can\'t find output target with ID: «' + editorLandingSettings.output_id + '»');
    }

    this.loadEditor({
      data: {
        blocks: editorLandingSettings.blocks
      },
      /**
       * Bind onchange callback to preview JSON data
       */
      onChange: () => {
        this.previewData();
      },
      /**
       * When Editor is ready, preview JSON output with initial data
       */
      onReady: () => {
        this.previewData();
        this.editor.focus();
      }
    }).then((editor) => {
      this.editor = editor;
    });
  };

  /**
   * Load Editor from separate chunk
   * @param settings - settings for Editor initialization
   * @return {Promise<Editor>} - CodeX Editor promise
   */
  async loadEditor(settings) {
    const {default: Editor} = await import(/* webpackChunkName: "editor" */ './../classes/editor');

    return new Editor(settings);
  }

  /**
   * Shows JSON output of editor saved data
   */
  previewData() {
    this.editor.save().then((savedData) => {
      cPreview.show(savedData, this.nodes.outputWrapper);
    });
  };
};
