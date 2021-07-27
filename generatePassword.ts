#!/usr/bin/env node

import database from "./src/utils/database";
let db = database['password'];

import commander from "commander";
const program = commander.program;

import bcrypt from "bcrypt";
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
  .action(async function (password) {
    bcrypt.hash(password, saltRounds, async (error, hash) => {
      if (error) {
        return 'Hash generating error';
      }

      const userDoc = { passHash: hash };

      await db.remove({}, {multi: true});
      await db.insert(userDoc);

      console.log('Password was successfully generated');
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
