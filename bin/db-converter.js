import fs from 'fs'
import path from "path";
import {fileURLToPath} from "url";
import {MongoClient, ObjectId} from "mongodb";

function getJsonData(filename) {
  let rawData = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), `../db/${filename}.db`));

  let convertedData = String(rawData)
    .replace(/\n/gi, ',')
    .slice(0, -1);

  return JSON.parse(`[${convertedData}]`);
}

const mongoClient = await MongoClient.connect("mongodb://localhost:27017/docs1");
const db = mongoClient.db();

async function saveData(collectionName, data) {
  console.log(`Saving ${data.length} items to ${collectionName}...`);
  const collection = db.collection(collectionName);
  await collection.deleteMany({})
  await collection.insertMany(data)
  console.log(`Saved ${data.length} items to ${collectionName}`);
}

const pages = getJsonData('pages');
const aliases = getJsonData('aliases');
const files = getJsonData('files');
const pagesOrder = getJsonData('pagesOrder');

const pagesIdsMap = pages.reduce((acc, curr) => {
  const newId = new ObjectId();
  acc.set(curr._id, newId)
  return acc
}, new Map())
pagesIdsMap.set('0', '0')


const newPages = pages.map(page => {
  return {
    ...page,
    _id: pagesIdsMap.get(page._id),
    parent: page.parent ? pagesIdsMap.get(page.parent) : null
  }
})
await saveData('pages', newPages)

const newAliases = aliases.map(alias => {
  return {
    ...alias,
    _id: new ObjectId(),
    id: pagesIdsMap.get(alias.id)
  }
})
await saveData('aliases', newAliases)


const newFiles = files.map(file => {
  return {
    ...file,
    _id: new ObjectId(),
  }
})
await saveData('files', newFiles)


const newPagesOrder = pagesOrder.map(pageOrder => {
  return {
    ...pageOrder,
    _id: new ObjectId(),
    page: pagesIdsMap.get(pageOrder.page),
    order: pageOrder.order.map(page => pagesIdsMap.get(page))
  }
})
await saveData('pagesOrder', newPagesOrder)

await mongoClient.close()
