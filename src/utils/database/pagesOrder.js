const Datastore = require('nedb');
const config = require('../../../config');

const db = new Datastore({filename: `./${config.database}/pagesOrder.db`, autoload: true});

/**
 * Add initial row for RootPage
 */
(async function() {
  const initialData = {
    page: '0',
    order: []
  };
  await db.insert(initialData);
}());

module.exports = db;
