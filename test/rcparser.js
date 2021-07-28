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
const rcparser_1 = __importDefault(require("../src/utils/rcparser"));
const sinon = require("sinon");
const rcPath = path_1.default.resolve(process.cwd(), config_1.default.get('rcFile'));
describe('RC file parser test', () => {
    beforeEach(function () {
        // spy = sinon.stub(console, 'log');
    });
    afterEach(() => {
        if (fs_1.default.existsSync(rcPath)) {
            fs_1.default.unlinkSync(rcPath);
        }
    });
    it('Default config', () => __awaiter(void 0, void 0, void 0, function* () {
        const parsedConfig = rcparser_1.default.getConfiguration();
        chai_1.expect(parsedConfig).to.be.deep.equal(rcparser_1.default.DEFAULTS);
    }));
    it('Invalid JSON formatted config', () => {
        const invalidJson = '{title: "Codex Docs"}';
        const spy = sinon.spy(console, 'log');
        fs_1.default.writeFileSync(rcPath, invalidJson, 'utf8');
        const parsedConfig = rcparser_1.default.getConfiguration();
        chai_1.expect(spy.calledOnce).to.be.true;
        chai_1.expect(spy.calledWith('CodeX Docs rc file should be in JSON format.')).to.be.true;
        chai_1.expect(parsedConfig).to.be.deep.equal(rcparser_1.default.DEFAULTS);
        spy.restore();
    });
    it('Normal config', () => {
        const normalConfig = {
            title: 'Documentation',
            menu: [
                { title: 'Option 1', uri: '/option1' },
                { title: 'Option 2', uri: '/option2' },
                { title: 'Option 3', uri: '/option3' }
            ]
        };
        fs_1.default.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');
        const parsedConfig = rcparser_1.default.getConfiguration();
        chai_1.expect(parsedConfig).to.be.deep.equal(normalConfig);
    });
    it('Missed title', () => {
        const normalConfig = {
            menu: [
                { title: 'Option 1', uri: '/option1' },
                { title: 'Option 2', uri: '/option2' },
                { title: 'Option 3', uri: '/option3' }
            ]
        };
        fs_1.default.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');
        const parsedConfig = rcparser_1.default.getConfiguration();
        chai_1.expect(parsedConfig.menu).to.be.deep.equal(normalConfig.menu);
        chai_1.expect(parsedConfig.title).to.be.equal(rcparser_1.default.DEFAULTS.title);
    });
    it('Missed menu', () => {
        const normalConfig = {
            title: 'Documentation'
        };
        fs_1.default.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');
        const parsedConfig = rcparser_1.default.getConfiguration();
        chai_1.expect(parsedConfig.title).to.be.equal(normalConfig.title);
        chai_1.expect(parsedConfig.menu).to.be.deep.equal(rcparser_1.default.DEFAULTS.menu);
    });
    it('Menu is not an array', () => {
        const normalConfig = {
            title: 'Documentation',
            menu: {
                0: { title: 'Option 1', uri: '/option1' },
                1: { title: 'Option 2', uri: '/option2' },
                2: { title: 'Option 3', uri: '/option3' }
            }
        };
        fs_1.default.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');
        const spy = sinon.spy(console, 'log');
        const parsedConfig = rcparser_1.default.getConfiguration();
        chai_1.expect(spy.calledOnce).to.be.true;
        chai_1.expect(spy.calledWith('Menu section in the rc file must be an array.')).to.be.true;
        chai_1.expect(parsedConfig.title).to.be.equal(normalConfig.title);
        chai_1.expect(parsedConfig.menu).to.be.deep.equal(rcparser_1.default.DEFAULTS.menu);
        spy.restore();
    });
    it('Menu option is a string', () => {
        const normalConfig = {
            title: 'Documentation',
            menu: [
                'Option 1',
                { title: 'Option 2', uri: '/option2' },
                { title: 'Option 3', uri: '/option3' }
            ]
        };
        const expectedMenu = [
            { title: 'Option 1', uri: '/option-1' },
            { title: 'Option 2', uri: '/option2' },
            { title: 'Option 3', uri: '/option3' }
        ];
        fs_1.default.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');
        const parsedConfig = rcparser_1.default.getConfiguration();
        chai_1.expect(parsedConfig.title).to.be.equal(normalConfig.title);
        chai_1.expect(parsedConfig.menu).to.be.deep.equal(expectedMenu);
    });
    it('Menu option is not a string or an object', () => {
        const normalConfig = {
            title: 'Documentation',
            menu: [
                [{ title: 'Option 1', uri: '/option1' }],
                { title: 'Option 2', uri: '/option2' },
                { title: 'Option 3', uri: '/option3' }
            ]
        };
        const expectedMenu = [
            { title: 'Option 2', uri: '/option2' },
            { title: 'Option 3', uri: '/option3' }
        ];
        const spy = sinon.spy(console, 'log');
        fs_1.default.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');
        const parsedConfig = rcparser_1.default.getConfiguration();
        chai_1.expect(spy.calledOnce).to.be.true;
        chai_1.expect(spy.calledWith('Menu option #1 in rc file must be a string or an object')).to.be.true;
        chai_1.expect(parsedConfig.title).to.be.equal(normalConfig.title);
        chai_1.expect(parsedConfig.menu).to.be.deep.equal(expectedMenu);
        spy.restore();
    });
    it('Menu option title is undefined', () => {
        const normalConfig = {
            title: 'Documentation',
            menu: [
                { uri: '/option1' },
                { title: 'Option 2', uri: '/option2' },
                { title: 'Option 3', uri: '/option3' }
            ]
        };
        const expectedMenu = [
            { title: 'Option 2', uri: '/option2' },
            { title: 'Option 3', uri: '/option3' }
        ];
        const spy = sinon.spy(console, 'log');
        fs_1.default.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');
        const parsedConfig = rcparser_1.default.getConfiguration();
        chai_1.expect(spy.calledOnce).to.be.true;
        chai_1.expect(spy.calledWith('Menu option #1 title must be a string.')).to.be.true;
        chai_1.expect(parsedConfig.title).to.be.equal(normalConfig.title);
        chai_1.expect(parsedConfig.menu).to.be.deep.equal(expectedMenu);
        spy.restore();
    });
    it('Menu option title is not a string', () => {
        const normalConfig = {
            title: 'Documentation',
            menu: [
                { title: [], uri: '/option1' },
                { title: 'Option 2', uri: '/option2' },
                { title: 'Option 3', uri: '/option3' }
            ]
        };
        const expectedMenu = [
            { title: 'Option 2', uri: '/option2' },
            { title: 'Option 3', uri: '/option3' }
        ];
        const spy = sinon.spy(console, 'log');
        fs_1.default.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');
        const parsedConfig = rcparser_1.default.getConfiguration();
        chai_1.expect(spy.calledOnce).to.be.true;
        chai_1.expect(spy.calledWith('Menu option #1 title must be a string.')).to.be.true;
        chai_1.expect(parsedConfig.title).to.be.equal(normalConfig.title);
        chai_1.expect(parsedConfig.menu).to.be.deep.equal(expectedMenu);
        spy.restore();
    });
    it('Menu option uri is undefined', () => {
        const normalConfig = {
            title: 'Documentation',
            menu: [
                { title: 'Option 1' },
                { title: 'Option 2', uri: '/option2' },
                { title: 'Option 3', uri: '/option3' }
            ]
        };
        const expectedMenu = [
            { title: 'Option 2', uri: '/option2' },
            { title: 'Option 3', uri: '/option3' }
        ];
        const spy = sinon.spy(console, 'log');
        fs_1.default.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');
        const parsedConfig = rcparser_1.default.getConfiguration();
        chai_1.expect(spy.calledOnce).to.be.true;
        chai_1.expect(spy.calledWith('Menu option #1 uri must be a string.')).to.be.true;
        chai_1.expect(parsedConfig.title).to.be.equal(normalConfig.title);
        chai_1.expect(parsedConfig.menu).to.be.deep.equal(expectedMenu);
        spy.restore();
    });
    it('Menu option title is not a string', () => {
        const normalConfig = {
            title: 'Documentation',
            menu: [
                { title: 'Option 1', uri: [] },
                { title: 'Option 2', uri: '/option2' },
                { title: 'Option 3', uri: '/option3' }
            ]
        };
        const expectedMenu = [
            { title: 'Option 2', uri: '/option2' },
            { title: 'Option 3', uri: '/option3' }
        ];
        const spy = sinon.spy(console, 'log');
        fs_1.default.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');
        const parsedConfig = rcparser_1.default.getConfiguration();
        chai_1.expect(spy.calledOnce).to.be.true;
        chai_1.expect(spy.calledWith('Menu option #1 uri must be a string.')).to.be.true;
        chai_1.expect(parsedConfig.title).to.be.equal(normalConfig.title);
        chai_1.expect(parsedConfig.menu).to.be.deep.equal(expectedMenu);
        spy.restore();
    });
});
