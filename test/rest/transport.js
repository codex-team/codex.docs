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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const file_type_1 = __importDefault(require("file-type"));
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const rimraf_1 = __importDefault(require("rimraf"));
const { expect } = chai_1.default;
const server_1 = __importDefault(require("../../bin/server"));
const app = server_1.default.app;
const file_1 = __importDefault(require("../../src/models/file"));
const config_1 = __importDefault(require("config"));
chai_1.default.use(chai_http_1.default);
describe('Transport routes: ', () => {
    let agent;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = chai_1.default.request.agent(app);
        if (!fs_1.default.existsSync('./' + config_1.default.get('uploads'))) {
            fs_1.default.mkdirSync('./' + config_1.default.get('uploads'));
        }
    }));
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        const pathToDB = path_1.default.resolve(__dirname, '../../', config_1.default.get('database'), './files.db');
        if (fs_1.default.existsSync(pathToDB)) {
            fs_1.default.unlinkSync(pathToDB);
        }
        if (fs_1.default.existsSync('./' + config_1.default.get('uploads'))) {
            rimraf_1.default.sync('./' + config_1.default.get('uploads'));
        }
    }));
    it('Uploading an image', () => __awaiter(void 0, void 0, void 0, function* () {
        const name = 'test_image.png';
        const image = fs_1.default.readFileSync(path_1.default.resolve(`./test/rest/${name}`));
        const res = yield agent
            .post('/api/transport/image')
            .attach('image', image, name);
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { body } = res;
        const file = yield file_1.default.get(body._id);
        expect(body.success).to.equal(1);
        expect(file._id).to.equal(body._id);
        expect(file.name).to.equal(name);
        expect(file.filename).to.equal(body.filename);
        expect(file.path).to.equal(body.path);
        const type = yield file_type_1.default.fromBuffer(image);
        expect(type).to.be.not.undefined;
        if (type !== undefined) {
            expect(file.mimetype).to.equal(type.mime);
            expect(file.size).to.equal(image.byteLength);
            expect(file.path).to.be.not.undefined;
            if (file.path !== undefined) {
                const getRes = yield agent
                    .get(file.path);
                expect(getRes).to.have.status(200);
                expect(getRes).to.have.header('content-type', type.mime);
            }
        }
    }));
    it('Uploading an image with map option', () => __awaiter(void 0, void 0, void 0, function* () {
        const name = 'test_image.png';
        const image = fs_1.default.readFileSync(path_1.default.resolve(`./test/rest/${name}`));
        const res = yield agent
            .post('/api/transport/image')
            .attach('image', image, name)
            .field('map', JSON.stringify({ _id: '_id', path: 'file:url', size: 'file:size', name: 'file:name' }));
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { body } = res;
        const file = yield file_1.default.get(body._id);
        expect(body.success).to.equal(1);
        expect(file.name).to.equal(body.file.name);
        expect(file.path).to.equal(body.file.url);
        expect(file.size).to.equal(body.file.size);
    }));
    it('Uploading a file', () => __awaiter(void 0, void 0, void 0, function* () {
        const name = 'test_file.json';
        const json = fs_1.default.readFileSync(path_1.default.resolve(`./test/rest/${name}`));
        const res = yield agent
            .post('/api/transport/file')
            .attach('file', json, name);
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { body } = res;
        const file = yield file_1.default.get(body._id);
        expect(body.success).to.equal(1);
        expect(file._id).to.equal(body._id);
        expect(file.name).to.equal(name);
        expect(file.filename).to.equal(body.filename);
        expect(file.path).to.equal(body.path);
        expect(file.size).to.equal(json.byteLength);
        expect(file.path).to.be.not.undefined;
        if (file.path !== undefined) {
            const getRes = yield agent
                .get(file.path);
            expect(getRes).to.have.status(200);
            expect(getRes).to.have.header('content-type', new RegExp(`^${file.mimetype}`));
        }
    }));
    it('Uploading a file with map option', () => __awaiter(void 0, void 0, void 0, function* () {
        const name = 'test_file.json';
        const json = fs_1.default.readFileSync(path_1.default.resolve(`./test/rest/${name}`));
        const res = yield agent
            .post('/api/transport/file')
            .attach('file', json, name)
            .field('map', JSON.stringify({ _id: '_id', path: 'file:url', size: 'file:size', name: 'file:name' }));
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { body } = res;
        const file = yield file_1.default.get(body._id);
        expect(body.success).to.equal(1);
        expect(file.name).to.equal(body.file.name);
        expect(file.path).to.equal(body.file.url);
        expect(file.size).to.equal(body.file.size);
    }));
    it('Send file URL to fetch', () => __awaiter(void 0, void 0, void 0, function* () {
        const url = 'https://codex.so/public/app/img/codex-logo.svg';
        const res = yield agent
            .post('/api/transport/fetch')
            .field('url', url);
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { body } = res;
        const file = yield file_1.default.get(body._id);
        expect(body.success).to.equal(1);
        expect(file._id).to.equal(body._id);
        expect(file.name).to.equal(body.name);
        expect(file.filename).to.equal(body.filename);
        expect(file.path).to.equal(body.path);
        expect(file.size).to.equal(body.size);
        expect(file.path).to.be.not.undefined;
        if (file.path !== undefined) {
            const getRes = yield agent
                .get(file.path);
            expect(getRes).to.have.status(200);
            expect(getRes).to.have.header('content-type', file.mimetype);
        }
    }));
    it('Send an file URL to fetch with map option', () => __awaiter(void 0, void 0, void 0, function* () {
        const url = 'https://codex.so/public/app/img/codex-logo.svg';
        const res = yield agent
            .post('/api/transport/fetch')
            .field('url', url)
            .field('map', JSON.stringify({ _id: '_id', path: 'file:url', size: 'file:size', name: 'file:name' }));
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { body } = res;
        const file = yield file_1.default.get(body._id);
        expect(body.success).to.equal(1);
        expect(file.name).to.equal(body.file.name);
        expect(file.path).to.equal(body.file.url);
        expect(file.size).to.equal(body.file.size);
    }));
    it('Negative tests for file uploading', () => __awaiter(void 0, void 0, void 0, function* () {
        let res = yield agent
            .post('/api/transport/file')
            .send();
        let { body } = res;
        expect(res).to.have.status(400);
        expect(body.success).to.equal(0);
        const name = 'test_file.json';
        const json = fs_1.default.readFileSync(path_1.default.resolve(`./test/rest/${name}`));
        res = yield agent
            .post('/api/transport/file')
            .attach('file', json, name)
            .field('map', '{unvalid_json)');
        body = res.body;
        expect(res).to.have.status(500);
        expect(body.success).to.equal(0);
    }));
    it('Negative tests for image uploading', () => __awaiter(void 0, void 0, void 0, function* () {
        let res = yield agent
            .post('/api/transport/image')
            .send();
        let { body } = res;
        expect(res).to.have.status(400);
        expect(body.success).to.equal(0);
        let name = 'test_file.json';
        const json = fs_1.default.readFileSync(path_1.default.resolve(`./test/rest/${name}`));
        res = yield agent
            .post('/api/transport/image')
            .attach('image', json, name);
        expect(res).to.have.status(400);
        name = 'test_image.png';
        const image = fs_1.default.readFileSync(path_1.default.resolve(`./test/rest/${name}`));
        res = yield agent
            .post('/api/transport/image')
            .attach('image', image, name)
            .field('map', '{unvalid_json)');
        body = res.body;
        expect(res).to.have.status(500);
        expect(body.success).to.equal(0);
    }));
    it('Negative tests for file fetching', () => __awaiter(void 0, void 0, void 0, function* () {
        let res = yield agent
            .post('/api/transport/fetch')
            .send();
        let { body } = res;
        expect(res).to.have.status(400);
        expect(body.success).to.equal(0);
        const url = 'https://invalidurl';
        res = yield agent
            .post('/api/transport/fetch')
            .field('url', url);
        body = res.body;
        expect(res).to.have.status(500);
        expect(body.success).to.equal(0);
    })).timeout(50000);
});
