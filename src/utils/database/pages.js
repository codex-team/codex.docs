const Datastore = require('nedb');

const db = new Datastore({filename: './.db/pages.db', autoload: true});

module.exports = db;
