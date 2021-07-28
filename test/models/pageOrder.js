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
const pageOrder_1 = __importDefault(require("../../src/models/pageOrder"));
const database_1 = __importDefault(require("../../src/utils/database"));
const pagesOrder = database_1.default['pagesOrder'];
describe('PageOrder model', () => {
    after(() => {
        const pathToDB = path_1.default.resolve(__dirname, '../../', config_1.default.get('database'), './pagesOrder.db');
        if (fs_1.default.existsSync(pathToDB)) {
            fs_1.default.unlinkSync(pathToDB);
        }
    });
    it('Empty Model', () => __awaiter(void 0, void 0, void 0, function* () {
        const pageOrder = new pageOrder_1.default();
        chai_1.expect(pageOrder.data).to.be.a('object');
        let { data } = pageOrder;
        chai_1.expect(data._id).to.be.undefined;
        chai_1.expect(data.page).to.be.to.equal('0');
        chai_1.expect(data.order).to.be.an('array').that.is.empty;
        let page = new pageOrder_1.default();
        data = page.data;
        chai_1.expect(data._id).to.be.undefined;
        chai_1.expect(data.page).to.be.to.equal('0');
        chai_1.expect(data.order).to.be.an('array').that.is.empty;
        const testData = {
            _id: 'order_id',
            page: 'page_id',
            order: []
        };
        page = new pageOrder_1.default(testData);
        data = page.data;
        chai_1.expect(data._id).to.equal(testData._id);
        chai_1.expect(data.page).to.equal(testData.page);
        chai_1.expect(data.order).to.be.an('array').that.is.empty;
    }));
    it('Testing Model methods', () => __awaiter(void 0, void 0, void 0, function* () {
        const testData = {
            page: 'page_id',
            order: ['1', '2']
        };
        const pageOrder = new pageOrder_1.default(testData);
        const { data } = yield pageOrder.save();
        chai_1.expect(data._id).not.be.undefined;
        chai_1.expect(data.page).to.equal(testData.page);
        chai_1.expect(data.order).to.deep.equals(testData.order);
        const insertedPageOrder = yield pagesOrder.findOne({ _id: data._id });
        chai_1.expect(insertedPageOrder._id).to.equal(data._id);
        chai_1.expect(insertedPageOrder.page).to.equal(data.page);
        chai_1.expect(insertedPageOrder.order).to.deep.equal(data.order);
        const updateData = {
            page: 'page_id_2',
            order: ['3']
        };
        pageOrder.data = updateData;
        yield pageOrder.save();
        chai_1.expect(pageOrder.data._id).to.equal(insertedPageOrder._id);
        const updatedData = yield pagesOrder.findOne({ _id: insertedPageOrder._id });
        chai_1.expect(updatedData.page).to.equal(updateData.page);
        chai_1.expect(updatedData.order).to.deep.equal(updateData.order);
        yield pageOrder.destroy();
        chai_1.expect(pageOrder.data._id).to.be.undefined;
        const removedPage = yield pagesOrder.findOne({ _id: updatedData._id });
        chai_1.expect(removedPage).to.be.null;
    }));
    it('Testing push and remove order methods', () => __awaiter(void 0, void 0, void 0, function* () {
        const testData = {
            page: 'page_id',
            order: ['1', '2']
        };
        const pageOrder = new pageOrder_1.default(testData);
        yield pageOrder.save();
        pageOrder.push('3');
        chai_1.expect(pageOrder.data.order).to.be.an('array').that.is.not.empty;
        if (pageOrder.data.order !== undefined) {
            pageOrder.data.order.forEach((el) => {
                chai_1.expect(el).to.be.an('string');
            });
        }
        chai_1.expect(pageOrder.data.order).to.deep.equals(['1', '2', '3']);
        pageOrder.remove('2');
        chai_1.expect(pageOrder.data.order).to.deep.equals(['1', '3']);
        // Not allowed by TypeScript
        // expect(() => {
        //   pageOrder.push(3);
        // }).to.throw('given id is not string');
        pageOrder.push('4');
        pageOrder.push('5');
        pageOrder.push('2');
        pageOrder.putAbove('2', '3');
        chai_1.expect(pageOrder.data.order).to.deep.equals(['1', '2', '3', '4', '5']);
        pageOrder.putAbove('2', '10');
        chai_1.expect(pageOrder.data.order).to.deep.equals(['1', '2', '3', '4', '5']);
        yield pageOrder.destroy();
    }));
    it('Testing static methods', () => __awaiter(void 0, void 0, void 0, function* () {
        const testData = {
            page: 'page_id',
            order: ['1', '2']
        };
        const pageOrder = new pageOrder_1.default(testData);
        const insertedData = yield pageOrder.save();
        if (insertedData.data.page !== undefined) {
            const insertedPageOrder = yield pageOrder_1.default.get(insertedData.data.page);
            chai_1.expect(insertedPageOrder).to.instanceOf(pageOrder_1.default);
            chai_1.expect(insertedPageOrder.data._id).to.be.equal(insertedData.data._id);
        }
        const emptyInstance = yield pageOrder_1.default.get('');
        chai_1.expect(emptyInstance.data.page).to.be.equal('0');
        chai_1.expect(emptyInstance.data.order).to.be.an('array').that.is.empty;
        yield pageOrder.destroy();
    }));
});
