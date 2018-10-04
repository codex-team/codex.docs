import CodeXEditor from 'codex.editor';
import Header from 'codex.editor.header';

/**
 * Class for working with Editor.js
 */
export default class Editor {
  /**
   * Creates Editor instance
   */
  constructor() {
    this.editor = new CodeXEditor({
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: 'Enter a title'
          }
        }
      },
      data: {
        blocks: [
          {
            type: 'header',
            data: {
              text: '',
              level: 2
            }
          }
        ]
      }
    });
  }

  /**
   * Return Editor data
   * @return {Promise.<{}>}
   */
  save() {
    return this.editor.saver.save();
  }
}
