const fileType = require('file-type');
const fetch = require('node-fetch');
const fs = require('fs');

const Model = require('../models/file');
const {random16} = require('../utils/crypto');
const {deepMerge} = require('../utils/objects');

/**
 * @class Transport
 * @classdesc Transport controller
 *
 * Allows to save files from client or fetch them by URL
 */
class Transport {
  /**
   * Saves file passed from client
   * @param {object} multerData - file data from multer
   * @param {string} multerData.originalname - original name of the file
   * @param {string} multerData.filename - name of the uploaded file
   * @param {string} multerData.path - path to the uploaded file
   * @param {number} multerData.size - size of the uploaded file
   * @paran {string} multerData.mimetype - MIME type of the uploaded file
   *
   * @param {object} map - object that represents how should fields of File object should be mapped to response
   * @return {Promise<FileData>}
   */
  static async save(multerData, map) {
    const {originalname: name, filename, path, size, mimetype} = multerData;

    const file = new Model({name, filename, path, size, mimetype});

    await file.save();

    let response = file.data;

    if (map) {
      response = Transport.composeResponse(file, map);
    }

    return response;
  }

  /**
   * Fetches file by passed URL
   * @param {string} url - URL of the file
   * @param {object} map - object that represents how should fields of File object should be mapped to response
   * @return {Promise<FileData>}
   */
  static async fetch(url, map) {
    const fetchedFile = await fetch(url);
    const buffer = await fetchedFile.buffer();
    const filename = await random16();

    fs.writeFileSync(`public/uploads/${filename}`, buffer);

    const type = fileType(buffer);

    const file = new Model({
      name: url,
      filename,
      path: `/uploads/${filename}`,
      size: buffer.length,
      mimetype: type ? type.mime : fetchedFile.headers.get('content-type')
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
   * @param {File} file
   * @param {object} map - object that represents how should fields of File object should be mapped to response
   *
   */
  static composeResponse(file, map) {
    const response = {};
    const {data} = file;

    Object.entries(map).forEach(([name, path]) => {
      const fields = path.split(':');

      if (fields.length > 1) {
        let object = {};
        let result = object;

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

module.exports = Transport;
