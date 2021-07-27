#!/usr/bin/env node
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
const database_1 = __importDefault(require("./src/utils/database"));
let db = database_1.default['password'];
const commander_1 = __importDefault(require("commander"));
const program = commander_1.default.program;
const bcrypt_1 = __importDefault(require("bcrypt"));
const saltRounds = 12;
/**
 * Script for generating password, that will be used to create and edit pages in CodeX.Docs.
 * Hashes password with bcrypt and inserts it to the database.
 * @see {https://github.com/tj/commander.js | CommanderJS}
 */
program
    .description('Application for generating password, that will be used to create and edit pages in CodeX.Docs.')
    .usage('[password]')
    .arguments('<password>')
    .action(function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        bcrypt_1.default.hash(password, saltRounds, (error, hash) => __awaiter(this, void 0, void 0, function* () {
            if (error) {
                return 'Hash generating error';
            }
            const userDoc = { passHash: hash };
            yield db.remove({}, { multi: true });
            yield db.insert(userDoc);
            console.log('Password was successfully generated');
        }));
    });
});
program.on('--help', () => {
    console.log('');
    console.log('Example:');
    console.log('yarn generatePassword qwerty');
    console.log('');
});
program.parse(process.argv);
if (process.argv.length !== 3) {
    console.error('Invalid command: %s\nSee --help or -h for a list of available commands.', program.args.join(' '));
    process.exit(1);
}
