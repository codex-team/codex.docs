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
const express_1 = __importDefault(require("express"));
const pages_1 = __importDefault(require("../../controllers/pages"));
const pagesOrder_1 = __importDefault(require("../../controllers/pagesOrder"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const multer = multer_1.default();
/**
 * GET /page/:id
 *
 * Return PageData of page with given id
 */
router.get('/page/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = yield pages_1.default.get(req.params.id);
        res.json({
            success: true,
            result: page.data
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
}));
/**
 * GET /pages
 *
 * Return PageData for all pages
 */
router.get('/pages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pages = yield pages_1.default.getAll();
        res.json({
            success: true,
            result: pages
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
}));
/**
 * PUT /page
 *
 * Create new page in the database
 */
router.put('/page', multer.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, body, parent } = req.body;
        const page = yield pages_1.default.insert({ title, body, parent });
        if (page._id === undefined) {
            throw new Error("Page not found");
        }
        /** push to the orders array */
        yield pagesOrder_1.default.push(parent, page._id);
        res.json({
            success: true,
            result: page
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
}));
/**
 * POST /page/:id
 *
 * Update page data in the database
 */
router.post('/page/:id', multer.none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const { title, body, parent, putAbovePageId, uri } = req.body;
        const pages = yield pages_1.default.getAll();
        let page = yield pages_1.default.get(id);
        if (page._id === undefined) {
            throw new Error("Page not found");
        }
        if (page._parent !== parent) {
            yield pagesOrder_1.default.move(page._parent, parent, id);
        }
        else {
            if (putAbovePageId && putAbovePageId !== '0') {
                const unordered = pages.filter(_page => _page._parent === page._parent).map(_page => _page._id);
                const unOrdered = [];
                unordered.forEach((item, index) => {
                    if (typeof item === 'string') {
                        unOrdered.push(item);
                    }
                });
                yield pagesOrder_1.default.update(unOrdered, page._id, page._parent, putAbovePageId);
            }
        }
        page = yield pages_1.default.update(id, { title, body, parent, uri });
        res.json({
            success: true,
            result: page
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
}));
/**
 * DELETE /page/:id
 *
 * Remove page from the database
 */
router.delete('/page/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pageId = req.params.id;
        const page = yield pages_1.default.get(pageId);
        if (page._id === undefined) {
            throw new Error("Page not found");
        }
        const parentPageOrder = yield pagesOrder_1.default.get(page._parent);
        const pageBeforeId = parentPageOrder.getPageBefore(page._id);
        const pageAfterId = parentPageOrder.getPageAfter(page._id);
        let pageToRedirect;
        if (pageBeforeId) {
            pageToRedirect = yield pages_1.default.get(pageBeforeId);
        }
        else if (pageAfterId) {
            pageToRedirect = yield pages_1.default.get(pageAfterId);
        }
        else {
            pageToRedirect = page._parent !== '0' ? yield pages_1.default.get(page._parent) : null;
        }
        /**
         * remove current page and go deeper to remove children with orders
         *
         * @param {string} startFrom
         * @returns {Promise<void>}
         */
        const deleteRecursively = (startFrom) => __awaiter(void 0, void 0, void 0, function* () {
            let order = [];
            try {
                const children = yield pagesOrder_1.default.get(startFrom);
                order = children.order;
            }
            catch (e) { }
            order.forEach((id) => __awaiter(void 0, void 0, void 0, function* () {
                yield deleteRecursively(id);
            }));
            yield pages_1.default.remove(startFrom);
            try {
                yield pagesOrder_1.default.remove(startFrom);
            }
            catch (e) { }
        });
        yield deleteRecursively(req.params.id);
        // remove also from parent's order
        parentPageOrder.remove(req.params.id);
        yield parentPageOrder.save();
        res.json({
            success: true,
            result: pageToRedirect
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
}));
exports.default = router;
