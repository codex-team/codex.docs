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
const page_1 = __importDefault(require("../models/page"));
const page_2 = __importDefault(require("../models/page"));
const alias_1 = __importDefault(require("../models/alias"));
/**
 * @class Pages
 * @classdesc Pages controller
 */
class Pages {
    /**
     * Fields required for page model creation
     *
     * @returns {['title', 'body']}
     */
    static get REQUIRED_FIELDS() {
        return ['body'];
    }
    /**
     * Find and return page model with passed id
     *
     * @param {string} id - page id
     * @returns {Promise<Page>}
     */
    static get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield page_1.default.get(id);
            if (!page._id) {
                throw new Error('Page with given id does not exist');
            }
            return page;
        });
    }
    /**
     * Return all pages
     *
     * @returns {Promise<Page[]>}
     */
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return page_1.default.getAll();
        });
    }
    /**
     * Return all pages without children of passed page
     *
     * @param {string} parent - id of current page
     * @returns {Promise<Page[]>}
     */
    static getAllExceptChildren(parent) {
        return __awaiter(this, void 0, void 0, function* () {
            const pagesAvailable = this.removeChildren(yield Pages.getAll(), parent);
            const nullfilteredpages = [];
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            pagesAvailable.forEach((item, _index) => __awaiter(this, void 0, void 0, function* () {
                if (item instanceof page_2.default) {
                    nullfilteredpages.push(item);
                }
            }));
            return nullfilteredpages;
        });
    }
    /**
     * Set all children elements to null
     *
     * @param {Array<Page|null>} [pagesAvailable] - Array of all pages
     * @param {string} parent - id of parent page
     * @returns {Array<?Page>}
     */
    static removeChildren(pagesAvailable, parent) {
        pagesAvailable.forEach((item, index) => __awaiter(this, void 0, void 0, function* () {
            if (item === null || item._parent !== parent) {
                return;
            }
            pagesAvailable[index] = null;
            pagesAvailable = Pages.removeChildren(pagesAvailable, item._id);
        }));
        return pagesAvailable;
    }
    /**
     * Create new page model and save it in the database
     *
     * @param {PageData} data
     * @returns {Promise<Page>}
     */
    static insert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                Pages.validate(data);
                const page = new page_1.default(data);
                const insertedPage = yield page.save();
                if (insertedPage.uri) {
                    const alias = new alias_1.default({
                        id: insertedPage._id,
                        type: alias_1.default.types.PAGE,
                    }, insertedPage.uri);
                    alias.save();
                }
                return insertedPage;
            }
            catch (validationError) {
                throw new Error(validationError);
            }
        });
    }
    /**
     * Check PageData object for required fields
     *
     * @param {PageData} data
     * @throws {Error} - validation error
     */
    static validate(data) {
        const allRequiredFields = Pages.REQUIRED_FIELDS.every(field => typeof data[field] !== 'undefined');
        if (!allRequiredFields) {
            throw new Error('Some of required fields is missed');
        }
        const hasBlocks = data.body && data.body.blocks && Array.isArray(data.body.blocks) && data.body.blocks.length > 0;
        if (!hasBlocks) {
            throw new Error('Page body is invalid');
        }
        const hasHeaderAsFirstBlock = data.body.blocks[0].type === 'header';
        if (!hasHeaderAsFirstBlock) {
            throw new Error('First page Block must be a Header');
        }
        const headerIsNotEmpty = data.body.blocks[0].data.text.replace('<br>', '').trim() !== '';
        if (!headerIsNotEmpty) {
            throw new Error('Please, fill page Header');
        }
    }
    /**
     * Update page with given id in the database
     *
     * @param {string} id - page id
     * @param {PageData} data
     * @returns {Promise<Page>}
     */
    static update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield page_1.default.get(id);
            const previousUri = page.uri;
            if (!page._id) {
                throw new Error('Page with given id does not exist');
            }
            if (data.uri && !data.uri.match(/^[a-z0-9'-]+$/i)) {
                throw new Error('Uri has unexpected characters');
            }
            page.data = data;
            const updatedPage = yield page.save();
            if (updatedPage.uri !== previousUri) {
                if (updatedPage.uri) {
                    const alias = new alias_1.default({
                        id: updatedPage._id,
                        type: alias_1.default.types.PAGE,
                    }, updatedPage.uri);
                    alias.save();
                }
                alias_1.default.markAsDeprecated(previousUri);
            }
            return updatedPage;
        });
    }
    /**
     * Remove page with given id from the database
     *
     * @param {string} id - page id
     * @returns {Promise<Page>}
     */
    static remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield page_1.default.get(id);
            if (!page._id) {
                throw new Error('Page with given id does not exist');
            }
            const alias = yield alias_1.default.get(page.uri);
            yield alias.destroy();
            return page.destroy();
        });
    }
}
exports.default = Pages;
