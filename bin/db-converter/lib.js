import fs from "fs";
import path from "path";
import {MongoClient} from "mongodb";
import {options} from "./program.js";
const mongoClient = await MongoClient.connect(options.mongodbUri);
const db = mongoClient.db();

export function getFromLocalDB(filename) {
  const filePath = path.resolve(process.cwd(), `${options.dbPath}/${filename}.db`)
  let rawData = fs.readFileSync(filePath);

  let convertedData = String(rawData)
    .replace(/\n/gi, ',')
    .slice(0, -1);

  return JSON.parse(`[${convertedData}]`);
}

export async function saveData(collectionName, data) {
  console.log(`Saving ${data.length} items to ${collectionName}...`);
  const collection = db.collection(collectionName);
  await collection.deleteMany({})
  await collection.insertMany(data)
  console.log(`Saved ${data.length} items to ${collectionName}`);
}

export async function closeConnection() {
  await mongoClient.close()
}
