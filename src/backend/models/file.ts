import database from '../database/index.js';
import { EntityId } from '../database/types.js';

const filesDb = database['files'];

/**
 * @typedef {object} FileData
 * @property {string} _id - file id
 * @property {string} name - original file name
 * @property {string} filename - name of uploaded file
 * @property {string} path - path to uploaded file
 * @property {string} mimetype - file MIME type
 * @property {string} url - file url to access it. Consists of uploads path and file name.
 * @property {number} size - size of the file in
 */
export interface FileData {
  _id?: EntityId;
  name?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
}

/**
 * @class File
 * @class File model
 * @property {string} _id - file id
 * @property {string} name - original file name
 * @property {string} filename - name of uploaded file
 * @property {string} path - path to uploaded file
 * @property {string} mimetype - file MIME type
 * @property {number} size - size of the file in
 */
class File {
  public _id?: EntityId;
  public name?: string;
  public filename?: string;
  public mimetype?: string;
  public size?: number;

  /**
   * @class
   * @param {FileData} data - info about file
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
   * Find and return model of file with given id
   *
   * @param {string} _id - file id
   * @returns {Promise<File>}
   */
  public static async get(_id: string): Promise<File> {
    const data: FileData = await filesDb.findOne({ _id });

    return new File(data);
  }

  /**
   * Find and return model of file with given id
   *
   * @param {string} filename - uploaded filename
   * @returns {Promise<File>}
   */
  public static async getByFilename(filename: string): Promise<File> {
    const data = await filesDb.findOne({ filename });

    return new File(data);
  }

  /**
   * Find all files which match passed query object
   *
   * @param {object} query - input query
   * @returns {Promise<File[]>}
   */
  public static async getAll(query: Record<string, unknown> = {}): Promise<File[]> {
    const docs = await filesDb.find(query);

    return Promise.all(docs.map(doc => new File(doc)));
  }

  /**
   * Set FileData object fields to internal model fields
   *
   * @param {FileData} fileData - info about file
   */
  public set data(fileData: FileData) {
    const { name, filename, mimetype, size } = fileData;

    this.name = name || this.name;
    this.filename = filename || this.filename;
    this.mimetype = mimetype || this.mimetype;
    this.size = size || this.size;
  }

  /**
   * Return FileData object
   *
   * @returns {FileData}
   */
  public get data(): FileData {
    return {
      _id: this._id,
      name: this.name,
      filename: this.filename,
      mimetype: this.mimetype,
      size: this.size,
    };
  }

  /**
   * Save or update file data in the database
   *
   * @returns {Promise<File>}
   */
  public async save(): Promise<File> {
    if (!this._id) {
      const insertedRow = await filesDb.insert(this.data) as { _id: EntityId };

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
  public async destroy(): Promise<File> {
    await filesDb.remove({ _id: this._id });

    delete this._id;

    return this;
  }

  /**
   * Return readable file data
   *
   * @returns {FileData}
   */
  public toJSON(): FileData {
    return this.data;
  }
}

export default File;
