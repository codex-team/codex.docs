/**
 * Module for pages create/edit
 */
export default class Writing {
  constructor(){
    this.editorWrapper = null;
    this.editor = null;
  }

  /**
   * Called by ModuleDispatcher to initialize module from DOM
   */
  init(config, moduleEl) {
    this.editorWrapper = document.createElement('div');
    this.editorWrapper.id = 'codex-editor';

    moduleEl.appendChild(this.editorWrapper);

    this.loadEditor().then((editor) => {
      this.editor = editor;
    })
  };

  async loadEditor(){
    const {default: Editor} = await import(/* webpackChunkName: "editor" */ './../classes/editor');

    return new Editor();
  }
}
