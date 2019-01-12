/**
 * Module for pages create/edit
 */
/**
 * @typedef {object} editorData
 * @property {{type, data}[]} blocks - array of Blocks
 * @property {string} version - used Editor version
 * @property {number} time - saving time
 */

/**
 * @typedef {object} writingSettings
 * @property {{_id, _parent, title, body: editorData}} [page] - page data for editing
 */

/**
 * @class Writing
 * @classdesc Class for create/edit pages
 */
export default class Writing {
  /**
   * Creates base properties
   */
  constructor() {
    this.editor = null;
    this.page = null; // stores Page on editing
    this.nodes = {
      editorWrapper: null,
      saveButton: null,
      parentIdSelector: null,
      uriInput: null
    };
  }

  /**
   * Called by ModuleDispatcher to initialize module from DOM
   * @param {writingSettings} settings - module settings
   * @param {HTMLElement} moduleEl - module element
   */
  init(settings = {}, moduleEl) {
    /**
     * Create Editor
     */
    this.nodes.editorWrapper = document.createElement('div');
    this.nodes.editorWrapper.id = 'codex-editor';

    moduleEl.appendChild(this.nodes.editorWrapper);

    if (settings.page) {
      this.page = settings.page;
    }

    this.loadEditor().then((editor) => {
      this.editor = editor;
    });

    /**
     * Activate form elements
     */
    this.nodes.saveButton = moduleEl.querySelector('[name="js-submit"]');
    this.nodes.saveButton.addEventListener('click', () => {
      this.saveButtonClicked();
    });
    this.nodes.parentIdSelector = moduleEl.querySelector('[name="parent"]');
    this.nodes.uriInput = moduleEl.querySelector('[name="uri-input"]');
  };

  /**
   * Loads class for working with Editor
   * @return {Promise<Editor>}
   */
  async loadEditor() {
    const {default: Editor} = await import(/* webpackChunkName: "editor" */ './../classes/editor');

    return new Editor({
      initialData: this.page ? this.page.body : null
    });
  }

  /**
   * Returns all writing form data
   * @throws {Error} - validation error
   * @return {Promise.<{parent: string, body: {editorData}}>}
   */
  async getData() {
    const editorData = await this.editor.save();
    const firstBlock = editorData.blocks.length ? editorData.blocks[0] : null;
    const title = firstBlock && firstBlock.type === 'header' ? firstBlock.data.text : null;
    let uri = '';

    if (this.nodes.uriInput) {
      if (this.nodes.uriInput.value.match(/^[a-z0-9'-]+$/i)) {
        uri = this.nodes.uriInput.value;
      } else {
        throw new Error('Uri has unexpected characters');
      }
    }

    if (!title) {
      throw new Error('Entry should start with Header');
    }

    return {
      parent: this.nodes.parentIdSelector.value,
      uri: uri,
      body: editorData
    };
  }

  /**
   * Handler for clicks on the Save button
   */
  async saveButtonClicked() {
    try {
      const writingData = await this.getData();
      const endpoint = this.page ? '/api/page/' + this.page._id : '/api/page';

      try {
        let response = await fetch(endpoint, {
          method: this.page ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(writingData)
        });

        response = await response.json();

        if (response.success) {
          window.location.pathname = response.result.uri;
        } else {
          alert(response.error);
          console.log('Validation failed:', response.error);
        }
      } catch (sendingError) {
        console.log('Saving request failed:', sendingError);
      }
    } catch (savingError) {
      alert(savingError);
      console.log('Saving error: ', savingError);
    }
  }
}
