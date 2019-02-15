import CodeXEditor from 'codex.editor';
import Header from 'codex.editor.header';
import CodeTool from 'codex.editor.code';
import InlineCode from 'codex.editor.inline-code';
import Marker from 'codex.editor.marker';
import ListTool from 'codex.editor.list';
import ImageTool from 'codex.editor.image';

/**
 * Class for working with Editor.js
 */
export default class Editor {
  /**
   * Creates Editor instance
   * @property {object} initialData - data to start with
   */
  constructor({initialData}) {
    this.editor = new CodeXEditor({
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: 'Enter a title'
          }
        },
        code: CodeTool,
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+I'
        },
        Marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M'
        },
        list: {
          class: ListTool,
          inlineToolbar: true
        },
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: '/api/transport/image',
              byUrl: '/api/transport/fetch'
            },
            additionalRequestData: {
              map: JSON.stringify({
                path: 'file:url',
                size: 'file:size',
                mimetype: 'file:mime',
              })
            },
          }
        }
      },
      data: initialData || {
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
