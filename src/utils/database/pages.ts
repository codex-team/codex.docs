import Datastore from "nedb";
import config from "config";

const db = new Datastore({ filename: `./${config.get('database')}/pages.db`, autoload: true });

export default db;
