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
const urlify_1 = __importDefault(require("../utils/urlify"));
const index_1 = __importDefault(require("../utils/database/index"));
const pagesDb = index_1.default['pages'];
/**
 * @class Page
 * @class Page model
 *
 * @property {string} _id - page id
 * @property {string} title - page title
 * @property {string} uri - page uri
 * @property {*} body - page body
 * @property {string} _parent - id of parent page
 */
class Page {
    /**
     * @class
     *
     * @param {PageData} data
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
     * Find and return model of page with given id
     *
     * @param {string} _id - page id
     * @returns {Promise<Page>}
     */
    static get(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield pagesDb.findOne({ _id });
            if (data instanceof Error) {
                return new Page();
            }
            return new Page(data);
        });
    }
    /**
     * Find and return model of page with given uri
     *
     * @param {string} uri - page uri
     * @returns {Promise<Page>}
     */
    static getByUri(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield pagesDb.findOne({ uri });
            if (data instanceof Error) {
                return new Page();
            }
            return new Page(data);
        });
    }
    /**
     * Find all pages which match passed query object
     *
     * @param {object} query
     * @returns {Promise<Page[]>}
     */
    static getAll(query = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield pagesDb.find(query);
            if (docs instanceof Error) {
                return [];
            }
            return Promise.all(docs.map(doc => new Page(doc)));
        });
    }
    /**
     * Set PageData object fields to internal model fields
     *
     * @param {PageData} pageData
     */
    set data(pageData) {
        const { body, parent, uri } = pageData;
        this.body = body || this.body;
        this.title = this.extractTitleFromBody();
        this.uri = uri || '';
        this._parent = parent || this._parent || '0';
    }
    /**
     * Return PageData object
     *
     * @returns {PageData}
     */
    get data() {
        return {
            _id: this._id,
            title: this.title,
            uri: this.uri,
            body: this.body,
            parent: this._parent,
        };
    }
    /**
     * Extract first header from editor data
     *
     * @returns {string}
     */
    extractTitleFromBody() {
        const headerBlock = this.body ? this.body.blocks.find((block) => block.type === 'header') : '';
        return headerBlock ? headerBlock.data.text : '';
    }
    /**
     * Transform title for uri
     *
     * @returns {string}
     */
    transformTitleToUri() {
        return urlify_1.default(this.title);
    }
    /**
     * Link given page as parent
     *
     * @param {Page} parentPage
     */
    set parent(parentPage) {
        this._parent = parentPage._id;
    }
    /**
     * Return parent page model
     *
     * @returns {Promise<Page>}
     */
    get parent() {
        const data = pagesDb.findOne({ _id: this._parent });
        if (data instanceof Error) {
            return new Page();
        }
        return new Page(data);
    }
    /**
     * Return child pages models
     *
     * @returns {Promise<Page[]>}
     */
    get children() {
        return pagesDb.find({ parent: this._id })
            .then(data => {
            if (data instanceof Error) {
                return [];
            }
            return data.map(page => new Page(page));
        });
    }
    /**
     * Save or update page data in the database
     *
     * @returns {Promise<Page>}
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            this.uri = yield this.composeUri(this.uri);
            if (!this._id) {
                const insertedRow = yield pagesDb.insert(this.data);
                this._id = insertedRow._id;
            }
            else {
                yield pagesDb.update({ _id: this._id }, this.data);
            }
            return this;
        });
    }
    /**
     * Remove page data from the database
     *
     * @returns {Promise<Page>}
     */
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            yield pagesDb.remove({ _id: this._id });
            delete this._id;
            return this;
        });
    }
    /**
     * Find and return available uri
     *
     * @returns {Promise<string>}
     * @param uri
     */
    composeUri(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            let pageWithSameUriCount = 0;
            if (!this._id) {
                uri = this.transformTitleToUri();
            }
            if (uri) {
                let pageWithSameUri = yield Page.getByUri(uri);
                while (pageWithSameUri._id && pageWithSameUri._id !== this._id) {
                    pageWithSameUriCount++;
                    pageWithSameUri = yield Page.getByUri(uri + `-${pageWithSameUriCount}`);
                }
            }
            return pageWithSameUriCount ? uri + `-${pageWithSameUriCount}` : uri;
        });
    }
    /**
     * Return readable page data
     *
     * @returns {PageData}
     */
    toJSON() {
        return this.data;
    }
}
exports.default = Page;
