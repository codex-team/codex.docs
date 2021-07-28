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
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const mime_1 = __importDefault(require("mime"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const transport_1 = __importDefault(require("../../controllers/transport"));
const crypto_1 = require("../../utils/crypto");
const config_1 = __importDefault(require("config"));
const router = express_1.Router();
/**
 * Multer storage for uploaded files and images
 * @type {StorageEngine}
 */
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = config_1.default.get('uploads') || 'public/uploads';
        mkdirp_1.default(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const filename = yield crypto_1.random16();
        cb(null, `${filename}.${mime_1.default.getExtension(file.mimetype)}`);
    })
});
/**
 * Multer middleware for image uploading
 */
const imageUploader = multer_1.default({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!/image/.test(file.mimetype) && !/video\/mp4/.test(file.mimetype)) {
            cb(null, false);
            return;
        }
        cb(null, true);
    }
}).fields([{ name: 'image', maxCount: 1 }]);
/**
 * Multer middleware for file uploading
 */
const fileUploader = multer_1.default({
    storage: storage
}).fields([{ name: 'file', maxCount: 1 }]);
/**
 * Accepts images to upload
 */
router.post('/transport/image', imageUploader, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = { success: 0, message: '' };
    if (req.files === undefined) {
        response.message = 'No files found';
        res.status(400).json(response);
        return;
    }
    if (!('image' in req.files)) {
        res.status(400).json(response);
        return;
    }
    try {
        Object.assign(response, yield transport_1.default.save(req.files.image[0], req.body.map ? JSON.parse(req.body.map) : undefined));
        response.success = 1;
        res.status(200).json(response);
    }
    catch (e) {
        res.status(500).json(response);
    }
}));
/**
 * Accepts files to upload
 */
router.post('/transport/file', fileUploader, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = { success: 0 };
    if (req.files === undefined) {
        res.status(400).json(response);
        return;
    }
    if (!('file' in req.files)) {
        res.status(400).json(response);
        return;
    }
    try {
        Object.assign(response, yield transport_1.default.save(req.files.file[0], req.body.map ? JSON.parse(req.body.map) : undefined));
        response.success = 1;
        res.status(200).json(response);
    }
    catch (e) {
        res.status(500).json(response);
    }
}));
/**
 * Accept file url to fetch
 */
router.post('/transport/fetch', multer_1.default().none(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = { success: 0 };
    if (!req.body.url) {
        res.status(400).json(response);
        return;
    }
    try {
        Object.assign(response, yield transport_1.default.fetch(req.body.url, req.body.map ? JSON.parse(req.body.map) : undefined));
        response.success = 1;
        res.status(200).json(response);
    }
    catch (e) {
        console.log(e);
        res.status(500).json(response);
    }
}));
exports.default = router;
