const {app} = require('../../bin/www');
const model = require('../../src/models/page');

const fs = require('fs');
const path = require('path');
const config = require('../../config');
const chai = require('chai');
const chaiHTTP = require('chai-http');
const {expect} = chai;

chai.use(chaiHTTP);

describe('Pages REST: ', () => {
  let agent;

  before(async () => {
    agent = chai.request.agent(app);
  });

  after(async () => {
    const pathToDB = path.resolve(__dirname, '../../', config.database, './pages.db');

    if (fs.existsSync(pathToDB)) {
      fs.unlinkSync(pathToDB);
    }
  });

  it('Creating page', async () => {
    const body = {
      blocks: [
        {
          type: 'header',
          data: {
            text: 'Page header'
          }
        }
      ]
    };

    const res = await agent
      .put('/page')
      .send({body});

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const {success, result} = res.body;

    expect(success).to.be.true;
    expect(result._id).to.be.a('string');
    expect(result.title).to.equal(body.blocks[0].data.text);
    expect(result.body).to.deep.equal(body);

    const createdPage = await model.get(result._id);

    expect(createdPage).not.be.null;
    expect(createdPage._id).to.equal(result._id);
    expect(createdPage.title).to.equal(body.blocks[0].data.text);
    expect(createdPage.body).to.deep.equal(body);

    createdPage.destroy();
  });

  it('Page data validation on create', async () => {
    const res = await agent
      .put('/page')
      .send({someField: 'Some text'});

    expect(res).to.have.status(400);
    expect(res).to.be.json;

    const {success, error} = res.body;

    expect(success).to.be.false;
    expect(error).to.equal('Error: Some of required fields is missed');
  });

  it('Finding page', async () => {
    const body = {
      blocks: [
        {
          type: 'header',
          data: {
            text: 'Page header'
          }
        }
      ]
    };

    const put = await agent
      .put('/page')
      .send({body});

    expect(put).to.have.status(200);
    expect(put).to.be.json;

    const {result: {_id}} = put.body;

    const get = await agent.get(`/page/${_id}`);

    expect(get).to.have.status(200);
    expect(get).to.be.json;

    const {success} = get.body;

    expect(success).to.be.true;

    const foundPage = await model.get(_id);

    expect(foundPage._id).to.equal(_id);
    expect(foundPage.title).to.equal(body.blocks[0].data.text);
    expect(foundPage.body).to.deep.equal(body);

    foundPage.destroy();
  });

  it('Finding page with not existing id', async () => {
    const res = await agent.get('/page/not-existing-id');

    expect(res).to.have.status(400);
    expect(res).to.be.json;

    const {success, error} = res.body;

    expect(success).to.be.false;
    expect(error).to.equal('Page with given id does not exist');
  });

  it('Updating page', async () => {
    const body = {
      blocks: [
        {
          type: 'header',
          data: {
            text: 'Page header'
          }
        }
      ]
    };

    let res = await agent
      .put('/page')
      .send({body});

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const {result: {_id}} = res.body;

    const updatedBody = {
      blocks: [
        {
          type: 'header',
          data: {
            text: 'Updated page header'
          }
        }
      ]
    };

    res = await agent
      .post(`/page/${_id}`)
      .send({body: updatedBody});

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const {success, result} = res.body;

    expect(success).to.be.true;
    expect(result._id).to.equal(_id);
    expect(result.title).not.equal(body.blocks[0].data.text);
    expect(result.title).to.equal(updatedBody.blocks[0].data.text);
    expect(result.body).not.equal(body);
    expect(result.body).to.deep.equal(updatedBody);

    const updatedPage = await model.get(_id);

    expect(updatedPage._id).to.equal(_id);
    expect(updatedPage.title).not.equal(body.blocks[0].data.text);
    expect(updatedPage.title).to.equal(updatedBody.blocks[0].data.text);
    expect(updatedPage.body).not.equal(body);
    expect(updatedPage.body).to.deep.equal(updatedBody);

    updatedPage.destroy();
  });

  it('Updating page with not existing id', async () => {
    const res = await agent
      .post('/page/not-existing-id')
      .send({body: {
        blocks: [
          {
            type: 'header',
            data: {
              text: 'Page header'
            }
          }
        ]
      }});

    expect(res).to.have.status(400);
    expect(res).to.be.json;

    const {success, error} = res.body;

    expect(success).to.be.false;
    expect(error).to.equal('Page with given id does not exist');
  });

  it('Removing page', async () => {
    const body = {
      blocks: [
        {
          type: 'header',
          data: {
            text: 'Page header'
          }
        }
      ]
    };

    let res = await agent
      .put('/page')
      .send({body});

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const {result: {_id}} = res.body;

    res = await agent
      .delete(`/page/${_id}`);

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const {success, result} = res.body;

    expect(success).to.be.true;
    expect(result._id).to.be.undefined;
    expect(result.title).to.equal(body.blocks[0].data.text);
    expect(result.body).to.deep.equal(body);

    const deletedPage = await model.get(_id);

    expect(deletedPage._id).to.be.undefined;
  });

  it('Removing page with not existing id', async () => {
    const res = await agent
      .delete('/page/not-existing-id');

    expect(res).to.have.status(400);
    expect(res).to.be.json;

    const {success, error} = res.body;

    expect(success).to.be.false;
    expect(error).to.equal('Page with given id does not exist');
  });
});
