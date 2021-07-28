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
const file_1 = __importDefault(require("../../src/models/file"));
const database_1 = __importDefault(require("../../src/utils/database"));
const files = database_1.default['files'];
describe('File model', () => {
    after(() => {
        const pathToDB = path_1.default.resolve(__dirname, '../../', config_1.default.get('database'), './files.db');
        if (fs_1.default.existsSync(pathToDB)) {
            fs_1.default.unlinkSync(pathToDB);
        }
    });
    it('Working with empty model', () => __awaiter(void 0, void 0, void 0, function* () {
        let file = new file_1.default();
        chai_1.expect(file.data).to.be.a('object');
        let { data } = file;
        chai_1.expect(data._id).to.be.undefined;
        chai_1.expect(data.name).to.be.undefined;
        chai_1.expect(data.filename).to.be.undefined;
        chai_1.expect(data.path).to.be.undefined;
        chai_1.expect(data.size).to.be.undefined;
        chai_1.expect(data.mimetype).to.be.undefined;
        file = new file_1.default();
        data = file.data;
        chai_1.expect(data._id).to.be.undefined;
        chai_1.expect(data.name).to.be.undefined;
        chai_1.expect(data.filename).to.be.undefined;
        chai_1.expect(data.path).to.be.undefined;
        chai_1.expect(data.size).to.be.undefined;
        chai_1.expect(data.mimetype).to.be.undefined;
        const initialData = {
            _id: 'file_id',
            name: 'filename',
            filename: 'randomname',
            path: '/uploads/randomname',
            size: 1024,
            mimetype: 'image/png'
        };
        file = new file_1.default(initialData);
        // const json = file.toJSON();
        data = file.data;
        chai_1.expect(data._id).to.equal(initialData._id);
        chai_1.expect(data.name).to.equal(initialData.name);
        chai_1.expect(data.filename).to.equal(initialData.filename);
        chai_1.expect(data.path).to.equal(initialData.path);
        chai_1.expect(data.size).to.equal(initialData.size);
        chai_1.expect(data.mimetype).to.equal(initialData.mimetype);
        const update = {
            _id: '12345',
            name: 'updated filename',
            filename: 'updated randomname',
            path: '/uploads/updated randomname',
            size: 2048,
            mimetype: 'image/jpeg'
        };
        file.data = update;
        data = file.data;
        chai_1.expect(data._id).to.equal(initialData._id);
        chai_1.expect(data.name).to.equal(update.name);
        chai_1.expect(data.filename).to.equal(update.filename);
        chai_1.expect(data.path).to.equal(update.path);
        chai_1.expect(data.size).to.equal(update.size);
        chai_1.expect(data.mimetype).to.equal(update.mimetype);
    }));
    it('Saving, updating and deleting model in the database', () => __awaiter(void 0, void 0, void 0, function* () {
        const initialData = {
            name: 'filename',
            filename: 'randomname',
            path: '/uploads/randomname',
            size: 1024,
            mimetype: 'image/png'
        };
        const file = new file_1.default(initialData);
        const savedFile = yield file.save();
        chai_1.expect(savedFile._id).not.be.undefined;
        chai_1.expect(savedFile.name).to.equal(initialData.name);
        chai_1.expect(savedFile.filename).to.equal(initialData.filename);
        chai_1.expect(savedFile.path).to.equal(initialData.path);
        chai_1.expect(savedFile.size).to.equal(initialData.size);
        chai_1.expect(savedFile.mimetype).to.equal(initialData.mimetype);
        const insertedFile = yield files.findOne({ _id: file._id });
        chai_1.expect(insertedFile._id).to.equal(file._id);
        chai_1.expect(insertedFile.name).to.equal(file.name);
        chai_1.expect(insertedFile.filename).to.equal(file.filename);
        chai_1.expect(insertedFile.path).to.equal(file.path);
        chai_1.expect(insertedFile.size).to.equal(file.size);
        chai_1.expect(insertedFile.mimetype).to.equal(file.mimetype);
        const updateData = {
            _id: '12345',
            name: 'updated filename',
            filename: 'updated randomname',
            path: '/uploads/updated randomname',
            size: 2048,
            mimetype: 'image/jpeg'
        };
        file.data = updateData;
        yield file.save();
        chai_1.expect(file._id).to.equal(insertedFile._id);
        const updatedFile = yield files.findOne({ _id: file._id });
        chai_1.expect(updatedFile._id).to.equal(savedFile._id);
        chai_1.expect(updatedFile.name).to.equal(updateData.name);
        chai_1.expect(updatedFile.filename).to.equal(updateData.filename);
        chai_1.expect(updatedFile.path).to.equal(updateData.path);
        chai_1.expect(updatedFile.size).to.equal(updateData.size);
        chai_1.expect(updatedFile.mimetype).to.equal(updateData.mimetype);
        yield file.destroy();
        chai_1.expect(file._id).to.be.undefined;
        const removedFile = yield files.findOne({ _id: updatedFile._id });
        chai_1.expect(removedFile).to.be.null;
    }));
    it('Static get method', () => __awaiter(void 0, void 0, void 0, function* () {
        const initialData = {
            name: 'filename',
            filename: 'randomname',
            path: '/uploads/randomname',
            size: 1024,
            mimetype: 'image/png'
        };
        const file = new file_1.default(initialData);
        const savedFile = yield file.save();
        if (savedFile._id !== undefined) {
            const foundFile = yield file_1.default.get(savedFile._id);
            const { data } = foundFile;
            chai_1.expect(data._id).to.equal(savedFile._id);
            chai_1.expect(data.name).to.equal(savedFile.name);
            chai_1.expect(data.filename).to.equal(savedFile.filename);
            chai_1.expect(data.path).to.equal(savedFile.path);
            chai_1.expect(data.size).to.equal(savedFile.size);
            chai_1.expect(data.mimetype).to.equal(savedFile.mimetype);
        }
        yield file.destroy();
    }));
    it('Static getByFilename method', () => __awaiter(void 0, void 0, void 0, function* () {
        const initialData = {
            name: 'filename',
            filename: 'randomname',
            path: '/uploads/randomname',
            size: 1024,
            mimetype: 'image/png'
        };
        const file = new file_1.default(initialData);
        const savedFile = yield file.save();
        if (savedFile.filename !== undefined) {
            const foundFile = yield file_1.default.getByFilename(savedFile.filename);
            const { data } = foundFile;
            chai_1.expect(data._id).to.equal(savedFile._id);
            chai_1.expect(data.name).to.equal(savedFile.name);
            chai_1.expect(data.filename).to.equal(savedFile.filename);
            chai_1.expect(data.path).to.equal(savedFile.path);
            chai_1.expect(data.size).to.equal(savedFile.size);
            chai_1.expect(data.mimetype).to.equal(savedFile.mimetype);
        }
        yield file.destroy();
    }));
    it('Static getAll method', () => __awaiter(void 0, void 0, void 0, function* () {
        const filesToSave = [
            new file_1.default({
                name: 'filename1',
                filename: 'randomname1',
                path: '/uploads/randomname1',
                size: 1024,
                mimetype: 'image/png'
            }),
            new file_1.default({
                name: 'filename2',
                filename: 'randomname2',
                path: '/uploads/randomname2',
                size: 2048,
                mimetype: 'image/jpeg'
            }),
        ];
        const savedFiles = yield Promise.all(filesToSave.map(file => file.save()));
        const foundFiles = yield file_1.default.getAll({ _id: { $in: savedFiles.map(file => file._id) } });
        chai_1.expect(foundFiles.length).to.equal(2);
        foundFiles.forEach((file, i) => {
            chai_1.expect(file.name).to.equal(filesToSave[i].name);
            chai_1.expect(file.filename).to.equal(filesToSave[i].filename);
            chai_1.expect(file.path).to.equal(filesToSave[i].path);
            chai_1.expect(file.size).to.equal(filesToSave[i].size);
            chai_1.expect(file.mimetype).to.equal(filesToSave[i].mimetype);
        });
    }));
});
