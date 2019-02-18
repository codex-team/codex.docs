const Datastore = require('nedb');
const config = require('../../../config');
const db = new Datastore({filename: `./${config.database}/pagesOrder.db`, autoload: true});

/**
 * Current DataStore preparation
 * Add initial row for RootPage
 */
(async function() {
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
    const Pages = require('../../controllers/pages');

    // Converter
    const pages = await Pages.getAll();

    async function convert(pages, parentId) {
      const children = pages.filter(page => page._parent === parentId);
      const initialData = {
        page: parentId,
        order: children.map(page => page._id)
      };
      await db.insert(initialData);

      children.forEach(async page => {
        await convert(pages, page._id);
      });
    }

    await convert(pages, parentIdOfRootPages);
  }

}());

module.exports = db;
