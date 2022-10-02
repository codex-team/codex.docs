import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
import {MongoClient} from "mongodb";

const mongoClient = await MongoClient.connect("mongodb://localhost:27017/docs1");
const db = mongoClient.db();

export function getFromLocalDB(filename) {
  let rawData = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), `../../db/${filename}.db`));

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
