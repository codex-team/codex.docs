import { ObjectId } from 'mongodb';

/**
 * Represents database driver functionality
 */
export interface DatabaseDriver<DocType> {
  /**
   * Insert new document into the database
   *
   * @param {object} doc - object to insert
   * @returns {Promise<object | Error>} - inserted doc or Error object
   */
  insert(doc: DocType): Promise<DocType>;

  /**
   * Find documents that match passed query
   *
   * @param {object} query - query object
   * @param {object} projection - projection object
   * @returns {Promise<Array<object> | Error>} - found docs or Error object
   */
  find(query: Record<string, unknown>, projection?: DocType): Promise<Array<DocType>>;

  /**
   * Find one document matches passed query
   *
   * @param {object} query - query object
   * @param {object} projection - projection object
   * @returns {Promise<object | Error>} - found doc or Error object
   */
  findOne(query: Record<string, unknown>, projection?: DocType): Promise<DocType>;

  /**
   * Update document matches query
   *
   * @param {object} query - query object
   * @param {object} update - fields to update
   * @param {Options} options - optional params
   * @returns {Promise<number | object | object[] | Error>} - number of updated rows or affected docs or Error object
   */
  update(query: Record<string, unknown>, update: DocType, options: Options): Promise<number|boolean|Array<DocType>>

  /**
   * Remove document matches passed query
   *
   * @param {object} query - query object
   * @param {Options} options - optional params
   * @returns {Promise<number|Error>} - number of removed rows or Error object
   */
  remove(query: Record<string, unknown>, options: Options): Promise<number>
}

/**
 * Represents unique database entity id
 * unique symbol to prevent type widening (read more https://todayilearned.net/2022/07/typescript-primitive-type-aliases-unique-symbols)
 */
export type EntityId = (string | ObjectId) & {readonly id: unique symbol};

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
