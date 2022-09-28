import Datastore from 'nedb';
import path from 'path';
import appConfig from "../appConfig.js";

/**
 * Init function for nedb instance
 *
 * @param {string} name - name of the data file
 * @returns {Datastore} db - nedb instance
 */
export default function initDb(name: string): Datastore {
  return new Datastore({
    filename: path.resolve(`${appConfig.database.local.path}/${name}.db`),
    autoload: true,
  });
}
