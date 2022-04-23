import Datastore from 'nedb';
import config from 'config';
import path from 'path';

/**
 * Init function for nedb instance
 *
 * @param {string} name - name of the data file
 * @returns {Datastore} db - nedb instance
 */
export default function initDb(name: string): Datastore {
  return new Datastore({
    filename: path.resolve(`${config.get('database')}/${name}.db`),
    autoload: true,
  });
}