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
const db = index_1.default['pagesOrder'];
/**
 * @class PageOrder
 * @classdesc PageOrder
 *
 * Creates order for Pages with children
 */
class PageOrder {
    /**
     * @class
     *
     * @param {PageOrderData} data
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
     * Returns current Page's children order
     *
     * @param {string} pageId - page's id
     * @returns {PageOrder}
     */
    static get(pageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield db.findOne({ page: pageId });
            let data = {};
            if (order instanceof Error || order === null) {
                data.page = pageId;
            }
            else {
                data = order;
            }
            return new PageOrder(data);
        });
    }
    /**
     * Find all pages which match passed query object
     *
     * @param {object} query
     * @returns {Promise<PageOrder[]>}
     */
    static getAll(query = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield db.find(query);
            if (docs === null || docs instanceof Error) {
                return [];
            }
            return Promise.all(docs.map(doc => new PageOrder(doc)));
        });
    }
    /**
     * constructor data setter
     *
     * @param {PageOrderData} pageOrderData
     */
    set data(pageOrderData) {
        this.page = pageOrderData.page || '0';
        this.order = pageOrderData.order || [];
    }
    /**
     * Return Page Children order
     *
     * @returns {PageOrderData}
     */
    get data() {
        return {
            _id: this._id,
            page: '' + this.page,
            order: this.order,
        };
    }
    /**
     * Pushes page id to the orders array
     *
     * @param {string} pageId - page's id
     */
    push(pageId) {
        if (typeof pageId === 'string') {
            if (this.order === undefined) {
                this.order = [];
            }
            this.order.push(pageId);
        }
        else {
            throw new Error('given id is not string');
        }
    }
    /**
     * Removes page id from orders array
     *
     * @param {string} pageId - page's id
     */
    remove(pageId) {
        if (this.order === undefined) {
            return;
        }
        const found = this.order.indexOf(pageId);
        if (found >= 0) {
            this.order.splice(found, 1);
        }
    }
    /**
     * @param {string} currentPageId - page's id that changes the order
     * @param {string} putAbovePageId - page's id above which we put the target page
     *
     * @returns void
     */
    putAbove(currentPageId, putAbovePageId) {
        if (this.order === undefined) {
            return;
        }
        const found1 = this.order.indexOf(putAbovePageId);
        const found2 = this.order.indexOf(currentPageId);
        if (found1 === -1 || found2 === -1) {
            return;
        }
        const margin = found1 < found2 ? 1 : 0;
        this.order.splice(found1, 0, currentPageId);
        this.order.splice(found2 + margin, 1);
    }
    /**
     * Returns page before passed page with id
     *
     * @param {string} pageId
     */
    getPageBefore(pageId) {
        if (this.order === undefined) {
            return;
        }
        const currentPageInOrder = this.order.indexOf(pageId);
        /**
         * If page not found or first return nothing
         */
        if (currentPageInOrder <= 0) {
            return;
        }
        return this.order[currentPageInOrder - 1];
    }
    /**
     * Returns page before passed page with id
     *
     * @param pageId
     */
    getPageAfter(pageId) {
        if (this.order === undefined) {
            return;
        }
        const currentPageInOrder = this.order.indexOf(pageId);
        /**
         * If page not found or is last
         */
        if (currentPageInOrder === -1 || currentPageInOrder === this.order.length - 1) {
            return;
        }
        return this.order[currentPageInOrder + 1];
    }
    /**
     * @param {string[]} order - define new order
     */
    set order(order) {
        this._order = order;
    }
    /**
     * Returns ordered list
     *
     * @returns {string[]}
     */
    get order() {
        return this._order || [];
    }
    /**
     * Save or update page data in the database
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._id) {
                const insertedRow = yield db.insert(this.data);
                if (!(insertedRow instanceof Error)) {
                    this._id = insertedRow._id;
                }
            }
            else {
                yield db.update({ _id: this._id }, this.data);
            }
            return this;
        });
    }
    /**
     * Remove page data from the database
     */
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            yield db.remove({ _id: this._id });
            delete this._id;
            return this;
        });
    }
}
exports.default = PageOrder;
