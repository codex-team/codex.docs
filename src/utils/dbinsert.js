let { password: db } = require('../utils/database/index');
const md5 = require('md5');
const program = require('commander');

program
  .command('insert <value>')
  .action(async function (value) {
    let doc = { password: md5(value) };

    db.insert(doc);

    let newDoc = await db.findOne({password: md5(value)});

    console.log('Password was inserted');
  });

program.parse(process.argv);
