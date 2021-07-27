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
const pageOrder_1 = __importDefault(require("../models/pageOrder"));
/**
 * @class PagesOrder
 * @classdesc PagesOrder controller
 *
 * Manipulates with Pages: changes the order, deletes, updates and so on...
 */
class PagesOrder {
    /**
     * Returns Page's order
     *
     * @param {string} parentId - of which page we want to get children order
     * @returns {Promise<PageOrder>}
     */
    static get(parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield pageOrder_1.default.get(parentId);
            if (!order._id) {
                throw new Error('Page with given id does not contain order');
            }
            return order;
        });
    }
    /**
     * Returns all records about page's order
     *
     * @returns {Promise<PageOrder[]>}
     */
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return pageOrder_1.default.getAll();
        });
    }
    /**
     * Pushes the child page to the parent's order list
     *
     * @param {string} parentId - parent page's id
     * @param {string} childId - new page pushed to the order
     */
    static push(parentId, childId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield pageOrder_1.default.get(parentId);
            order.push(childId);
            yield order.save();
        });
    }
    /**
     * Move one page to another Page's order
     *
     * @param {string} oldParentId - old parent page's id
     * @param {string} newParentId - new parent page's id
     * @param {string} targetPageId - page's id which is changing the parent page
     */
    static move(oldParentId, newParentId, targetPageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldParentOrder = yield pageOrder_1.default.get(oldParentId);
            oldParentOrder.remove(targetPageId);
            yield oldParentOrder.save();
            const newParentOrder = yield pageOrder_1.default.get(newParentId);
            newParentOrder.push(targetPageId);
            yield newParentOrder.save();
        });
    }
    /**
     * Returns new array with ordered pages
     *
     * @param {Page[]} pages - list of all available pages
     * @param {string} currentPageId - page's id around which we are ordering
     * @param {string} parentPageId - parent page's id that contains page above
     * @param {boolean} ignoreSelf - should we ignore current page in list or not
     * @returns {Page[]}
     */
    static getOrderedChildren(pages, currentPageId, parentPageId, ignoreSelf = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const children = yield pageOrder_1.default.get(parentPageId);
            const unordered = pages.filter(page => page._parent === parentPageId).map(page => page._id);
            // Create unique array with ordered and unordered pages id
            const ordered = Array.from(new Set([...children.order, ...unordered]));
            const result = [];
            ordered.forEach(pageId => {
                pages.forEach(page => {
                    if (page._id === pageId && (pageId !== currentPageId || !ignoreSelf)) {
                        result.push(page);
                    }
                });
            });
            return result;
        });
    }
    /**
     * @param {string[]} unordered
     * @param {string} currentPageId - page's id that changes the order
     * @param {string} parentPageId - parent page's id that contains both two pages
     * @param {string} putAbovePageId - page's id above which we put the target page
     */
    static update(unordered, currentPageId, parentPageId, putAbovePageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageOrder = yield pageOrder_1.default.get(parentPageId);
            // Create unique array with ordered and unordered pages id
            pageOrder.order = Array.from(new Set([...pageOrder.order, ...unordered]));
            pageOrder.putAbove(currentPageId, putAbovePageId);
            yield pageOrder.save();
        });
    }
    /**
     * @param {string} parentId
     * @returns {Promise<void>}
     */
    static remove(parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield pageOrder_1.default.get(parentId);
            if (!order._id) {
                throw new Error('Page with given id does not contain order');
            }
            return order.destroy();
        });
    }
}
exports.default = PagesOrder;
