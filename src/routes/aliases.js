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
const aliases_1 = __importDefault(require("../controllers/aliases"));
const pages_1 = __importDefault(require("../controllers/pages"));
const alias_1 = __importDefault(require("../models/alias"));
const token_1 = __importDefault(require("./middlewares/token"));
const router = express_1.default.Router();
/**
 * GET /*
 *
 * Return document with given alias
 */
router.get('*', token_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let url = req.originalUrl.slice(1); // Cuts first '/' character
        const queryParamsIndex = url.indexOf('?');
        if (queryParamsIndex !== -1) {
            url = url.slice(0, queryParamsIndex); // Cuts off query params
        }
        const alias = yield aliases_1.default.get(url);
        if (alias.id === undefined) {
            throw new Error("Alias not found");
        }
        switch (alias.type) {
            case alias_1.default.types.PAGE: {
                const page = yield pages_1.default.get(alias.id);
                const pageParent = page.parent;
                res.render('pages/page', {
                    page,
                    pageParent,
                    config: req.app.locals.config,
                });
            }
        }
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message,
        });
    }
}));
exports.default = router;
