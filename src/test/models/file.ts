import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import config from 'config';
import File from '../../backend/models/file.js';
import database from '../../backend/database/index.js';
import { fileURLToPath } from 'url';

/**
 * The __dirname CommonJS variables are not available in ES modules.
 * https://nodejs.org/api/esm.html#no-__filename-or-__dirname
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = database['files'];

describe('File model', () => {

  after(() => {
    const pathToDB = path.resolve(__dirname, '../../../', config.get('database'), './files.db');

    if (fs.existsSync(pathToDB)) {
      fs.unlinkSync(pathToDB);
    }
  });

  it('Working with empty model', async () => {
    let file = new File();

    expect(file.data).to.be.a('object');

    let { data } = file;

    expect(data._id).to.be.undefined;
    expect(data.name).to.be.undefined;
    expect(data.filename).to.be.undefined;
    expect(data.path).to.be.undefined;
    expect(data.size).to.be.undefined;
    expect(data.mimetype).to.be.undefined;

    file = new File();

    data = file.data;

    expect(data._id).to.be.undefined;
    expect(data.name).to.be.undefined;
    expect(data.filename).to.be.undefined;
    expect(data.path).to.be.undefined;
    expect(data.size).to.be.undefined;
    expect(data.mimetype).to.be.undefined;

    const initialData = {
      _id: 'file_id',
      name: 'filename',
      filename: 'randomname',
      path: '/uploads/randomname',
      size: 1024,
      mimetype: 'image/png'
    };

    file = new File(initialData);

    data = file.data;

    expect(data._id).to.equal(initialData._id);
    expect(data.name).to.equal(initialData.name);
    expect(data.filename).to.equal(initialData.filename);
    expect(data.path).to.equal(initialData.path);
    expect(data.size).to.equal(initialData.size);
    expect(data.mimetype).to.equal(initialData.mimetype);

    const update = {
      _id: '12345',
      name: 'updated filename',
      filename: 'updated randomname',
      path: '/uploads/updated randomname',
      size: 2048,
      mimetype: 'image/jpeg'
    };

    file.data = update;

    data = file.data;

    expect(data._id).to.equal(initialData._id);
    expect(data.name).to.equal(update.name);
    expect(data.filename).to.equal(update.filename);
    expect(data.path).to.equal(update.path);
    expect(data.size).to.equal(update.size);
    expect(data.mimetype).to.equal(update.mimetype);
  });

  it('Saving, updating and deleting model in the database', async () => {
    const initialData = {
      name: 'filename',
      filename: 'randomname',
      path: '/uploads/randomname',
      size: 1024,
      mimetype: 'image/png'
    };

    const file = new File(initialData);

    const savedFile = await file.save();

    expect(savedFile._id).not.be.undefined;
    expect(savedFile.name).to.equal(initialData.name);
    expect(savedFile.filename).to.equal(initialData.filename);
    expect(savedFile.path).to.equal(initialData.path);
    expect(savedFile.size).to.equal(initialData.size);
    expect(savedFile.mimetype).to.equal(initialData.mimetype);

    const insertedFile = await files.findOne({ _id: file._id });

    expect(insertedFile._id).to.equal(file._id);
    expect(insertedFile.name).to.equal(file.name);
    expect(insertedFile.filename).to.equal(file.filename);
    expect(insertedFile.path).to.equal(file.path);
    expect(insertedFile.size).to.equal(file.size);
    expect(insertedFile.mimetype).to.equal(file.mimetype);

    const updateData = {
      _id: '12345',
      name: 'updated filename',
      filename: 'updated randomname',
      path: '/uploads/updated randomname',
      size: 2048,
      mimetype: 'image/jpeg'
    };

    file.data = updateData;
    await file.save();

    expect(file._id).to.equal(insertedFile._id);

    const updatedFile = await files.findOne({ _id: file._id });

    expect(updatedFile._id).to.equal(savedFile._id);
    expect(updatedFile.name).to.equal(updateData.name);
    expect(updatedFile.filename).to.equal(updateData.filename);
    expect(updatedFile.path).to.equal(updateData.path);
    expect(updatedFile.size).to.equal(updateData.size);
    expect(updatedFile.mimetype).to.equal(updateData.mimetype);

    await file.destroy();

    expect(file._id).to.be.undefined;

    const removedFile = await files.findOne({ _id: updatedFile._id });

    expect(removedFile).to.be.null;
  });

  it('Static get method', async () => {
    const initialData = {
      name: 'filename',
      filename: 'randomname',
      path: '/uploads/randomname',
      size: 1024,
      mimetype: 'image/png'
    };

    const file = new File(initialData);

    const savedFile = await file.save();

    if (savedFile._id !== undefined){
      const foundFile = await File.get(savedFile._id);

      const { data } = foundFile;

      expect(data._id).to.equal(savedFile._id);
      expect(data.name).to.equal(savedFile.name);
      expect(data.filename).to.equal(savedFile.filename);
      expect(data.path).to.equal(savedFile.path);
      expect(data.size).to.equal(savedFile.size);
      expect(data.mimetype).to.equal(savedFile.mimetype);
    }

    await file.destroy();
  });

  it('Static getByFilename method', async () => {
    const initialData = {
      name: 'filename',
      filename: 'randomname',
      path: '/uploads/randomname',
      size: 1024,
      mimetype: 'image/png'
    };

    const file = new File(initialData);

    const savedFile = await file.save();

    if (savedFile.filename !== undefined){
      const foundFile = await File.getByFilename(savedFile.filename);

      const { data } = foundFile;

      expect(data._id).to.equal(savedFile._id);
      expect(data.name).to.equal(savedFile.name);
      expect(data.filename).to.equal(savedFile.filename);
      expect(data.path).to.equal(savedFile.path);
      expect(data.size).to.equal(savedFile.size);
      expect(data.mimetype).to.equal(savedFile.mimetype);
    }

    await file.destroy();
  });

  it('Static getAll method', async () => {
    const filesToSave = [
      new File({
        name: 'filename1',
        filename: 'randomname1',
        path: '/uploads/randomname1',
        size: 1024,
        mimetype: 'image/png'
      }),
      new File({
        name: 'filename2',
        filename: 'randomname2',
        path: '/uploads/randomname2',
        size: 2048,
        mimetype: 'image/jpeg'
      }),
    ];

    const savedFiles = await Promise.all(filesToSave.map(file => file.save()));

    const foundFiles = await File.getAll({ _id: { $in: savedFiles.map(file => file._id) } });

    expect(foundFiles.length).to.equal(2);

    foundFiles.forEach((file, i) => {
      expect(file.name).to.equal(filesToSave[i].name);
      expect(file.filename).to.equal(filesToSave[i].filename);
      expect(file.path).to.equal(filesToSave[i].path);
      expect(file.size).to.equal(filesToSave[i].size);
      expect(file.mimetype).to.equal(filesToSave[i].mimetype);
    });
  });
});
