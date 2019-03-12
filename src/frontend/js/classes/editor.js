import EditorJS from '@editorjs/editorjs';

/**
 * Block Tools for the Editor
 */
import Header from '@editorjs/header';
import CodeTool from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import List from '@editorjs/list';
import Image from '@editorjs/image';
// import RawTool from '@editorjs/raw';
// import Embed from '@editorjs/embed';
// import Quote from '@editorjs/quote';

/**
 * Inline Tools for the Editor
 */
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';

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
          inlineToolbar: ['link', 'marker', 'inlineCode'],
          config: {
            placeholder: options.headerPlaceholder || ''
          }
        },

        // quote: {
        //   class: Quote,
        //   inlineToolbar: true
        // },

        code: {
          class: CodeTool,
          shortcut: 'CMD+SHIFT+D'
        },

        // rawTool: {
        //   class: RawTool,
        //   shortcut: 'CMD+SHIFT+R'
        // },

        delimiter: Delimiter,

        // embed: Embed,

        list: {
          class: List,
          inlineToolbar: true
        },

        image: {
          class: Image,
          inlineToolbar: true,
          config: {
            types: 'image/*, video/mp4',
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
        },

        /**
         * Inline Tools
         */
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
