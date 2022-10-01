import { ObjectId } from 'mongodb';

export interface DatabaseDriver<DocType> {
  insert(doc: DocType): Promise<DocType>;
  find(query: Record<string, unknown>, projection?: DocType): Promise<Array<DocType>>;
  findOne(query: Record<string, unknown>, projection?: DocType): Promise<DocType>;
  update(query: Record<string, unknown>, update: DocType, options: Options): Promise<number|boolean|Array<DocType>>
  remove(query: Record<string, unknown>, options: Options): Promise<number>
}

export type EntityId = string | ObjectId;

/**
 * @typedef Options - optional params
 * @param {boolean} multi - (false) allows to take action to several documents
 * @param {boolean} upsert - (false) if true, upsert document with update fields.
 *                           Method will return inserted doc or number of affected docs if doc hasn't been inserted
 * @param {boolean} returnUpdatedDocs - (false) if true, returns affected docs
 */
export interface Options {
  multi?: boolean;
  upsert?: boolean;
  returnUpdatedDocs?: boolean;
}

export interface ResolveFunction {
  (value: any): void;
}

export interface RejectFunction {
  (reason?: unknown): void;
}
