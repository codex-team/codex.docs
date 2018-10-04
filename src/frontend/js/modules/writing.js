/**
 * Module for pages create/edit
 */
/**
 * @typedef {object} editorData
 * @property {{type, data}[]} blocks - array of Blocks
 * @property {string} version - used Editor version
 * @property {number} time - saving time
 */

export default class Writing {
  /**
   * Creates base properties
   */
  constructor(){
    this.editor = null;
    this.nodes = {
      editorWrapper: null,
      saveButton: null,
      parentIdSelector: null,
    }
  }

  /**
   * Called by ModuleDispatcher to initialize module from DOM
   * @param {object} settings - module settings
   * @param {HTMLElement} moduleEl - module element
   */
  init(settings, moduleEl) {
    /**
     * Create Editor
     */
    this.nodes.editorWrapper = document.createElement('div');
    this.nodes.editorWrapper.id = 'codex-editor';

    moduleEl.appendChild(this.nodes.editorWrapper);

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
  };

  /**
   * Loads class for working with Editor
   * @return {Promise<Editor>}
   */
  async loadEditor(){
    const {default: Editor} = await import(/* webpackChunkName: "editor" */ './../classes/editor');

    return new Editor();
  }

  /**
   * Returns all writing form data
   * @throws {Error} - validation error
   * @return {Promise.<{parent: string, body: {editorData}}>}
   */
  async getData(){
    const editorData = await this.editor.save();
    const firstBlock = editorData.blocks.length ? editorData.blocks[0] : null;
    const title = firstBlock && firstBlock.type === 'header' ? firstBlock.data.text : null;

    if (!title) {
      throw new Error('Entry should start with Header');
    }

    return {
      parent: this.nodes.parentIdSelector.value,
      body: editorData
    };
  }

  /**
   * Handler for clicks on the Save button
   */
  async saveButtonClicked(){
    try {
      const writingData = await this.getData();

      try {
        let response = await fetch('/page', {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify(writingData),
        });

        response = await response.json();

        if (response.success){
          document.location = '/page/' + response.result._id;
        } else {
          alert(response.error);
          console.log('Validation failed:', response.error);
        }

      } catch (sendingError) {
        console.log('Saving request failed:', sendingError);
      }
    } catch (savingError){
      alert(savingError);
      console.log('Saving error: ', savingError);
    }
  }
}
