import fs from 'fs';
import config from 'config';
import { expect } from 'chai';
import Datastore from 'nedb';

import { Database } from '../backend/database/index.js';

interface Document {
  data?: any;
  _id?: string;
  update?: boolean;
  no?: any;
}

describe('Database', () => {
  const pathToDB = `./${config.get('database')}/test.db`;
  let nedbInstance;
  let db: Database<any>;

  before(() => {
    if (fs.existsSync(pathToDB)) {
      fs.unlinkSync(pathToDB);
    }
  });

  it('Creating db instance', async () => {
    nedbInstance = new Datastore({ filename: pathToDB, autoload: true });
    db = new Database(nedbInstance);
  });

  it('Inserting document', async () => {
    const data = 'Text data';

    const insertedDoc = await db.insert({ data }) as Document;

    expect(insertedDoc).to.be.a('object');
    expect(insertedDoc.data).to.equal(data);
  });

  it('Finding document', async () => {
    const data = 'Text data';

    const insertedDoc = await db.insert({ data }) as Document;

    expect(insertedDoc).to.be.a('object');
    expect(insertedDoc.data).to.equal(data);

    const foundDoc = await db.findOne({ _id: insertedDoc._id }) as Document;

    expect(foundDoc).not.be.null;
    expect(foundDoc._id).to.equal(insertedDoc._id);
    expect(foundDoc.data).to.equal(data);

    const projectedDoc = await db.findOne({ _id: insertedDoc._id }, { data: 1, _id: 0 });

    expect(Object.keys(projectedDoc).length).to.equal(1);
    expect(Object.keys(projectedDoc).pop()).to.equal('data');
  });

  it('Updating document', async () => {
    const data = 'Text data';

    const insertedDoc = await db.insert({ data }) as Document;

    expect(insertedDoc).to.be.a('object');
    expect(insertedDoc.data).to.equal(data);

    const updatedData = 'Updated text data';

    await db.update({ _id: insertedDoc._id }, { data: updatedData });

    const updatedDoc = await db.findOne({ _id: insertedDoc._id }) as Document;

    expect(updatedDoc).not.be.null;
    expect(updatedDoc.data).not.equal(data);
    expect(updatedDoc.data).to.equal(updatedData);
  });

  it('Updating documents with options', async () => {
    const data = {
      update: true,
      data: 'Text data',
    };

    await db.insert(data);
    await db.insert(data);

    let numberOfUpdatedDocs = await db.update({ update: true }, { $set: { data: 'First update' } }, { multi: true });

    expect(numberOfUpdatedDocs).to.equal(2);

    const affectedDocs = await db.update(
      { update: true },
      { $set: { data: 'Second update' } },
      {
        multi: true,
        returnUpdatedDocs: true,
      }
    ) as Array<Document>;

    expect(affectedDocs).to.be.a('array');
    affectedDocs.forEach((doc: Document) => {
      expect(doc.data).to.equal('Second update');
    });

    const upsertedDoc = await db.update({ update: true, data: 'First update' }, { $set: { data: 'Third update' } }, { upsert: true }) as Document;

    expect(upsertedDoc.update).to.be.true;
    expect(upsertedDoc.data).to.equal('Third update');

    numberOfUpdatedDocs = await db.update({ data: 'Third update' }, { $set: { data: 'Fourth update' } }, { upsert: true });

    expect(numberOfUpdatedDocs).to.equal(1);
  });

  it('Finding documents', async () => {
    const data1 = 'Text data 1';
    const data2 = 'Text data 2';

    const insertedDoc1 = await db.insert({ data: data1, flag: true, no: 1 }) as Document;
    const insertedDoc2 = await db.insert({ data: data2, flag: true, no: 2 }) as Document;

    const foundDocs = await db.find({ flag: true }) as Array<Document>;

    expect(foundDocs).to.be.a('array');
    expect(foundDocs.length).to.equal(2);

    foundDocs.sort(({ no: a }, { no: b }) => a - b);

    expect(foundDocs[0]._id).to.equal(insertedDoc1._id);
    expect(foundDocs[0].data).to.equal(insertedDoc1.data);
    expect(foundDocs[1]._id).to.equal(insertedDoc2._id);
    expect(foundDocs[1].data).to.equal(insertedDoc2.data);

    const projectedDocs = await db.find({ flag: true }, { no: 1, _id: 0 }) as Array<Document>;

    expect(projectedDocs.length).to.equal(2);
    projectedDocs.forEach(data => {
      expect(Object.keys(data).length).to.equal(1);
      expect(Object.keys(data).pop()).to.equal('no');
    });
  });

  it('Removing document', async () => {
    const data = 'Text data';

    const insertedDoc = await db.insert({ data }) as Document;

    expect(insertedDoc).to.be.a('object');
    expect(insertedDoc.data).to.equal(data);

    await db.remove({ _id: insertedDoc._id });

    const deletedDoc = await db.findOne({ _id: insertedDoc._id });

    expect(deletedDoc).to.be.null;
  });

  it('Test invalid database queries', async () => {
    try {
      await db.insert({});
    } catch (err) {
      expect((err as Error).message).to.equal('Cannot read property \'_id\' of undefined');
    }

    try {
      await db.find({ size: { $invalidComparator: 1 } });
    } catch (err) {
      expect((err as Error).message).to.equal('Unknown comparison function $invalidComparator');
    }

    try {
      await db.findOne({ field: { $invalidComparator: 1 } });
    } catch (err) {
      expect((err as Error).message).to.equal('Unknown comparison function $invalidComparator');
    }

    try {
      await db.update({ field: { $undefinedComparator: 1 } }, {});
    } catch (err) {
      expect((err as Error).message).to.equal('Unknown comparison function $undefinedComparator');
    }

    try {
      await db.remove({ field: { $undefinedComparator: 1 } });
    } catch (err) {
      expect((err as Error).message).to.equal('Unknown comparison function $undefinedComparator');
    }
  });

  after(() => {
    if (fs.existsSync(pathToDB)) {
      fs.unlinkSync(pathToDB);
    }
  });
});
