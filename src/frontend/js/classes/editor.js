import CodeXEditor from 'codex.editor';

/**
 * Tools for the Editor
 */
import Header from 'codex.editor.header';
import Quote from 'codex.editor.quote';
import CodeTool from 'codex.editor.code';
import Delimiter from 'codex.editor.delimiter';
import InlineCode from 'codex.editor.inline-code';
import Marker from 'codex.editor.marker';
import ListTool from 'codex.editor.list';
import RawTool from 'codex.editor.raw';
import ImageTool from 'codex.editor.image';
import Embed from 'codex.editor.embed';

/**
 * Class for working with Editor.js
 */
export default class Editor {
  /**
   * Creates Editor instance
   * @param {object} editorConfig - configuration object for Editor.js
   * @param {object} data.blocks - data to start with
   * @param {object} options
   * @param {string} options.headerPlaceholder - placeholder for Header tool
   */
  constructor(editorConfig = {}, options = {}) {
    const defaultConfig = {
      tools: {
        header: {
          class: Header,
          inlineToolbar: ['link', 'marker'],
          config: {
            placeholder: options.headerPlaceholder || ''
          }
        },
        quote: {
          class: Quote,
          inlineToolbar: true
        },
        code: {
          class: CodeTool,
          shortcut: 'CMD+SHIFT+D'
        },
        rawTool: {
          class: RawTool,
          shortcut: 'CMD+SHIFT+R'
        },
        delimiter: Delimiter,
        embed: Embed,
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+C'
        },
        marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M'
        },
        list: {
          class: ListTool,
          inlineToolbar: true
        },
        image: {
          class: ImageTool,
          inlineToolbar: true,
          config: {
            endpoints: {
              byFile: '/api/transport/image',
              byUrl: '/api/transport/fetch'
            },
            additionalRequestData: {
              map: JSON.stringify({
                path: 'file:url',
                size: 'file:size',
                mimetype: 'file:mime'
              })
            }
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
    };

    this.editor = new CodeXEditor(Object.assign(defaultConfig, editorConfig));
  }

  /**
   * Return Editor data
   * @return {Promise.<{}>}
   */
  save() {
    return this.editor.saver.save();
  }
}
