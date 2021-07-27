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
const open_graph_scraper_1 = __importDefault(require("open-graph-scraper"));
const router = express_1.default.Router();
/**
 * Accept file url to fetch
 */
router.get('/fetchUrl', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = {
        success: 0
    };
    if (!req.query.url) {
        res.status(400).json(response);
        return;
    }
    if (typeof req.query.url !== 'string') {
        return;
    }
    try {
        const linkData = (yield open_graph_scraper_1.default({ url: req.query.url })).result;
        if (!linkData.success) {
            return;
        }
        response.success = 1;
        response.meta = {
            title: linkData.ogTitle,
            description: linkData.ogDescription,
            site_name: linkData.ogSiteName,
            image: {
                url: undefined
            }
        };
        if (linkData.ogImage !== undefined) {
            response.meta.image = { url: linkData.ogImage.toString() };
        }
        res.status(200).json(response);
    }
    catch (e) {
        console.log(e);
        res.status(500).json(response);
    }
}));
exports.default = router;
