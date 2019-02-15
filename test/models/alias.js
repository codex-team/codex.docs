const {expect} = require('chai');
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const Alias = require('../../src/models/alias');
const {binaryMD5} = require('../../src/utils/crypto');
const {aliases} = require('../../src/utils/database');

describe('Alias model', () => {
  after(() => {
    const pathToDB = path.resolve(__dirname, '../../', config.database, './aliases.db');

    if (fs.existsSync(pathToDB)) {
      fs.unlinkSync(pathToDB);
    }
  });

  it('Working with empty model', async () => {
    let alias = new Alias();

    expect(alias.data).to.be.a('object');

    let {data} = alias;

    expect(data._id).to.be.undefined;
    expect(data.hash).to.be.undefined;
    expect(data.type).to.be.undefined;
    expect(data.deprecated).to.be.false;
    expect(data.id).to.be.undefined;

    alias = new Alias();

    data = alias.data;

    expect(data._id).to.be.undefined;
    expect(data.hash).to.be.undefined;
    expect(data.type).to.be.undefined;
    expect(data.deprecated).to.be.false;
    expect(data.id).to.be.undefined;

    const initialData = {
      _id: 'alias_id',
      type: Alias.types.PAGE,
      id: 'page_id'
    };
    const aliasName = 'alias name';

    alias = new Alias(initialData, aliasName);
    data = alias.data;

    expect(data._id).to.equal(initialData._id);
    expect(data.hash).to.equal(binaryMD5(aliasName));
    expect(data.type).to.equal(initialData.type);
    expect(data.deprecated).to.equal(false);

    const update = {
      type: Alias.types.PAGE,
      id: 'page_id',
      hash: binaryMD5('another test hash'),
      deprecated: true
    };

    alias.data = update;

    data = alias.data;

    expect(data._id).to.equal(initialData._id);
    expect(data.type).to.equal(update.type);
    expect(data.hash).to.equal(update.hash);
    expect(data.deprecated).to.equal(update.deprecated);
  });

  it('Static get method', async () => {
    const initialData = {
      type: Alias.types.PAGE,
      id: 'page_id'
    };
    const aliasName = 'alias name';

    const alias = new Alias(initialData, aliasName);

    const savedAlias = await alias.save();

    const foundAlias = await Alias.get(aliasName);

    const {data} = foundAlias;

    expect(data._id).to.equal(savedAlias._id);
    expect(data.hash).to.equal(binaryMD5(aliasName));
    expect(data.type).to.equal(initialData.type);
    expect(data.deprecated).to.equal(false);
  });

  it('Saving, updating and deleting model in the database', async () => {
    const initialData = {
      type: Alias.types.PAGE,
      id: 'page_id'
    };
    const aliasName = 'alias name';

    const alias = new Alias(initialData, aliasName);

    const savedAlias = await alias.save();

    expect(savedAlias._id).not.be.undefined;
    expect(savedAlias.hash).to.equal(binaryMD5(aliasName));
    expect(savedAlias.type).to.equal(initialData.type);
    expect(savedAlias.id).to.equal(initialData.id);
    expect(savedAlias.deprecated).to.equal(false);

    const insertedAlias = await aliases.findOne({_id: savedAlias._id});

    expect(insertedAlias._id).to.equal(savedAlias._id);
    expect(insertedAlias.hash).to.equal(savedAlias.hash);
    expect(insertedAlias.type).to.equal(savedAlias.type);
    expect(insertedAlias.id).to.equal(savedAlias.id);
    expect(insertedAlias.deprecated).to.equal(savedAlias.deprecated);

    const updateData = {
      type: Alias.types.PAGE,
      id: 'page_id',
      hash: binaryMD5('another test hash'),
      deprecated: true
    };

    alias.data = updateData;
    await alias.save();

    expect(alias._id).to.equal(insertedAlias._id);

    const updatedAlias = await aliases.findOne({_id: alias._id});

    expect(updatedAlias._id).to.equal(savedAlias._id);
    expect(updatedAlias.hash).to.equal(updateData.hash);
    expect(updatedAlias.type).to.equal(updateData.type);
    expect(updatedAlias.id).to.equal(updateData.id);
    expect(updatedAlias.deprecated).to.equal(updateData.deprecated);
  });
});
