const Datastore = require('nedb');
const config = require('../../../config');

const db = new Datastore({filename: `./${config.database}/pagesOrder.db`, autoload: true});

/**
 * Current DataStore preparation
 * Add initial row for RootPage
 */
(async function () {
  const parentIdOfRootPages = '0';
  const cbk = (resolve, reject) => (err, doc) => {
    if (err) {
      reject(err);
    }

    resolve(doc);
  };

  const order = await new Promise((resolve, reject) => {
    db.findOne({page: parentIdOfRootPages}, cbk(resolve, reject));
  });

  if (!order) {
    const initialData = {
      page: '0',
      order: []
    };

    await db.insert(initialData);
  }
}());

module.exports = db;
