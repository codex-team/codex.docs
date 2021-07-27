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
require('dotenv').config();
const config_1 = __importDefault(require("config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = __importDefault(require("../../controllers/users"));
/**
 * Middleware for checking jwt token
 * @param req
 * @param res
 * @param next
 */
function verifyToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let token = req.cookies.authToken;
        const userDoc = yield users_1.default.get();
        if (!userDoc || userDoc instanceof Error) {
            res.locals.isAuthorized = false;
            next();
            return;
        }
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, userDoc.passHash + config_1.default.get('secret'));
            res.locals.isAuthorized = !!decodedToken;
        }
        catch (e) {
            res.locals.isAuthorized = false;
        }
        next();
    });
}
exports.default = verifyToken;
;
