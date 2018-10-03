/**
 * Module for pages create/edit
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
   * @return {Promise.<{}>}
   */
  async getData(){
    return this.editor.save()
      .then((editorData) => {
        let writingData = {};

        writingData.parent = this.nodes.parentIdSelector.value;
        writingData.body = editorData;

        return writingData;
      });
  }

  /**
   * Handler for clicks on the Save button
   */
  async saveButtonClicked(){
    const writingData = await this.getData();
    let formData = new FormData();

    for ( let field in writingData ){
      if (!writingData.hasOwnProperty(field)) {
        formData.append(field, writingData[field])
      }
    }

    fetch('/page', {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(writingData),
    })
      .then(response => response.json())
      .then(response => {
        console.log('resp', response);
        if (response.success){
          document.location = '/page/' + response.result._id;
        }
      })
      .catch(console.log);

  }
}
