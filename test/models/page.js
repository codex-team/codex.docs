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
const page_1 = __importDefault(require("../../src/models/page"));
const translation_1 = __importDefault(require("../../src/utils/translation"));
const database_1 = __importDefault(require("../../src/utils/database"));
const pages = database_1.default['pages'];
describe('Page model', () => {
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
    after(() => {
        const pathToDB = path_1.default.resolve(__dirname, '../../', config_1.default.get('database'), './pages.db');
        if (fs_1.default.existsSync(pathToDB)) {
            fs_1.default.unlinkSync(pathToDB);
        }
    });
    it('Working with empty model', () => __awaiter(void 0, void 0, void 0, function* () {
        let page = new page_1.default();
        chai_1.expect(page.data).to.be.a('object');
        let { data } = page;
        chai_1.expect(data._id).to.be.undefined;
        chai_1.expect(data.title).to.be.empty;
        chai_1.expect(data.uri).to.be.empty;
        chai_1.expect(data.body).to.be.undefined;
        chai_1.expect(data.parent).to.be.equal('0');
        page = new page_1.default();
        data = page.data;
        chai_1.expect(data._id).to.be.undefined;
        chai_1.expect(data.title).to.be.empty;
        chai_1.expect(data.uri).to.be.empty;
        chai_1.expect(data.body).to.be.undefined;
        chai_1.expect(data.parent).to.be.equal('0');
        const initialData = {
            _id: 'page_id',
            body: {
                blocks: [
                    {
                        type: 'header',
                        data: {
                            text: 'Page header'
                        }
                    }
                ]
            }
        };
        page = new page_1.default(initialData);
        const json = page.toJSON();
        data = page.data;
        chai_1.expect(data._id).to.equal(initialData._id);
        chai_1.expect(data.title).to.equal(initialData.body.blocks[0].data.text);
        chai_1.expect(data.uri).to.be.empty;
        chai_1.expect(data.body).to.deep.equal(initialData.body);
        chai_1.expect(data.parent).to.be.equal('0');
        chai_1.expect(json._id).to.equal(initialData._id);
        chai_1.expect(json.title).to.equal(initialData.body.blocks[0].data.text);
        chai_1.expect(json.title).to.equal(initialData.body.blocks[0].data.text);
        chai_1.expect(json.body).to.deep.equal(initialData.body);
        chai_1.expect(json.parent).to.be.equal('0');
        const update = {
            _id: '12345',
            body: {
                blocks: [
                    {
                        type: 'header',
                        data: {
                            text: 'Updated page header'
                        }
                    }
                ]
            }
        };
        page.data = update;
        data = page.data;
        chai_1.expect(data._id).to.equal(initialData._id);
        chai_1.expect(data.title).to.equal(update.body.blocks[0].data.text);
        chai_1.expect(data.uri).to.be.empty;
        chai_1.expect(data.body).to.equal(update.body);
        chai_1.expect(data.parent).to.be.equal('0');
    }));
    it('Saving, updating and deleting model in the database', () => __awaiter(void 0, void 0, void 0, function* () {
        const initialData = {
            body: {
                blocks: [
                    {
                        type: 'header',
                        data: {
                            text: 'New page header'
                        }
                    }
                ]
            }
        };
        const page = new page_1.default(initialData);
        const savedPage = yield page.save();
        chai_1.expect(savedPage._id).not.be.undefined;
        chai_1.expect(savedPage.title).to.equal(initialData.body.blocks[0].data.text);
        chai_1.expect(savedPage.uri).to.equal(transformToUri(initialData.body.blocks[0].data.text));
        chai_1.expect(savedPage.body).to.equal(initialData.body);
        chai_1.expect(page._id).not.be.undefined;
        const insertedPage = yield pages.findOne({ _id: page._id });
        chai_1.expect(insertedPage._id).to.equal(page._id);
        chai_1.expect(insertedPage.title).to.equal(page.title);
        chai_1.expect(insertedPage.uri).to.equal(page.uri);
        chai_1.expect(insertedPage.body).to.deep.equal(page.body);
        const updateData = {
            body: {
                blocks: [
                    {
                        type: 'header',
                        data: {
                            text: 'Updated page header'
                        }
                    }
                ]
            },
            uri: 'updated-uri'
        };
        page.data = updateData;
        yield page.save();
        chai_1.expect(page._id).to.equal(insertedPage._id);
        const updatedPage = yield pages.findOne({ _id: page._id });
        chai_1.expect(updatedPage._id).to.equal(savedPage._id);
        chai_1.expect(updatedPage.title).to.equal(updateData.body.blocks[0].data.text);
        chai_1.expect(updatedPage.uri).to.equal(updateData.uri);
        chai_1.expect(updatedPage.body).to.deep.equal(updateData.body);
        yield page.destroy();
        chai_1.expect(page._id).to.be.undefined;
        const removedPage = yield pages.findOne({ _id: updatedPage._id });
        chai_1.expect(removedPage).to.be.null;
    }));
    it('Handle multiple page creation with the same uri', () => __awaiter(void 0, void 0, void 0, function* () {
        const initialData = {
            body: {
                blocks: [
                    {
                        type: 'header',
                        data: {
                            text: 'New page header'
                        }
                    }
                ]
            }
        };
        const firstPage = new page_1.default(initialData);
        let firstSavedPage = yield firstPage.save();
        const secondPage = new page_1.default(initialData);
        const secondSavedPage = yield secondPage.save();
        chai_1.expect(secondSavedPage.uri).to.equal(transformToUri(initialData.body.blocks[0].data.text) + '-1');
        const newUri = 'new-uri';
        firstPage.data = Object.assign(Object.assign({}, firstPage.data), { uri: newUri });
        firstSavedPage = yield firstPage.save();
        chai_1.expect(firstSavedPage.uri).to.equal(newUri);
        const thirdPage = new page_1.default(initialData);
        const thirdSavedPage = yield thirdPage.save();
        chai_1.expect(thirdSavedPage.uri).to.equal(transformToUri(initialData.body.blocks[0].data.text));
    }));
    it('Static get method', () => __awaiter(void 0, void 0, void 0, function* () {
        const initialData = {
            body: {
                blocks: [
                    {
                        type: 'header',
                        data: {
                            text: 'Test Page header'
                        }
                    }
                ]
            }
        };
        const page = new page_1.default(initialData);
        const savedPage = yield page.save();
        if (savedPage._id !== undefined) {
            const foundPage = yield page_1.default.get(savedPage._id);
            const { data } = foundPage;
            chai_1.expect(data._id).to.equal(savedPage._id);
            chai_1.expect(data.title).to.equal(initialData.body.blocks[0].data.text);
            chai_1.expect(data.uri).to.equal(transformToUri(initialData.body.blocks[0].data.text));
            chai_1.expect(data.body).to.deep.equal(initialData.body);
        }
        yield page.destroy();
    }));
    it('Static getAll method', () => __awaiter(void 0, void 0, void 0, function* () {
        const pagesToSave = [
            new page_1.default({
                body: {
                    blocks: [
                        {
                            type: 'header',
                            data: {
                                text: 'Page 1 header'
                            }
                        }
                    ]
                }
            }),
            new page_1.default({
                body: {
                    blocks: [
                        {
                            type: 'header',
                            data: {
                                text: 'Page 2 header'
                            }
                        }
                    ]
                }
            })
        ];
        const savedPages = yield Promise.all(pagesToSave.map(page => page.save()));
        const foundPages = yield page_1.default.getAll({ _id: { $in: savedPages.map(page => page._id) } });
        chai_1.expect(foundPages.length).to.equal(2);
        foundPages.forEach((page, i) => {
            chai_1.expect(page.title).to.equal(pagesToSave[i].body.blocks[0].data.text);
            chai_1.expect(page.uri).to.equal(transformToUri(pagesToSave[i].body.blocks[0].data.text));
            chai_1.expect(page.body).to.deep.equal(pagesToSave[i].body);
        });
    }));
    it('Parent pages', () => __awaiter(void 0, void 0, void 0, function* () {
        const parent = new page_1.default({
            body: {
                blocks: [
                    {
                        type: 'header',
                        data: {
                            text: 'Parent page header'
                        }
                    }
                ]
            }
        });
        const { _id: parentId } = yield parent.save();
        const child = new page_1.default({
            body: {
                blocks: [
                    {
                        type: 'header',
                        data: {
                            text: 'Child page header'
                        }
                    }
                ]
            },
            parent: parentId,
        });
        // child.parent = parent;
        const { _id: childId } = yield child.save();
        const testedParent = yield child.getParent();
        chai_1.expect(testedParent).to.be.not.null;
        if (testedParent) {
            chai_1.expect(testedParent._id).to.equal(parentId);
            chai_1.expect(testedParent.title).to.equal(parent.body.blocks[0].data.text);
            chai_1.expect(testedParent.uri).to.equal(transformToUri(parent.body.blocks[0].data.text));
            chai_1.expect(testedParent.body).to.deep.equal(parent.body);
        }
        const children = yield parent.children;
        chai_1.expect(children.length).to.equal(1);
        const testedChild = children.pop();
        chai_1.expect(testedChild._id).to.equal(childId);
        chai_1.expect(testedChild.title).to.equal(child.body.blocks[0].data.text);
        chai_1.expect(testedChild.uri).to.equal(transformToUri(child.body.blocks[0].data.text));
        chai_1.expect(testedChild.body).to.deep.equal(child.body);
        chai_1.expect(testedChild._parent).to.equal(child._parent);
        chai_1.expect(testedChild._parent).to.equal(parent._id);
        parent.destroy();
        child.destroy();
    }));
    it('Extracting title from page body', () => __awaiter(void 0, void 0, void 0, function* () {
        const pageData = {
            body: {
                blocks: [
                    {
                        type: 'header',
                        data: {
                            text: 'Page header'
                        }
                    }
                ]
            }
        };
        const page = new page_1.default(pageData);
        chai_1.expect(page.title).to.equal(pageData.body.blocks[0].data.text);
    }));
    it('test deletion', () => __awaiter(void 0, void 0, void 0, function* () {
        const pages = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const orders = {
            '0': ['1', '2', '3'],
            '1': ['4', '5'],
            '5': ['6', '7', '8'],
            '3': ['9'],
        };
        function deleteRecursively(startFrom) {
            const order = orders[startFrom];
            if (!order) {
                const found = pages.indexOf(startFrom);
                pages.splice(found, 1);
                return;
            }
            order.forEach(id => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                deleteRecursively(id);
            });
            const found = pages.indexOf(startFrom);
            pages.splice(found, 1);
        }
    }));
});
