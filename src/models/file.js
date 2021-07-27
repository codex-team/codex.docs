"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../utils/database/index"));
const filesDb = index_1.default['files'];
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
    /**
     * @class
     *
     * @param {FileData} data
     */
    constructor(data = {}) {
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
    static get(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield filesDb.findOne({ _id });
            return new File(data);
        });
    }
    /**
     * Find and return model of file with given id
     *
     * @param {string} filename - uploaded filename
     * @returns {Promise<File>}
     */
    static getByFilename(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield filesDb.findOne({ filename });
            return new File(data);
        });
    }
    /**
     * Find all files which match passed query object
     *
     * @param {object} query
     * @returns {Promise<File[]>}
     */
    static getAll(query = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield filesDb.find(query);
            if (docs instanceof Error) {
                return [];
            }
            return Promise.all(docs.map(doc => new File(doc)));
        });
    }
    /**
     * Set FileData object fields to internal model fields
     *
     * @param {FileData} fileData
     */
    set data(fileData) {
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
    get data() {
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
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._id) {
                const insertedRow = yield filesDb.insert(this.data);
                this._id = insertedRow._id;
            }
            else {
                yield filesDb.update({ _id: this._id }, this.data);
            }
            return this;
        });
    }
    /**
     * Remove file data from the database
     *
     * @returns {Promise<File>}
     */
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            yield filesDb.remove({ _id: this._id });
            delete this._id;
            return this;
        });
    }
    /**
     * Removes unnecessary public folder prefix
     *
     * @param {string} path
     * @returns {string}
     */
    processPath(path) {
        return path.replace(/^public/, '');
    }
    /**
     * Return readable file data
     *
     * @returns {FileData}
     */
    toJSON() {
        return this.data;
    }
}
exports.default = File;
