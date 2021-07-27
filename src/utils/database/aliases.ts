import Datastore from "nedb";
import config from "config";

const db = new Datastore({ filename: `./${config.get('database')}/aliases.db`, autoload: true });

export default db;
