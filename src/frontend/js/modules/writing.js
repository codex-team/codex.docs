/**
 * Module for pages create/edit
 */
module.exports = class Writing {
  constructor(){
  }

  /**
   * Called by ModuleDispatcher to initialize module from DOM
   */
  init(config, moduleEl) {
    this.editorWrapper = document.createElement('div');
    this.editorWrapper.id = 'codex-editor';

    moduleEl.appendChild(this.editorWrapper);


    this.loadEditor().then(() => {
      console.log('Editor loaded');
    })
  };

  loadEditor(){
    return import(/* webpackChunkName: "codex-editor" */ 'codex.editor').then(({ default: CodexEditor }) => {
       console.log('codex-editor', new CodexEditor());
    }).catch(error => 'An error occurred while loading CodeX Editor');
  }
};
