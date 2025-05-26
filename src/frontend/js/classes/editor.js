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
import Warning from '@editorjs/warning';
import Checklist from '@editorjs/checklist';
import LinkTool from '@editorjs/link';
import RawTool from '@editorjs/raw';
import Embed from '@editorjs/embed';

/**
 * Inline Tools for the Editor
 */
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import { TextColorTool } from './text-color-tool.js';
import { TextSizeTool } from './text-size-tool.js';
import VideoTool from './video-tool.js';
import CustomImageTool from './custom-image-tool.js';
/*
 * Class for working with Editor.js
 */
export default class Editor {
  /**
   * Creates Editor instance
   *
   * @param {object} editorConfig - configuration object for Editor.js
   * @param {object} data.blocks - data to start with
   * @param {object} options
   * @param {string} options.headerPlaceholder - placeholder for Header tool
   */
  constructor(editorConfig = {}, options = {}) {
    const defaultConfig = {
      // Включаем поддержку отмены действий (CTRL+Z)
      enableHistoryStack: true,
      // Максимальное количество действий, которые можно отменить
      maxHistoryLength: 30,
      tools: {
        header: {
          class: Header,
          inlineToolbar: ['marker', 'inlineCode'],
          config: {
            placeholder: options.headerPlaceholder || '',
          },
        },

        textColor: {
          class: TextColorTool,
          config: {
            defaultColor: '#000000',
            colors: [
              '#FF0000', '#00FF00', '#0000FF',
              '#FF00FF', '#00FFFF', '#FFA500',
              '#000000', '#FFFFFF',
            ],
          },
        },

        textSize: {
          class: TextSizeTool,
          config: {
            defaultSize: '16px',
            sizes: ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']
          }
        },

        video: {
          class: VideoTool,
          inlineToolbar: true,
          config: {
            uploader: {
              byFile: '/api/transport/file', // Ваш эндпоинт
              byUrl: '/api/transport/fetch'    // Если нужна загрузка по URL
            }
          },
          shortcut: 'CMD+SHIFT+V'
        },

        image: {
          class: Image,//CustomImageTool
          inlineToolbar: true,
          config: {
            types: 'image/*, video/mp4',
            endpoints: {
              byFile: '/api/transport/image',
              byUrl: '/api/transport/fetch',
            },
          },
        },

        linkTool: {
          class: LinkTool,
          config: {
            endpoint: '/api/fetchUrl',
          },
        },

        code: {
          class: CodeTool,
          shortcut: 'CMD+SHIFT+D',
        },

        list: {
          class: List,
          inlineToolbar: true,
        },

        delimiter: Delimiter,

        table: {
          class: Table,
          inlineToolbar: true,
        },

        warning: {
          class: Warning,
          inlineToolbar: true,
        },

        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },

        /**
         * Inline Tools
         */
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+C',
        },

        marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M',
        },

        raw: RawTool,

        embed: Embed,
      },
      data: {
        blocks: [
          {
            type: 'header',
            data: {
              text: '',
              level: 2,
            },
          },
        ],
      },
    };

    this.editor = new EditorJS(Object.assign(defaultConfig, editorConfig));
  }

  /**
   * Return Editor data
   *
   * @returns {Promise.<{}>}
   */
  save() {
    return this.editor.saver.save();
  }
}
