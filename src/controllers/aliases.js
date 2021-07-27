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
const alias_1 = __importDefault(require("../models/alias"));
/**
 * @class Aliases
 * @classdesc Aliases controller
 */
class Aliases {
    /**
     * Find and return entity with given alias
     *
     * @param {string} aliasName - alias name of entity
     * @returns {Promise<Alias>}
     */
    static get(aliasName) {
        return __awaiter(this, void 0, void 0, function* () {
            const alias = yield alias_1.default.get(aliasName);
            if (!alias.id) {
                throw new Error('Entity with given alias does not exist');
            }
            return alias;
        });
    }
}
exports.default = Aliases;
