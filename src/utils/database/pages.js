"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nedb_1 = __importDefault(require("nedb"));
const config_1 = __importDefault(require("config"));
const db = new nedb_1.default({ filename: `./${config_1.default.get('database')}/pages.db`, autoload: true });
exports.default = db;
