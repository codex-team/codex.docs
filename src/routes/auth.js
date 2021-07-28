"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = __importDefault(require("../controllers/users"));
const config_1 = __importDefault(require("config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const csurf_1 = __importDefault(require("csurf"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const router = express_1.default.Router();
const csrfProtection = csurf_1.default({ cookie: true });
const parseForm = express_1.default.urlencoded({ extended: false });
/**
 * Authorization page
 */
router.get('/auth', csrfProtection, function (req, res) {
    res.render('auth', {
        title: 'Login page',
        csrfToken: req.csrfToken(),
    });
});
/**
 * Process given password
 */
router.post('/auth', parseForm, csrfProtection, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userDoc = yield users_1.default.get();
    if (!userDoc || userDoc instanceof Error) {
        res.render('auth', {
            title: 'Login page',
            header: 'Password not set',
            csrfToken: req.csrfToken(),
        });
        return;
    }
    const passHash = userDoc.passHash;
    bcrypt_1.default.compare(req.body.password, passHash, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
        if (err || result === false) {
            res.render('auth', {
                title: 'Login page',
                header: 'Wrong password',
                csrfToken: req.csrfToken(),
            });
        }
        const token = jsonwebtoken_1.default.sign({
            iss: 'Codex Team',
            sub: 'auth',
            iat: Date.now(),
        }, passHash + config_1.default.get('secret'));
        res.cookie('authToken', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        });
        res.redirect('/');
    }));
}));
exports.default = router;
