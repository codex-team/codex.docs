#!/usr/bin/env node

let { password: db } = require('../src/utils/database');
const program = require('commander');

const bcrypt = require('bcrypt');
const saltRounds = 10;

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
    let userDoc = null;

    bcrypt.genSalt(saltRounds, function (err1, salt) {
      if (err1) {
        return ('Salt generation error');
      }

      bcrypt.hash(password, salt, async (err2, hash) => {
        if (err2) {
          return ('Hash generation error');
        }
        await db.remove({}, {multi: true});

        userDoc = { passHash: hash };

        await db.insert(userDoc);
        console.log('Password was successfully generated');

        console.log('Salt:', salt);
        console.log('Insert the salt in to the SALT field in .env file');
      });
    });
  });

program.parse(process.argv);

program.on('--help', () => {
  console.log('');
  console.log("Don't forget to insert salt value to the .env file after adding a new password!");
  console.log('');
  console.log('Example:');
  console.log('node generatePassword qwerty');
  console.log('');
});

program.on('command:*', function () {
  console.error('Invalid command: %s\nSee --help or -h for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

if (process.argv.length === 2) {
  console.error('Invalid command: %s\nSee --help or -h for a list of available commands.', program.args.join(' '));
  process.exit(1);
}
