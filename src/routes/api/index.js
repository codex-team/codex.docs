"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const pages_1 = __importDefault(require("./pages"));
const transport_1 = __importDefault(require("./transport"));
const links_1 = __importDefault(require("./links"));
router.use('/', pages_1.default);
router.use('/', transport_1.default);
router.use('/', links_1.default);
exports.default = router;
