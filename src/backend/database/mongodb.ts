import { Collection, Filter, MongoClient, OptionalUnlessRequiredId, UpdateFilter } from 'mongodb';
import { DatabaseDriver, Options } from './types.js';
import appConfig from '../utils/appConfig.js';

const mongodbUri = appConfig.database.driver === 'mongodb' ? appConfig.database.mongodb.uri : null;
const mongodbClient = mongodbUri ? await MongoClient.connect(mongodbUri): null;

/**
 * MongoDB driver for working with database
 */
export default class MongoDatabaseDriver<DocType> implements DatabaseDriver<DocType> {
  /**
   * Mongo client instance
   */
  private db: MongoClient;

  /**
   * Collection instance
   */
  private collection: Collection<DocType>;

  /**
   * Creates driver instance
   *
   * @param collectionName - collection to work with
   */
  constructor(collectionName: string) {
    if (!mongodbClient) {
      throw new Error('MongoDB client is not initialized');
    }
    this.db = mongodbClient;
    this.collection = mongodbClient.db().collection(collectionName);
  }

  /**
   * Insert new document into the database
   *
   * @param {object} doc - object to insert
   * @returns {Promise<object | Error>} - inserted doc or Error object
   */
  public async insert(doc: DocType): Promise<DocType> {
    const result = await this.collection.insertOne(doc as OptionalUnlessRequiredId<DocType>);

    return {
      ...doc,
      _id: result.insertedId,
    };
  }

  /**
   * Find documents that match passed query
   *
   * @param {object} query - query object
   * @param {object} projection - projection object
   * @returns {Promise<Array<object> | Error>} - found docs or Error object
   */
  public async find(query: Record<string, unknown>, projection?: DocType): Promise<Array<DocType>> {
    const cursor = this.collection.find(query as Filter<DocType>);

    if (projection) {
      cursor.project(projection);
    }

    const docs = await cursor.toArray();

    return docs as unknown as Array<DocType>;
  }

  /**
   * Find one document matches passed query
   *
   * @param {object} query - query object
   * @param {object} projection - projection object
   * @returns {Promise<object | Error>} - found doc or Error object
   */
  public async findOne(query: Record<string, unknown>, projection?: DocType): Promise<DocType> {
    const doc = await this.collection.findOne(query as Filter<DocType>, { projection });

    return doc as unknown as DocType;
  }

  /**
   * Update document matches query
   *
   * @param {object} query - query object
   * @param {object} update - fields to update
   * @param {Options} options - optional params
   * @returns {Promise<number | object | object[] | Error>} - number of updated rows or affected docs or Error object
   */
  public async update(query: Record<string, unknown>, update: DocType, options: Options = {}): Promise<number|boolean|Array<DocType>> {
    const updateDocument = {
      $set: update,
    } as UpdateFilter<DocType>;
    const result = await this.collection.updateMany(query as Filter<DocType>, updateDocument, options);

    switch (true) {
      case options.returnUpdatedDocs:
        return result.modifiedCount;
      case options.upsert:
        if (result.modifiedCount) {
          return result.modifiedCount;
        }

        return result as DocType[];
      default:
        return result as DocType[];
    }
  }

  /**
   * Remove document matches passed query
   *
   * @param {object} query - query object
   * @param {Options} options - optional params
   * @returns {Promise<number|Error>} - number of removed rows or Error object
   */
  public async remove(query: Record<string, unknown>, options: Options = {}): Promise<number> {
    const result = await this.collection.deleteMany(query as Filter<DocType>);

    return result.deletedCount;
  }
}
