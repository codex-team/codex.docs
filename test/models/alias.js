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
const chai_1 = require("chai");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("config"));
const alias_1 = __importDefault(require("../../src/models/alias"));
const crypto_1 = require("../../src/utils/crypto");
const database_1 = __importDefault(require("../../src/utils/database"));
const aliases = database_1.default['aliases'];
describe('Alias model', () => {
    after(() => {
        const pathToDB = path_1.default.resolve(__dirname, '../../', config_1.default.get('database'), './aliases.db');
        if (fs_1.default.existsSync(pathToDB)) {
            fs_1.default.unlinkSync(pathToDB);
        }
    });
    it('Working with empty model', () => __awaiter(void 0, void 0, void 0, function* () {
        let alias = new alias_1.default();
        chai_1.expect(alias.data).to.be.a('object');
        let { data } = alias;
        chai_1.expect(data._id).to.be.undefined;
        chai_1.expect(data.hash).to.be.undefined;
        chai_1.expect(data.type).to.be.undefined;
        chai_1.expect(data.deprecated).to.be.false;
        chai_1.expect(data.id).to.be.undefined;
        alias = new alias_1.default();
        data = alias.data;
        chai_1.expect(data._id).to.be.undefined;
        chai_1.expect(data.hash).to.be.undefined;
        chai_1.expect(data.type).to.be.undefined;
        chai_1.expect(data.deprecated).to.be.false;
        chai_1.expect(data.id).to.be.undefined;
        const initialData = {
            _id: 'alias_id',
            type: alias_1.default.types.PAGE,
            id: 'page_id'
        };
        const aliasName = 'alias name';
        alias = new alias_1.default(initialData, aliasName);
        data = alias.data;
        chai_1.expect(data._id).to.equal(initialData._id);
        chai_1.expect(data.hash).to.equal(crypto_1.binaryMD5(aliasName));
        chai_1.expect(data.type).to.equal(initialData.type);
        chai_1.expect(data.deprecated).to.equal(false);
        const update = {
            type: alias_1.default.types.PAGE,
            id: 'page_id',
            hash: crypto_1.binaryMD5('another test hash'),
            deprecated: true
        };
        alias.data = update;
        data = alias.data;
        chai_1.expect(data._id).to.equal(initialData._id);
        chai_1.expect(data.type).to.equal(update.type);
        chai_1.expect(data.hash).to.equal(update.hash);
        chai_1.expect(data.deprecated).to.equal(update.deprecated);
    }));
    it('Static get method', () => __awaiter(void 0, void 0, void 0, function* () {
        const initialData = {
            type: alias_1.default.types.PAGE,
            id: 'page_id'
        };
        const aliasName = 'alias name';
        const alias = new alias_1.default(initialData, aliasName);
        const savedAlias = yield alias.save();
        const foundAlias = yield alias_1.default.get(aliasName);
        const { data } = foundAlias;
        chai_1.expect(data._id).to.equal(savedAlias._id);
        chai_1.expect(data.hash).to.equal(crypto_1.binaryMD5(aliasName));
        chai_1.expect(data.type).to.equal(initialData.type);
        chai_1.expect(data.deprecated).to.equal(false);
    }));
    it('Saving, updating and deleting model in the database', () => __awaiter(void 0, void 0, void 0, function* () {
        const initialData = {
            type: alias_1.default.types.PAGE,
            id: 'page_id'
        };
        const aliasName = 'alias name';
        const alias = new alias_1.default(initialData, aliasName);
        const savedAlias = yield alias.save();
        chai_1.expect(savedAlias._id).not.be.undefined;
        chai_1.expect(savedAlias.hash).to.equal(crypto_1.binaryMD5(aliasName));
        chai_1.expect(savedAlias.type).to.equal(initialData.type);
        chai_1.expect(savedAlias.id).to.equal(initialData.id);
        chai_1.expect(savedAlias.deprecated).to.equal(false);
        const insertedAlias = yield aliases.findOne({ _id: savedAlias._id });
        chai_1.expect(insertedAlias._id).to.equal(savedAlias._id);
        chai_1.expect(insertedAlias.hash).to.equal(savedAlias.hash);
        chai_1.expect(insertedAlias.type).to.equal(savedAlias.type);
        chai_1.expect(insertedAlias.id).to.equal(savedAlias.id);
        chai_1.expect(insertedAlias.deprecated).to.equal(savedAlias.deprecated);
        const updateData = {
            type: alias_1.default.types.PAGE,
            id: 'page_id',
            hash: crypto_1.binaryMD5('another test hash'),
            deprecated: true
        };
        alias.data = updateData;
        yield alias.save();
        chai_1.expect(alias._id).to.equal(insertedAlias._id);
        const updatedAlias = yield aliases.findOne({ _id: alias._id });
        chai_1.expect(updatedAlias._id).to.equal(savedAlias._id);
        chai_1.expect(updatedAlias.hash).to.equal(updateData.hash);
        chai_1.expect(updatedAlias.type).to.equal(updateData.type);
        chai_1.expect(updatedAlias.id).to.equal(updateData.id);
        chai_1.expect(updatedAlias.deprecated).to.equal(updateData.deprecated);
    }));
});
