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
const pages_1 = __importDefault(require("./pages"));
const files_1 = __importDefault(require("./files"));
const password_1 = __importDefault(require("./password"));
const aliases_1 = __importDefault(require("./aliases"));
const pagesOrder_1 = __importDefault(require("./pagesOrder"));
/**
 * @class Database
 * @classdesc Simple decorator class to work with nedb datastore
 *
 * @property db - nedb Datastore object
 */
class Database {
    /**
     * @constructor
     *
     * @param {Object} nedbInstance - nedb Datastore object
     */
    constructor(nedbInstance) {
        this.db = nedbInstance;
    }
    /**
     * Insert new document into the database
     * @see https://github.com/louischatriot/nedb#inserting-documents
     *
     * @param {Object} doc - object to insert
     * @returns {Promise<Object|Error>} - inserted doc or Error object
     */
    insert(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => this.db.insert(doc, (err, newDoc) => {
                if (err) {
                    reject(err);
                }
                resolve(newDoc);
            }));
        });
    }
    /**
     * Find documents that match passed query
     * @see https://github.com/louischatriot/nedb#finding-documents
     *
     * @param {Object} query - query object
     * @param {Object} projection - projection object
     * @returns {Promise<Array<Object>|Error>} - found docs or Error object
     */
    find(query, projection) {
        return __awaiter(this, void 0, void 0, function* () {
            const cbk = (resolve, reject) => (err, docs) => {
                if (err) {
                    reject(err);
                }
                resolve(docs);
            };
            return new Promise((resolve, reject) => {
                if (projection) {
                    this.db.find(query, projection, cbk(resolve, reject));
                }
                else {
                    this.db.find(query, cbk(resolve, reject));
                }
            });
        });
    }
    /**
     * Find one document matches passed query
     * @see https://github.com/louischatriot/nedb#finding-documents
     *
     * @param {Object} query - query object
     * @param {Object} projection - projection object
     * @returns {Promise<Object|Error>} - found doc or Error object
     */
    findOne(query, projection) {
        return __awaiter(this, void 0, void 0, function* () {
            const cbk = (resolve, reject) => (err, doc) => {
                if (err) {
                    reject(err);
                }
                resolve(doc);
            };
            return new Promise((resolve, reject) => {
                if (projection) {
                    this.db.findOne(query, projection, cbk(resolve, reject));
                }
                else {
                    this.db.findOne(query, cbk(resolve, reject));
                }
            });
        });
    }
    /**
     * Update document matches query
     * @see https://github.com/louischatriot/nedb#updating-documents
     *
     * @param {Object} query - query object
     * @param {Object} update - fields to update
     * @param {Object} options
     * @param {Boolean} options.multi - (false) allows update several documents
     * @param {Boolean} options.upsert - (false) if true, upsert document with update fields.
     *                                    Method will return inserted doc or number of affected docs if doc hasn't been inserted
     * @param {Boolean} options.returnUpdatedDocs - (false) if true, returns affected docs
     * @returns {Promise<number|Object|Object[]|Error>} - number of updated rows or affected docs or Error object
     */
    update(query, update, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => this.db.update(query, update, options, (err, result, affectedDocs) => {
                if (err) {
                    reject(err);
                }
                switch (true) {
                    case options.returnUpdatedDocs:
                        resolve(affectedDocs);
                        break;
                    case options.upsert:
                        if (affectedDocs) {
                            resolve(affectedDocs);
                        }
                        resolve(result);
                        break;
                    default:
                        resolve(result);
                }
            }));
        });
    }
    /**
     * Remove document matches passed query
     * @see https://github.com/louischatriot/nedb#removing-documents
     *
     * @param {Object} query - query object
     * @param {Object} options
     * @param {Boolean} options.multi - (false) if true, remove several docs
     * @returns {Promise<number|Error>} - number of removed rows or Error object
     */
    remove(query, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => this.db.remove(query, options, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            }));
        });
    }
}
exports.default = {
    class: Database,
    pages: new Database(pages_1.default),
    password: new Database(password_1.default),
    aliases: new Database(aliases_1.default),
    pagesOrder: new Database(pagesOrder_1.default),
    files: new Database(files_1.default)
};
