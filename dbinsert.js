let { password: db } = require('./src/utils/database');
const md5 = require('md5');
const program = require('commander');

program
  .description('Application for inserting new passwords to database.')
  .usage('insert [password]')
  .command('insert <password>')
  .action(async function (password) {
    let doc = { password: md5(password) };
    let newDoc = await db.insert(doc);

    console.log('Password was inserted as', newDoc);
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
