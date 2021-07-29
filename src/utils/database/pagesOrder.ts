import Datastore from 'nedb';
import config from 'config';
import path from 'path';

const db = new Datastore({
  filename: path.resolve(`./${config.get('database')}/pagesOrder.db`),
  autoload: true,
});

export default db;
