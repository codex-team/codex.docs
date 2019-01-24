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
      removeButton: null,
      parentIdSelector: null,
      putAboveIdSelector: null,
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
    this.nodes.saveButton = moduleEl.querySelector('[name="js-submit-save"]');
    this.nodes.saveButton.addEventListener('click', () => {
      this.saveButtonClicked();
    });

    this.nodes.removeButton = moduleEl.querySelector('[name="js-submit-remove"]');
    this.nodes.removeButton.addEventListener('click', () => {
      this.removeButtonClicked();
    });
    this.nodes.parentIdSelector = moduleEl.querySelector('[name="parent"]');
    this.nodes.putAboveIdSelector = moduleEl.querySelector('[name="above"]');
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

    if (!title) {
      throw new Error('Entry should start with Header');
    }

    /** get ordering selector value */
    let putAbovePageId = null;
    if (this.nodes.putAboveIdSelector) {
      putAbovePageId = this.nodes.putAboveIdSelector.value;
    }

    return {
      parent: this.nodes.parentIdSelector.value,
      putAbovePageId: putAbovePageId,
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
          document.location = '/page/' + response.result._id;
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

  /**
   * @returns {Promise<void>}
   */
  async removeButtonClicked() {
    try {
      const endpoint = this.page ? '/api/page/' + this.page._id : '';

      let response = await fetch(endpoint, {
        method: 'DELETE'
      });

      response = await response.json();
      if (response.success) {
        if (response.result && response.result._id) {
          document.location = '/page/' + response.result._id;
        } else {
          document.location = '/';
        }
      } else {
        alert(response.error);
        console.log('Server fetch failed:', response.error);
      }
    } catch (e) {
      console.log('Server fetch failed due to the:', e);
    }
  }
}
