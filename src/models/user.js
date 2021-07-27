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
const index_1 = __importDefault(require("../utils/database/index"));
const db = index_1.default['password'];
/**
 * @class User
 * @class User model
 *
 * @property {string} passHash - hashed password
 */
class User {
    /**
     * @class
     *
     * @param {UserData} userData
     */
    constructor(userData) {
        this.passHash = userData.passHash;
    }
    /**
     * Find and return model of user.
     * User is only one.
     *
     * @returns {Promise<User>}
     */
    static get() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield db.findOne({});
            if (data instanceof Error || data === null) {
                return new Error('User not found');
            }
            return new User(data);
        });
    }
}
exports.default = User;
