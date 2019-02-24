let { password: db } = require('./src/utils/database');
const program = require('commander');

const bcrypt = require('bcrypt');
const saltRounds = 10;

// TODO: add JSDoc (make a research about external modules)
/**
 * Script for creating user with given password, that will be used to create and edit pages in CodeX.Docs.
 * Hashes password with bcrypt and inserts it in database.
 * This script should be used once.
 * If you want to change password, you must remove old password from database.
 * Also after setting password you must add it to .env file in PASSHASH property.
 * @see {https://github.com/tj/commander.js | CommanderJS}
 */
program
  .description('Application for inserting new passwords to database.')
  .usage('insert [password]')
  .command('insert <password>')
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

        userDoc = { passHash: hash, salt: salt };

        await db.insert(userDoc);

        console.log('Generated salt:', userDoc.salt);
        console.log('Password hash was inserted as:', userDoc.passHash);
      });
    });
  });

program.on('--help', () => {
  console.log('');
  console.log("Don't forget to update .env file after adding a new password!");
  console.log('');
  console.log('Example:');
  console.log('dbinsert insert qwerty');
  console.log('');
});

program.on('command:*', function () {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

program.parse(process.argv);

if (process.argv.length === 2) {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
}
