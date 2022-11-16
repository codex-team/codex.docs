import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import { options } from './program.js';
const mongoClient = await MongoClient.connect(options.mongodbUri);
const db = mongoClient.db();

/**
 * Returns data from local database as JSON object
 *
 * @param {string} filename - name of the file to read
 * @returns {object} - JSON data
 */
export function getFromLocalDB(filename) {
  const filePath = path.resolve(process.cwd(), `${options.dbPath}/${filename}.db`);
  const rawData = fs.readFileSync(filePath);

  const convertedData = String(rawData)
    .replace(/\n/gi, ',')
    .slice(0, -1);

  return JSON.parse(`[${convertedData}]`);
}

/**
 * Saves data to MongoDB
 *
 * @param {string} collectionName - collection to which data will be saved
 * @param {object[]} data - data to save
 * @returns {Promise<void>}
 */
export async function saveData(collectionName, data) {
  console.log(`Saving ${data.length} items to ${collectionName}...`);
  const collection = db.collection(collectionName);

  await collection.deleteMany({});
  await collection.insertMany(data);
  console.log(`Saved ${data.length} items to ${collectionName}`);
}

/**
 * Closes connection to MongoDB
 *
 * @returns {Promise<void>}
 */
export async function closeConnection() {
  await mongoClient.close();
}
