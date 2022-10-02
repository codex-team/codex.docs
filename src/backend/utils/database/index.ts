import { AliasData } from '../../models/alias.js';
import { FileData } from '../../models/file.js';
import { PageData } from '../../models/page.js';
import { PageOrderData } from '../../models/pageOrder.js';
import appConfig from '../appConfig.js';
import LocalDatabaseDriver from './local.js';
import MongoDatabaseDriver from './mongodb.js';
import { EntityId } from './types.js';
import { ObjectId } from 'mongodb';

const Database = appConfig.database.driver === 'mongodb' ? MongoDatabaseDriver : LocalDatabaseDriver;

/**
 *
 * @param id
 */
export function toEntityId(id: string): EntityId {
  return (appConfig.database.driver === 'mongodb' ? new ObjectId(id) : id) as EntityId;
}

export function isEqualIds(id1?: EntityId, id2?: EntityId): boolean {
  return id1?.toString() === id2?.toString();
}

export function isEntityId(id?: EntityId): id is EntityId {
  return typeof id === 'string' || id instanceof ObjectId;
}

export default {
  pages: new Database<PageData>('pages'),
  aliases: new Database<AliasData>('aliases'),
  pagesOrder: new Database<PageOrderData>('pagesOrder'),
  files: new Database<FileData>('files'),
};
