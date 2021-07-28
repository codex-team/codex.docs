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
const server_1 = __importDefault(require("../../bin/server"));
const app = server_1.default.app;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("config"));
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const { expect } = chai_1.default;
chai_1.default.use(chai_http_1.default);
describe('Aliases REST: ', () => {
    let agent;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = chai_1.default.request.agent(app);
    }));
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        const pathToDB = path_1.default.resolve(__dirname, '../../', config_1.default.get('database'), './pages.db');
        if (fs_1.default.existsSync(pathToDB)) {
            fs_1.default.unlinkSync(pathToDB);
        }
        const pathToAliasDB = path_1.default.resolve(__dirname, '../../', config_1.default.get('database'), './aliases.db');
        if (fs_1.default.existsSync(pathToAliasDB)) {
            fs_1.default.unlinkSync(pathToAliasDB);
        }
    }));
    it('Finding page with alias', () => __awaiter(void 0, void 0, void 0, function* () {
        const body = {
            time: 1548375408533,
            blocks: [
                {
                    type: 'header',
                    data: {
                        text: 'Test header'
                    }
                }
            ]
        };
        const put = yield agent
            .put('/api/page')
            .send({ body });
        expect(put).to.have.status(200);
        expect(put).to.be.json;
        const { result: { uri } } = put.body;
        const get = yield agent.get('/' + uri);
        expect(get).to.have.status(200);
    }));
});
