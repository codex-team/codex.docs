import Datastore from 'nedb';
import config from 'config';

const db = new Datastore({
  filename: `./${config.get('database')}/files.db`,
  autoload: true,
});

export default db;
