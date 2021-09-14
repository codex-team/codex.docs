import fileType from 'file-type';
import fetch from 'node-fetch';
import fs from 'fs';
import nodePath from 'path';
import config from 'config';
import Model, { FileData } from '../models/file';
import crypto from '../utils/crypto';
import deepMerge from '../utils/objects';

const random16 = crypto.random16;

interface Dict {
  [key: string]: any;
}

/**
 * @class Transport
 * @classdesc Transport controller
 *
 * Allows to save files from client or fetch them by URL
 */
class Transport {
  /**
   * Saves file passed from client
   *
   * @param {object} multerData - file data from multer
   * @param {string} multerData.originalname - original name of the file
   * @param {string} multerData.filename - name of the uploaded file
   * @param {string} multerData.path - path to the uploaded file
   * @param {number} multerData.size - size of the uploaded file
   * @param {string} multerData.mimetype - MIME type of the uploaded file
   *
   * @param {object} map - object that represents how should fields of File object should be mapped to response
   * @returns {Promise<FileData>}
   */
  public static async save(multerData: Dict, map: Dict): Promise<FileData> {
    const { originalname: name, path, filename, size, mimetype } = multerData;

    const file = new Model({
      name,
      filename,
      path,
      size,
      mimetype,
    });

    await file.save();

    let response = file.data;

    if (map) {
      response = Transport.composeResponse(file, map);
    }

    return response;
  }

  /**
   * Fetches file by passed URL
   *
   * @param {string} url - URL of the file
   * @param {object} map - object that represents how should fields of File object should be mapped to response
   * @returns {Promise<FileData>}
   */
  public static async fetch(url: string, map: Dict): Promise<FileData> {
    const fetchedFile = await fetch(url);
    const buffer = await fetchedFile.buffer();
    const filename = await random16();

    const type = await fileType.fromBuffer(buffer);
    const ext = type ? type.ext : nodePath.extname(url).slice(1);

    fs.writeFileSync(`${config.get('uploads')}/${filename}.${ext}`, buffer);

    const file = new Model({
      name: url,
      filename: `${filename}.${ext}`,
      path: `${config.get('uploads')}/${filename}.${ext}`,
      size: buffer.length,
      mimetype: type ? type.mime : fetchedFile.headers.get('content-type'),
    });

    await file.save();

    let response = file.data;

    if (map) {
      response = Transport.composeResponse(file, map);
    }

    return response;
  }

  /**
   * Map fields of File object to response by provided map object
   *
   * @param {Model} file - file object
   * @param {object} map - object that represents how should fields of File object should be mapped to response
   *
   */
  public static composeResponse(file: Model, map: Dict): Dict {
    const response: Dict = {};
    const { data } = file;

    Object.entries(map).forEach(([name, path]) => {
      const fields: string[] = path.split(':');

      if (fields.length > 1) {
        let object: Dict = {};
        const result = object;

        fields.forEach((field, i) => {
          if (i === fields.length - 1) {
            object[field] = data[name];

            return;
          }

          object[field] = {};
          object = object[field];
        });

        deepMerge(response, result);
      } else {
        response[fields[0]] = data[name];
      }
    });

    return response;
  }
}

export default Transport;
