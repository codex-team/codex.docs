import EditorJS from '@editorjs/editorjs';

/**
 * Tools for the Editor
 */
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import CodeTool from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
import List from '@editorjs/list';
import RawTool from '@editorjs/raw';
import Embed from '@editorjs/embed';
import ImageTool from '@editorjs/image';

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
        image: {
          class: ImageTool,
          inlineToolbar: true,
          config: {
            endpoints: {
              byFile: '/uploadImage',
              byUrl: '/uploadImageByURL'
            }
          }
        },
        list: {
          class: List,
          inlineToolbar: true
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

    this.editor = new EditorJS(Object.assign(defaultConfig, editorConfig));
  }

  /**
   * Return Editor data
   * @return {Promise.<{}>}
   */
  save() {
    return this.editor.saver.save();
  }
}
