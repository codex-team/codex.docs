"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const home_1 = __importDefault(require("./home"));
const pages_1 = __importDefault(require("./pages"));
const auth_1 = __importDefault(require("./auth"));
const aliases_1 = __importDefault(require("./aliases"));
const api_1 = __importDefault(require("./api"));
const pages_2 = __importDefault(require("./middlewares/pages"));
const router = express_1.default.Router();
router.use('/', pages_2.default, home_1.default);
router.use('/', pages_2.default, pages_1.default);
router.use('/', pages_2.default, auth_1.default);
router.use('/api', api_1.default);
router.use('/', aliases_1.default);
exports.default = router;
