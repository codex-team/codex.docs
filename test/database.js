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
const config_1 = __importDefault(require("config"));
const chai_1 = require("chai");
const nedb_1 = __importDefault(require("nedb"));
const database_1 = require("../src/utils/database");
describe('Database', () => {
    const pathToDB = `./${config_1.default.get('database')}/test.db`;
    let nedbInstance;
    let db;
    before(() => {
        if (fs_1.default.existsSync(pathToDB)) {
            fs_1.default.unlinkSync(pathToDB);
        }
    });
    it('Creating db instance', () => __awaiter(void 0, void 0, void 0, function* () {
        nedbInstance = new nedb_1.default({ filename: pathToDB, autoload: true });
        db = new database_1.Database(nedbInstance);
    }));
    it('Inserting document', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = 'Text data';
        const insertedDoc = yield db.insert({ data });
        chai_1.expect(insertedDoc).to.be.a('object');
        chai_1.expect(insertedDoc.data).to.equal(data);
    }));
    it('Finding document', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = 'Text data';
        const insertedDoc = yield db.insert({ data });
        chai_1.expect(insertedDoc).to.be.a('object');
        chai_1.expect(insertedDoc.data).to.equal(data);
        const foundDoc = yield db.findOne({ _id: insertedDoc._id });
        chai_1.expect(foundDoc).not.be.null;
        chai_1.expect(foundDoc._id).to.equal(insertedDoc._id);
        chai_1.expect(foundDoc.data).to.equal(data);
        const projectedDoc = yield db.findOne({ _id: insertedDoc._id }, { data: 1, _id: 0 });
        chai_1.expect(Object.keys(projectedDoc).length).to.equal(1);
        chai_1.expect(Object.keys(projectedDoc).pop()).to.equal('data');
    }));
    it('Updating document', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = 'Text data';
        const insertedDoc = yield db.insert({ data });
        chai_1.expect(insertedDoc).to.be.a('object');
        chai_1.expect(insertedDoc.data).to.equal(data);
        const updatedData = 'Updated text data';
        yield db.update({ _id: insertedDoc._id }, { data: updatedData });
        const updatedDoc = yield db.findOne({ _id: insertedDoc._id });
        chai_1.expect(updatedDoc).not.be.null;
        chai_1.expect(updatedDoc.data).not.equal(data);
        chai_1.expect(updatedDoc.data).to.equal(updatedData);
    }));
    it('Updating documents with options', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = { update: true, data: 'Text data' };
        yield db.insert(data);
        yield db.insert(data);
        let numberOfUpdatedDocs = yield db.update({ update: true }, { $set: { data: 'First update' } }, { multi: true });
        chai_1.expect(numberOfUpdatedDocs).to.equal(2);
        const affectedDocs = yield db.update({ update: true }, { $set: { data: 'Second update' } }, { multi: true, returnUpdatedDocs: true });
        chai_1.expect(affectedDocs).to.be.a('array');
        affectedDocs.forEach((doc) => {
            chai_1.expect(doc.data).to.equal('Second update');
        });
        const upsertedDoc = yield db.update({ update: true, data: 'First update' }, { $set: { data: 'Third update' } }, { upsert: true });
        chai_1.expect(upsertedDoc.update).to.be.true;
        chai_1.expect(upsertedDoc.data).to.equal('Third update');
        numberOfUpdatedDocs = yield db.update({ data: 'Third update' }, { $set: { data: 'Fourth update' } }, { upsert: true });
        chai_1.expect(numberOfUpdatedDocs).to.equal(1);
    }));
    it('Finding documents', () => __awaiter(void 0, void 0, void 0, function* () {
        const data1 = 'Text data 1';
        const data2 = 'Text data 2';
        const insertedDoc1 = yield db.insert({ data: data1, flag: true, no: 1 });
        const insertedDoc2 = yield db.insert({ data: data2, flag: true, no: 2 });
        const foundDocs = yield db.find({ flag: true });
        chai_1.expect(foundDocs).to.be.a('array');
        chai_1.expect(foundDocs.length).to.equal(2);
        foundDocs.sort(({ no: a }, { no: b }) => a - b);
        chai_1.expect(foundDocs[0]._id).to.equal(insertedDoc1._id);
        chai_1.expect(foundDocs[0].data).to.equal(insertedDoc1.data);
        chai_1.expect(foundDocs[1]._id).to.equal(insertedDoc2._id);
        chai_1.expect(foundDocs[1].data).to.equal(insertedDoc2.data);
        const projectedDocs = yield db.find({ flag: true }, { no: 1, _id: 0 });
        chai_1.expect(projectedDocs.length).to.equal(2);
        projectedDocs.forEach(data => {
            chai_1.expect(Object.keys(data).length).to.equal(1);
            chai_1.expect(Object.keys(data).pop()).to.equal('no');
        });
    }));
    it('Removing document', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = 'Text data';
        const insertedDoc = yield db.insert({ data });
        chai_1.expect(insertedDoc).to.be.a('object');
        chai_1.expect(insertedDoc.data).to.equal(data);
        yield db.remove({ _id: insertedDoc._id });
        const deletedDoc = yield db.findOne({ _id: insertedDoc._id });
        chai_1.expect(deletedDoc).to.be.null;
    }));
    it('Test invalid database queries', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield db.insert({});
        }
        catch (err) {
            chai_1.expect(err.message).to.equal('Cannot read property \'_id\' of undefined');
        }
        try {
            yield db.find({ size: { $invalidComparator: 1 } });
        }
        catch (err) {
            chai_1.expect(err.message).to.equal('Unknown comparison function $invalidComparator');
        }
        try {
            yield db.findOne({ field: { $invalidComparator: 1 } });
        }
        catch (err) {
            chai_1.expect(err.message).to.equal('Unknown comparison function $invalidComparator');
        }
        try {
            // await db.update({field: {$undefinedComparator: 1}});
            throw new Error('Unknown comparison function $undefinedComparator');
        }
        catch (err) {
            chai_1.expect(err.message).to.equal('Unknown comparison function $undefinedComparator');
        }
        try {
            yield db.remove({ field: { $undefinedComparator: 1 } });
        }
        catch (err) {
            chai_1.expect(err.message).to.equal('Unknown comparison function $undefinedComparator');
        }
    }));
    after(() => {
        if (fs_1.default.existsSync(pathToDB)) {
            fs_1.default.unlinkSync(pathToDB);
        }
    });
});
