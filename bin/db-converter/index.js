import './program.js';
import { ObjectId } from 'mongodb';
import { closeConnection, getFromLocalDB, saveData } from './lib.js';

console.log('Start converting...');
const [pages, aliases, files, pagesOrder] = ['pages', 'aliases', 'files', 'pagesOrder'].map(getFromLocalDB);

const pagesIdsMap = pages.reduce((acc, curr) => {
  const newId = new ObjectId();

  acc.set(curr._id, newId);

  return acc;
}, new Map());

// Explicitly set the root page id
pagesIdsMap.set('0', '0');

const newPages = pages.map(page => {
  return {
    ...page,
    _id: pagesIdsMap.get(page._id),
    parent: page.parent ? pagesIdsMap.get(page.parent) : null,
  };
});

await saveData('pages', newPages);

const newAliases = aliases.map(alias => {
  return {
    ...alias,
    _id: new ObjectId(),
    id: pagesIdsMap.get(alias.id),
  };
});

await saveData('aliases', newAliases);

const newFiles = files.map(file => {
  return {
    ...file,
    _id: new ObjectId(),
  };
});

await saveData('files', newFiles);

const newPagesOrder = pagesOrder.map(pageOrder => {
  return {
    ...pageOrder,
    _id: new ObjectId(),
    page: pagesIdsMap.get(pageOrder.page),
    order: pageOrder.order.map(page => pagesIdsMap.get(page)),
  };
});

await saveData('pagesOrder', newPagesOrder);

await closeConnection();
console.log('Done!');
