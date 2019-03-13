import EditorJS from '@editorjs/editorjs';

/**
 * Block Tools for the Editor
 */
import Header from '@editorjs/header';
import Image from '@editorjs/image';
import CodeTool from '@editorjs/code';
import List from '@editorjs/list';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';

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
          inlineToolbar: ['marker', 'inlineCode'],
          config: {
            placeholder: options.headerPlaceholder || ''
          }
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

        code: {
          class: CodeTool,
          shortcut: 'CMD+SHIFT+D'
        },

        list: {
          class: List,
          inlineToolbar: true
        },

        delimiter: Delimiter,

        table: {
          class: Table,
          inlineToolbar: true
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
