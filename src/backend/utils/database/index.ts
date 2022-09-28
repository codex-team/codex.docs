import { AliasData } from '../../models/alias.js';
import { FileData } from '../../models/file.js';
import { PageData } from '../../models/page.js';
import { PageOrderData } from '../../models/pageOrder.js';
import appConfig from "../appConfig.js";
import LocalDatabaseDriver from "./local.js";
import MongoDatabaseDriver from "./mongodb.js";

const Database = appConfig.database.driver === 'mongodb' ? MongoDatabaseDriver : LocalDatabaseDriver;

export default {
  pages: new Database<PageData>('pages'),
  aliases: new Database<AliasData>('aliases'),
  pagesOrder: new Database<PageOrderData>('pagesOrder'),
  files: new Database<FileData>('files'),
};
