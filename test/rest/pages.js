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
const page_1 = __importDefault(require("../../src/models/page"));
const page_2 = __importDefault(require("../../src/models/page"));
const pageOrder_1 = __importDefault(require("../../src/models/pageOrder"));
const translation_1 = __importDefault(require("../../src/utils/translation"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("config"));
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const { expect } = chai_1.default;
chai_1.default.use(chai_http_1.default);
describe('Pages REST: ', () => {
    let agent;
    const transformToUri = (text) => {
        return translation_1.default(text
            .replace(/&nbsp;/g, ' ')
            .replace(/[^a-zA-Z0-9А-Яа-яЁё ]/g, ' ')
            .replace(/  +/g, ' ')
            .trim()
            .toLowerCase()
            .split(' ')
            .join('-'));
    };
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        agent = chai_1.default.request.agent(app);
    }));
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        const pathToPagesDB = path_1.default.resolve(__dirname, '../../', config_1.default.get('database'), './pages.db');
        const pathToPagesOrderDB = path_1.default.resolve(__dirname, '../../', config_1.default.get('database'), './pagesOrder.db');
        const pathToAliasesDB = path_1.default.resolve(__dirname, '../../', config_1.default.get('database'), './aliases.db');
        if (fs_1.default.existsSync(pathToPagesDB)) {
            fs_1.default.unlinkSync(pathToPagesDB);
        }
        if (fs_1.default.existsSync(pathToPagesOrderDB)) {
            fs_1.default.unlinkSync(pathToPagesOrderDB);
        }
        if (fs_1.default.existsSync(pathToAliasesDB)) {
            fs_1.default.unlinkSync(pathToAliasesDB);
        }
    }));
    it('Creating page', () => __awaiter(void 0, void 0, void 0, function* () {
        const body = {
            blocks: [
                {
                    type: 'header',
                    data: {
                        text: 'Page header'
                    }
                }
            ]
        };
        const parent = 0;
        const res = yield agent
            .put('/api/page')
            .send({ body, parent });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { success, result } = res.body;
        expect(success).to.be.true;
        expect(result._id).to.be.a('string');
        expect(result.title).to.equal(body.blocks[0].data.text);
        expect(result.uri).to.equal(transformToUri(body.blocks[0].data.text));
        expect(result.body).to.deep.equal(body);
        const createdPage = yield page_1.default.get(result._id);
        expect(createdPage).not.be.null;
        expect(createdPage._id).to.equal(result._id);
        expect(createdPage.title).to.equal(body.blocks[0].data.text);
        expect(createdPage.uri).to.equal(transformToUri(body.blocks[0].data.text));
        expect(createdPage.body).to.deep.equal(body);
        const pageOrder = yield pageOrder_1.default.get('' + (createdPage.data.parent || 0));
        expect(pageOrder.order).to.be.an('array');
        yield createdPage.destroy();
        yield pageOrder.destroy();
    }));
    it('Page data validation on create', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield agent
            .put('/api/page')
            .send({ someField: 'Some text' });
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        const { success, error } = res.body;
        expect(success).to.be.false;
        expect(error).to.equal('Error: Some of required fields is missed');
    }));
    it('Finding page', () => __awaiter(void 0, void 0, void 0, function* () {
        const body = {
            blocks: [
                {
                    type: 'header',
                    data: {
                        text: 'Page header'
                    }
                }
            ]
        };
        const put = yield agent
            .put('/api/page')
            .send({ body });
        expect(put).to.have.status(200);
        expect(put).to.be.json;
        const { result: { _id } } = put.body;
        const get = yield agent.get(`/api/page/${_id}`);
        expect(get).to.have.status(200);
        expect(get).to.be.json;
        const { success } = get.body;
        expect(success).to.be.true;
        const foundPage = yield page_1.default.get(_id);
        const pageOrder = yield pageOrder_1.default.get('' + foundPage._parent);
        expect(foundPage._id).to.equal(_id);
        expect(foundPage.title).to.equal(body.blocks[0].data.text);
        expect(foundPage.uri).to.equal(transformToUri(body.blocks[0].data.text));
        expect(foundPage.body).to.deep.equal(body);
        yield pageOrder.destroy();
        yield foundPage.destroy();
    }));
    it('Finding page with not existing id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield agent.get('/api/page/not-existing-id');
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        const { success, error } = res.body;
        expect(success).to.be.false;
        expect(error).to.equal('Page with given id does not exist');
    }));
    it('Updating page', () => __awaiter(void 0, void 0, void 0, function* () {
        const body = {
            blocks: [
                {
                    type: 'header',
                    data: {
                        text: 'Page header'
                    }
                }
            ]
        };
        let res = yield agent
            .put('/api/page')
            .send({ body });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { result: { _id } } = res.body;
        const updatedBody = {
            blocks: [
                {
                    type: 'header',
                    data: {
                        text: 'Updated page header'
                    }
                }
            ]
        };
        const updatedUri = 'updated-uri';
        res = yield agent
            .post(`/api/page/${_id}`)
            .send({ body: updatedBody, uri: updatedUri });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { success, result } = res.body;
        expect(success).to.be.true;
        expect(result._id).to.equal(_id);
        expect(result.title).not.equal(body.blocks[0].data.text);
        expect(result.title).to.equal(updatedBody.blocks[0].data.text);
        expect(result.uri).not.equal(transformToUri(body.blocks[0].data.text));
        expect(result.uri).to.equal(updatedUri);
        expect(result.body).not.equal(body);
        expect(result.body).to.deep.equal(updatedBody);
        const updatedPage = yield page_1.default.get(_id);
        const pageOrder = yield pageOrder_1.default.get('' + updatedPage._parent);
        expect(updatedPage._id).to.equal(_id);
        expect(updatedPage.title).not.equal(body.blocks[0].data.text);
        expect(updatedPage.title).to.equal(updatedBody.blocks[0].data.text);
        expect(updatedPage.uri).not.equal(transformToUri(body.blocks[0].data.text));
        expect(updatedPage.uri).to.equal(updatedUri);
        expect(updatedPage.body).not.equal(body);
        expect(updatedPage.body).to.deep.equal(updatedBody);
        yield pageOrder.destroy();
        yield updatedPage.destroy();
    }));
    it('Handle multiple page creation with the same uri', () => __awaiter(void 0, void 0, void 0, function* () {
        const body = {
            blocks: [
                {
                    type: 'header',
                    data: {
                        text: 'Page header'
                    }
                }
            ]
        };
        let res = yield agent
            .put('/api/page')
            .send({ body });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { result: { _id } } = res.body;
        res = yield agent
            .put('/api/page')
            .send({ body: body });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { success: secondPageSuccess, result: secondPageResult } = res.body;
        expect(secondPageSuccess).to.be.true;
        expect(secondPageResult.title).to.equal(body.blocks[0].data.text);
        expect(secondPageResult.uri).to.equal(transformToUri(body.blocks[0].data.text) + '-1');
        expect(secondPageResult.body).to.deep.equal(body);
        const newFirstPageUri = 'New-uri';
        res = yield agent
            .post(`/api/page/${_id}`)
            .send({ body: body, uri: newFirstPageUri });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        res = yield agent
            .put('/api/page')
            .send({ body: body });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { success: thirdPageSuccess, result: thirdPageResult } = res.body;
        expect(thirdPageSuccess).to.be.true;
        expect(thirdPageResult.title).to.equal(body.blocks[0].data.text);
        expect(thirdPageResult.uri).to.equal(transformToUri(body.blocks[0].data.text));
        expect(thirdPageResult.body).to.deep.equal(body);
    }));
    it('Updating page with not existing id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield agent
            .post('/api/page/not-existing-id')
            .send({ body: {
                blocks: [
                    {
                        type: 'header',
                        data: {
                            text: 'Page header'
                        }
                    }
                ]
            } });
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        const { success, error } = res.body;
        expect(success).to.be.false;
        expect(error).to.equal('Page with given id does not exist');
    }));
    it('Removing page', () => __awaiter(void 0, void 0, void 0, function* () {
        const body = {
            blocks: [
                {
                    type: 'header',
                    data: {
                        text: 'Page header to be deleted'
                    }
                }
            ]
        };
        let res = yield agent
            .put('/api/page')
            .send({ body });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { result: { _id } } = res.body;
        res = yield agent
            .delete(`/api/page/${_id}`);
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const { success, result } = res.body;
        expect(success).to.be.true;
        if (result) {
            expect(result._id).to.be.undefined;
            expect(result.title).to.equal(body.blocks[0].data.text);
            expect(result.uri).to.equal(transformToUri(body.blocks[0].data.text));
            expect(result.body).to.deep.equal(body);
            const deletedPage = yield page_1.default.get(_id);
            expect(deletedPage._id).to.be.undefined;
        }
        else {
            expect(result).to.be.null;
        }
    }));
    it('Removing page with not existing id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield agent
            .delete('/api/page/not-existing-id');
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        const { success, error } = res.body;
        expect(success).to.be.false;
        expect(error).to.equal('Page with given id does not exist');
    }));
    function createPageTree() {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Creating page tree
             *
             *         0
             *       /  \
             *      1   2
             *     / \   \
             *    3   5   6
             *   /       / \
             *  4       7  8
             */
            const body = {
                blocks: [
                    {
                        type: 'header',
                        data: {
                            text: 'Page header'
                        }
                    }
                ]
            };
            let parent, res, result;
            /** Page 1 */
            parent = 0;
            res = yield agent
                .put('/api/page')
                .send({ body, parent });
            result = res.body.result;
            const page1 = result;
            /** Page 2 */
            parent = 0;
            res = yield agent
                .put('/api/page')
                .send({ body, parent });
            result = res.body.result;
            const page2 = result;
            /** Page 3 */
            parent = page1._id;
            res = yield agent
                .put('/api/page')
                .send({ body, parent });
            result = res.body.result;
            const page3 = result;
            /** Page 4 */
            parent = page3._id;
            res = yield agent
                .put('/api/page')
                .send({ body, parent });
            result = res.body.result;
            const page4 = result;
            /** Page 5 */
            parent = page1._id;
            res = yield agent
                .put('/api/page')
                .send({ body, parent });
            result = res.body.result;
            const page5 = result;
            /** Page 6 */
            parent = page2._id;
            res = yield agent
                .put('/api/page')
                .send({ body, parent });
            result = res.body.result;
            const page6 = result;
            /** Page 7 */
            parent = page6._id;
            res = yield agent
                .put('/api/page')
                .send({ body, parent });
            result = res.body.result;
            const page7 = result;
            /** Page 8 */
            parent = page6._id;
            res = yield agent
                .put('/api/page')
                .send({ body, parent });
            result = res.body.result;
            const page8 = result;
            return [
                0,
                page1._id,
                page2._id,
                page3._id,
                page4._id,
                page5._id,
                page6._id,
                page7._id,
                page8._id
            ];
        });
    }
    it('Removing a page and its children', () => __awaiter(void 0, void 0, void 0, function* () {
        const pages = yield createPageTree();
        /**
         * Deleting from tree page1
         * Also pages 3, 5 and 4 must be deleted
         */
        yield agent
            .delete(`/api/page/${pages[1]}`);
        const page3 = yield page_2.default.get(pages[3]);
        expect(page3.data._id).to.be.undefined;
        const page4 = yield page_2.default.get(pages[4]);
        expect(page4.data._id).to.be.undefined;
        const page5 = yield page_2.default.get(pages[5]);
        expect(page5.data._id).to.be.undefined;
        /** Okay, pages above is deleted */
        const page2 = yield page_2.default.get(pages[2]);
        expect(page2.data._id).not.to.be.undefined;
        /** First check pages 6, 7 and 8 before deleting */
        let page6 = yield page_2.default.get(pages[6]);
        expect(page6.data._id).not.to.be.undefined;
        let page7 = yield page_2.default.get(pages[7]);
        expect(page7.data._id).not.to.be.undefined;
        let page8 = yield page_2.default.get(pages[8]);
        expect(page8.data._id).not.to.be.undefined;
        /**
         * Delete page6
         * also pages 7 and 8 must be deleted
         */
        yield agent
            .delete(`/api/page/${pages[6]}`);
        page6 = yield page_2.default.get(pages[6]);
        expect(page6.data._id).to.be.undefined;
        page7 = yield page_2.default.get(pages[7]);
        expect(page7.data._id).to.be.undefined;
        page8 = yield page_2.default.get(pages[8]);
        expect(page8.data._id).to.be.undefined;
    }));
});
