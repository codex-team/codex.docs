let { password: db } = require('./src/utils/database');
const program = require('commander');

const bcrypt = require('bcrypt');
const saltRounds = 10;

program
  .description('Application for inserting new passwords to database.')
  .usage('insert [password]')
  .command('insert <password>')
  .action(async function (password) {
    let userDoc = null;
    let saltDoc = null;

    bcrypt.genSalt(saltRounds, function (err1, salt) {
      if (err1) {
        return ('Salt generation error');
      }

      saltDoc = { type: 'salt', saltValue: salt };

      bcrypt.hash(password, salt, async (err2, hash) => {
        if (err2) {
          return ('Hash generation error');
        }

        userDoc = { passHash: hash };

        await db.insert(saltDoc);
        await db.insert(userDoc);

        console.log('Generated salt:', saltDoc.saltValue);
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
