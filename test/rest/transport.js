const fs = require('fs');
const path = require('path');
const fileType = require('file-type');
const chai = require('chai');
const chaiHTTP = require('chai-http');
const rimraf = require('rimraf');
const {expect} = chai;

const {app} = require('../../bin/www');
const model = require('../../src/models/file');

const config = require('../../config');

chai.use(chaiHTTP);

describe('Transport routes: ', () => {
  let agent;

  before(async () => {
    agent = chai.request.agent(app);

    if (!fs.existsSync('./' + config.uploads)) {
      fs.mkdirSync('./' + config.uploads);
    }
  });

  after(async () => {
    const pathToDB = path.resolve(__dirname, '../../', config.database, './files.db');

    if (fs.existsSync(pathToDB)) {
      fs.unlinkSync(pathToDB);
    }

    if (fs.existsSync('./' + config.uploads)) {
      rimraf.sync('./' + config.uploads);
    }
  });

  it('Uploading an image', async () => {
    const name = 'test_image.png';
    const image = fs.readFileSync(path.resolve(`./test/rest/${name}`));
    const res = await agent
      .post('/api/transport/image')
      .attach('image', image, name);

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const { body } = res;

    const file = await model.get(body._id);

    expect(body.success).to.equal(1);
    expect(file._id).to.equal(body._id);
    expect(file.name).to.equal(name);
    expect(file.filename).to.equal(body.filename);
    expect(file.path).to.equal(body.path);
    expect(file.mimetype).to.equal(fileType(image).mime);
    expect(file.size).to.equal(image.byteLength);

    const getRes = await agent
      .get(file.path);

    expect(getRes).to.have.status(200);
    expect(getRes).to.have.header('content-type', fileType(image).mime);
  });

  it('Uploading an image with map option', async () => {
    const name = 'test_image.png';
    const image = fs.readFileSync(path.resolve(`./test/rest/${name}`));
    const res = await agent
      .post('/api/transport/image')
      .attach('image', image, name)
      .field('map', JSON.stringify({_id: '_id', path: 'file:url', size: 'file:size', name: 'file:name'}));

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const { body } = res;

    const file = await model.get(body._id);

    expect(body.success).to.equal(1);
    expect(file.name).to.equal(body.file.name);
    expect(file.path).to.equal(body.file.url);
    expect(file.size).to.equal(body.file.size);
  });

  it('Uploading a file', async () => {
    const name = 'test_file.json';
    const json = fs.readFileSync(path.resolve(`./test/rest/${name}`));
    const res = await agent
      .post('/api/transport/file')
      .attach('file', json, name);

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const { body } = res;

    const file = await model.get(body._id);

    expect(body.success).to.equal(1);
    expect(file._id).to.equal(body._id);
    expect(file.name).to.equal(name);
    expect(file.filename).to.equal(body.filename);
    expect(file.path).to.equal(body.path);
    expect(file.size).to.equal(json.byteLength);

    const getRes = await agent
      .get(file.path);

    expect(getRes).to.have.status(200);
    expect(getRes).to.have.header('content-type', new RegExp(`^${file.mimetype}`));
  });

  it('Uploading a file with map option', async () => {
    const name = 'test_file.json';
    const json = fs.readFileSync(path.resolve(`./test/rest/${name}`));
    const res = await agent
      .post('/api/transport/file')
      .attach('file', json, name)
      .field('map', JSON.stringify({_id: '_id', path: 'file:url', size: 'file:size', name: 'file:name'}));

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const { body } = res;

    const file = await model.get(body._id);

    expect(body.success).to.equal(1);
    expect(file.name).to.equal(body.file.name);
    expect(file.path).to.equal(body.file.url);
    expect(file.size).to.equal(body.file.size);
  });

  it('Send file URL to fetch', async () => {
    const url = 'https://codex.so/public/app/img/codex-logo.svg';
    const res = await agent
      .post('/api/transport/fetch')
      .field('url', url);

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const { body } = res;

    const file = await model.get(body._id);

    expect(body.success).to.equal(1);
    expect(file._id).to.equal(body._id);
    expect(file.name).to.equal(body.name);
    expect(file.filename).to.equal(body.filename);
    expect(file.path).to.equal(body.path);
    expect(file.size).to.equal(body.size);

    const getRes = await agent
      .get(file.path);

    expect(getRes).to.have.status(200);
    expect(getRes).to.have.header('content-type', file.mimetype);
  });

  it('Send an file URL to fetch with map option', async () => {
    const url = 'https://codex.so/public/app/img/codex-logo.svg';
    const res = await agent
      .post('/api/transport/fetch')
      .field('url', url)
      .field('map', JSON.stringify({_id: '_id', path: 'file:url', size: 'file:size', name: 'file:name'}));

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const { body } = res;

    const file = await model.get(body._id);

    expect(body.success).to.equal(1);
    expect(file.name).to.equal(body.file.name);
    expect(file.path).to.equal(body.file.url);
    expect(file.size).to.equal(body.file.size);
  });

  it('Negative tests for file uploading', async () => {
    let res = await agent
      .post('/api/transport/file')
      .send();

    let {body} = res;

    expect(res).to.have.status(400);
    expect(body.success).to.equal(0);

    const name = 'test_file.json';
    const json = fs.readFileSync(path.resolve(`./test/rest/${name}`));
    res = await agent
      .post('/api/transport/file')
      .attach('file', json, name)
      .field('map', '{unvalid_json)');

    body = res.body;

    expect(res).to.have.status(500);
    expect(body.success).to.equal(0);
  });

  it('Negative tests for image uploading', async () => {
    let res = await agent
      .post('/api/transport/image')
      .send();

    let {body} = res;

    expect(res).to.have.status(400);
    expect(body.success).to.equal(0);

    let name = 'test_file.json';
    const json = fs.readFileSync(path.resolve(`./test/rest/${name}`));
    res = await agent
      .post('/api/transport/image')
      .attach('image', json, name);

    expect(res).to.have.status(400);

    name = 'test_image.png';
    const image = fs.readFileSync(path.resolve(`./test/rest/${name}`));
    res = await agent
      .post('/api/transport/image')
      .attach('image', image, name)
      .field('map', '{unvalid_json)');

    body = res.body;

    expect(res).to.have.status(500);
    expect(body.success).to.equal(0);
  });

  it('Negative tests for file fetching', async () => {
    let res = await agent
      .post('/api/transport/fetch')
      .send();

    let {body} = res;

    expect(res).to.have.status(400);
    expect(body.success).to.equal(0);

    const url = 'https://invalidurl';
    res = await agent
      .post('/api/transport/fetch')
      .field('url', url);

    body = res.body;

    expect(res).to.have.status(500);
    expect(body.success).to.equal(0);
  }).timeout(50000);
});
