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
const crypto_1 = __importDefault(require("../utils/crypto"));
const index_1 = __importDefault(require("../utils/database/index"));
const binaryMD5 = crypto_1.default.binaryMD5;
const aliasesDb = index_1.default['aliases'];
/**
 * @class Alias
 * @classdesc Alias model
 *
 * @property {string} _id - alias id
 * @property {string} hash - alias binary hash
 * @property {string} type - entity type
 * @property {boolean} deprecated - indicate if alias deprecated
 * @property {string} id - entity title
 */
class Alias {
    /**
     * @class
     *
     * @param {AliasData} data
     * @param {string} aliasName - alias of entity
     */
    constructor(data = {}, aliasName = '') {
        if (data === null) {
            data = {};
        }
        if (data._id) {
            this._id = data._id;
        }
        if (aliasName) {
            this.hash = binaryMD5(aliasName);
        }
        this.data = data;
    }
    /**
     * Return Alias types
     *
     * @returns {object}
     */
    static get types() {
        return {
            PAGE: 'page',
        };
    }
    /**
     * Find and return alias with given alias
     *
     * @param {string} aliasName - alias of entity
     * @returns {Promise<Alias>}
     */
    static get(aliasName) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = binaryMD5(aliasName);
            let data = yield aliasesDb.findOne({
                hash: hash,
                deprecated: false,
            });
            if (!data) {
                data = yield aliasesDb.findOne({ hash: hash });
            }
            if (data instanceof Error) {
                return new Alias();
            }
            return new Alias(data);
        });
    }
    /**
     * Save or update alias data in the database
     *
     * @returns {Promise<Alias>}
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._id) {
                const insertedRow = yield aliasesDb.insert(this.data);
                this._id = insertedRow._id;
            }
            else {
                yield aliasesDb.update({ _id: this._id }, this.data);
            }
            return this;
        });
    }
    /**
     * Set AliasData object fields to internal model fields
     *
     * @param {AliasData} aliasData
     */
    set data(aliasData) {
        const { id, type, hash, deprecated } = aliasData;
        this.id = id || this.id;
        this.type = type || this.type;
        this.hash = hash || this.hash;
        this.deprecated = deprecated || false;
    }
    /**
     * Return AliasData object
     *
     * @returns {AliasData}
     */
    get data() {
        return {
            _id: this._id,
            id: this.id,
            type: this.type,
            hash: this.hash,
            deprecated: this.deprecated,
        };
    }
    /**
     * Mark alias as deprecated
     *
     * @param {string} aliasName - alias of entity
     * @returns {Promise<Alias>}
     */
    static markAsDeprecated(aliasName) {
        return __awaiter(this, void 0, void 0, function* () {
            const alias = yield Alias.get(aliasName);
            alias.deprecated = true;
            return alias.save();
        });
    }
    /**
     * @returns {Promise<Alias>}
     */
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            yield aliasesDb.remove({ _id: this._id });
            delete this._id;
            return this;
        });
    }
}
exports.default = Alias;
