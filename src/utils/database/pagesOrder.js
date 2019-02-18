const Datastore = require('nedb');
const config = require('../../../config');
const db = new Datastore({filename: `./${config.database}/pagesOrder.db`, autoload: true});

  }
module.exports = db;
