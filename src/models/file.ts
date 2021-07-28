import database from '../utils/database/index';

const filesDb = database['files'];

/**
 * @typedef {object} FileData
 *
 * @property {string} _id - file id
 * @property {string} name - original file name
 * @property {string} filename - name of uploaded file
 * @property {string} path - path to uploaded file
 * @property {string} mimetype - file MIME type
 * @property {number} size - size of the file in
 */

export interface FileData {
  _id?: string;
  name?: string;
  filename?: string;
  path?: string;
  mimetype?: string | null;
  size?: number;
  [key: string]: any;
}

/**
 * @class File
 * @class File model
 *
 * @property {string} _id - file id
 * @property {string} name - original file name
 * @property {string} filename - name of uploaded file
 * @property {string} path - path to uploaded file
 * @property {string} mimetype - file MIME type
 * @property {number} size - size of the file in
 */
class File {
  _id: string | undefined;
  name: string | undefined;
  filename: string | undefined;
  path: string | undefined;
  mimetype: string | undefined;
  size: number | undefined;
  /**
   * Find and return model of file with given id
   *
   * @param {string} _id - file id
   * @returns {Promise<File>}
   */
  static async get(_id: string): Promise<File> {
    const data = await filesDb.findOne({ _id });

    return new File(data);
  }

  /**
   * Find and return model of file with given id
   *
   * @param {string} filename - uploaded filename
   * @returns {Promise<File>}
   */
  static async getByFilename(filename: string): Promise<File> {
    const data = await filesDb.findOne({ filename });

    return new File(data);
  }

  /**
   * Find all files which match passed query object
   *
   * @param {object} query
   * @returns {Promise<File[]>}
   */
  static async getAll(query: object = {}): Promise<File[]> {
    const docs = await filesDb.find(query);

    if (docs instanceof Error) {
      return [];
    }

    return Promise.all(docs.map(doc => new File(doc)));
  }

  /**
   * @class
   *
   * @param {FileData} data
   */
  constructor(data: FileData = {}) {
    if (data === null) {
      data = {};
    }

    if (data._id) {
      this._id = data._id;
    }

    this.data = data;
  }

  /**
   * Set FileData object fields to internal model fields
   *
   * @param {FileData} fileData
   */
  set data(fileData: FileData) {
    const { name, filename, path, mimetype, size } = fileData;

    this.name = name || this.name;
    this.filename = filename || this.filename;
    this.path = path ? this.processPath(path) : this.path;
    this.mimetype = mimetype || this.mimetype;
    this.size = size || this.size;
  }

  /**
   * Return FileData object
   *
   * @returns {FileData}
   */
  get data(): FileData {
    return {
      _id: this._id,
      name: this.name,
      filename: this.filename,
      path: this.path,
      mimetype: this.mimetype,
      size: this.size,
    };
  }

  /**
   * Save or update file data in the database
   *
   * @returns {Promise<File>}
   */
  async save(): Promise<File> {
    if (!this._id) {
      const insertedRow = await filesDb.insert(this.data) as { _id: string };

      this._id = insertedRow._id;
    } else {
      await filesDb.update({ _id: this._id }, this.data);
    }

    return this;
  }

  /**
   * Remove file data from the database
   *
   * @returns {Promise<File>}
   */
  async destroy(): Promise<File> {
    await filesDb.remove({ _id: this._id });

    delete this._id;

    return this;
  }

  /**
   * Removes unnecessary public folder prefix
   *
   * @param {string} path
   * @returns {string}
   */
  processPath(path: string): string {
    return path.replace(/^public/, '');
  }

  /**
   * Return readable file data
   *
   * @returns {FileData}
   */
  toJSON(): FileData {
    return this.data;
  }
}

export default File;
