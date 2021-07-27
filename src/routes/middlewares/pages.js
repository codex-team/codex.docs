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
const pages_1 = __importDefault(require("../../controllers/pages"));
const pagesOrder_1 = __importDefault(require("../../controllers/pagesOrder"));
const asyncMiddleware_1 = __importDefault(require("../../utils/asyncMiddleware"));
/**
 * Process one-level pages list to parent-children list
 *
 * @param {string} parentPageId - parent page id
 * @param {Page[]} pages - list of all available pages
 * @param {PagesOrder[]} pagesOrder - list of pages order
 * @param {number} level
 * @param {number} currentLevel
 *
 * @return {Page[]}
 */
function createMenuTree(parentPageId, pages, pagesOrder, level = 1, currentLevel = 1) {
    const childrenOrder = pagesOrder.find(order => order.data.page === parentPageId);
    /**
     * branch is a page children in tree
     * if we got some children order on parents tree, then we push found pages in order sequence
     * otherwise just find all pages includes parent tree
     */
    let ordered = [];
    if (childrenOrder) {
        ordered = childrenOrder.order.map((pageId) => {
            return pages.find(page => page._id === pageId);
        });
    }
    const unordered = pages.filter(page => page._parent === parentPageId);
    const branch = Array.from(new Set([...ordered, ...unordered]));
    /**
     * stop recursion when we got the passed max level
     */
    if (currentLevel === level + 1) {
        return [];
    }
    /**
     * Each parents children can have subbranches
     */
    return branch.filter(page => page && page._id).map(page => {
        return Object.assign({
            children: createMenuTree(page._id, pages, pagesOrder, level, currentLevel + 1)
        }, page.data);
    });
}
/**
 * Middleware for all /page/... routes
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
exports.default = asyncMiddleware_1.default((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /**
     * Pages without parent
     * @type {string}
     */
    const parentIdOfRootPages = '0';
    try {
        const pages = yield pages_1.default.getAll();
        const pagesOrder = yield pagesOrder_1.default.getAll();
        res.locals.menu = createMenuTree(parentIdOfRootPages, pages, pagesOrder, 2);
    }
    catch (error) {
        console.log('Can not load menu:', error);
    }
    next();
}));
