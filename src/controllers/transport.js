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
const file_type_1 = __importDefault(require("file-type"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const file_1 = __importDefault(require("../models/file"));
const crypto_1 = __importDefault(require("../utils/crypto"));
const objects_1 = __importDefault(require("../utils/objects"));
const config_1 = __importDefault(require("config"));
const random16 = crypto_1.default.random16;
/**
 * @class Transport
 * @classdesc Transport controller
 *
 * Allows to save files from client or fetch them by URL
 */
class Transport {
    /**
     * Saves file passed from client
     *
     * @param {object} multerData - file data from multer
     * @param {string} multerData.originalname - original name of the file
     * @param {string} multerData.filename - name of the uploaded file
     * @param {string} multerData.path - path to the uploaded file
     * @param {number} multerData.size - size of the uploaded file
     * @param {string} multerData.mimetype - MIME type of the uploaded file
     *
     * @param {object} map - object that represents how should fields of File object should be mapped to response
     * @returns {Promise<FileData>}
     */
    static save(multerData, map) {
        return __awaiter(this, void 0, void 0, function* () {
            const { originalname: name, path, filename, size, mimetype } = multerData;
            const file = new file_1.default({
                name,
                filename,
                path,
                size,
                mimetype,
            });
            yield file.save();
            let response = file.data;
            if (map) {
                response = Transport.composeResponse(file, map);
            }
            return response;
        });
    }
    /**
     * Fetches file by passed URL
     *
     * @param {string} url - URL of the file
     * @param {object} map - object that represents how should fields of File object should be mapped to response
     * @returns {Promise<FileData>}
     */
    static fetch(url, map) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetchedFile = yield node_fetch_1.default(url);
            const buffer = yield fetchedFile.buffer();
            const filename = yield random16();
            const type = yield file_type_1.default.fromBuffer(buffer);
            const ext = type ? type.ext : path_1.default.extname(url).slice(1);
            fs_1.default.writeFileSync(`${config_1.default.get('uploads')}/${filename}.${ext}`, buffer);
            const file = new file_1.default({
                name: url,
                filename: `${filename}.${ext}`,
                path: `${config_1.default.get('uploads')}/${filename}.${ext}`,
                size: buffer.length,
                mimetype: type ? type.mime : fetchedFile.headers.get('content-type'),
            });
            yield file.save();
            let response = file.data;
            if (map) {
                response = Transport.composeResponse(file, map);
            }
            return response;
        });
    }
    /**
     * Map fields of File object to response by provided map object
     *
     * @param {File} file
     * @param {object} map - object that represents how should fields of File object should be mapped to response
     *
     */
    static composeResponse(file, map) {
        ;
        const response = {};
        const { data } = file;
        Object.entries(map).forEach(([name, path]) => {
            const fields = path.split(':');
            if (fields.length > 1) {
                let object = {};
                const result = object;
                fields.forEach((field, i) => {
                    if (i === fields.length - 1) {
                        object[field] = data[name];
                        return;
                    }
                    object[field] = {};
                    object = object[field];
                });
                objects_1.default(response, result);
            }
            else {
                response[fields[0]] = data[name];
            }
        });
        return response;
    }
}
exports.default = Transport;
