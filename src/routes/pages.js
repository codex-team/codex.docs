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
const pages_1 = __importDefault(require("../controllers/pages"));
const pagesOrder_1 = __importDefault(require("../controllers/pagesOrder"));
const token_1 = __importDefault(require("./middlewares/token"));
const locals_1 = __importDefault(require("./middlewares/locals"));
const router = express_1.default.Router();
/**
 * Create new page form
 */
router.get('/page/new', token_1.default, locals_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pagesAvailable = yield pages_1.default.getAll();
    res.render('pages/form', {
        pagesAvailable,
        page: null,
    });
}));
/**
 * Edit page form
 */
router.get('/page/edit/:id', token_1.default, locals_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pageId = req.params.id;
    try {
        const page = yield pages_1.default.get(pageId);
        const pagesAvailable = yield pages_1.default.getAllExceptChildren(pageId);
        const parentsChildrenOrdered = yield pagesOrder_1.default.getOrderedChildren(pagesAvailable, pageId, page._parent, true);
        res.render('pages/form', {
            page,
            parentsChildrenOrdered,
            pagesAvailable,
        });
    }
    catch (error) {
        res.status(404);
        next(error);
    }
}));
/**
 * View page
 */
router.get('/page/:id', token_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pageId = req.params.id;
    try {
        const page = yield pages_1.default.get(pageId);
        const pageParent = yield page.parent;
        res.render('pages/page', {
            page,
            pageParent,
            config: req.app.locals.config,
        });
    }
    catch (error) {
        res.status(404);
        next(error);
    }
}));
exports.default = router;
