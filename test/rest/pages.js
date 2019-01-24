const {app} = require('../../bin/www');
const model = require('../../src/models/page');
const PageOrder = require('../../src/models/pageOrder');

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
    const pathToPagesDB = path.resolve(__dirname, '../../', config.database, './pages.db');
    const pathToPagesOrderDB = path.resolve(__dirname, '../../', config.database, './pagesOrder.db');

    if (fs.existsSync(pathToPagesDB)) {
      fs.unlinkSync(pathToPagesDB);
    }

    if (fs.existsSync(pathToPagesOrderDB)) {
      fs.unlinkSync(pathToPagesOrderDB);
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
      ],
    };
    const parent =  0;
    const res = await agent
      .put('/api/page')
      .send({body, parent});

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

    const pageOrder = await PageOrder.get('' + (createdPage.data.parent || 0));
    expect(pageOrder.order).to.be.an('array');

    await createdPage.destroy();
    await pageOrder.destroy()
  });

  it('Page data validation on create', async () => {
    const res = await agent
      .put('/api/page')
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
      .put('/api/page')
      .send({body});

    expect(put).to.have.status(200);
    expect(put).to.be.json;

    const {result: {_id}} = put.body;

    const get = await agent.get(`/api/page/${_id}`);

    expect(get).to.have.status(200);
    expect(get).to.be.json;

    const {success} = get.body;

    expect(success).to.be.true;

    const foundPage = await model.get(_id);
    const pageOrder = await PageOrder.get('' + foundPage._parent);

    expect(foundPage._id).to.equal(_id);
    expect(foundPage.title).to.equal(body.blocks[0].data.text);
    expect(foundPage.body).to.deep.equal(body);

    await pageOrder.destroy();
    await foundPage.destroy();
  });

  it('Finding page with not existing id', async () => {
    const res = await agent.get('/api/page/not-existing-id');

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
      .put('/api/page')
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
      .post(`/api/page/${_id}`)
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
    const pageOrder = await PageOrder.get('' + updatedPage._parent);

    expect(updatedPage._id).to.equal(_id);
    expect(updatedPage.title).not.equal(body.blocks[0].data.text);
    expect(updatedPage.title).to.equal(updatedBody.blocks[0].data.text);
    expect(updatedPage.body).not.equal(body);
    expect(updatedPage.body).to.deep.equal(updatedBody);

    await pageOrder.destroy();
    await updatedPage.destroy();
  });

  it('Updating page with not existing id', async () => {
    const res = await agent
      .post('/api/page/not-existing-id')
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
      .put('/api/page')
      .send({body});

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const {result: {_id}} = res.body;
    console.log('_id', _id);

    res = await agent
      .delete(`/api/page/${_id}`);

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const {success, result} = res.body;

    expect(success).to.be.true;

    if (result) {
      expect(result._id).to.be.undefined;
      expect(result.title).to.equal(body.blocks[0].data.text);
      expect(result.body).to.deep.equal(body);
      const deletedPage = await model.get(_id);

      expect(deletedPage._id).to.be.undefined;
    } else {
      expect(result).to.be.null;
    }
  });

  it('Removing page with not existing id', async () => {
    const res = await agent
      .delete('/api/page/not-existing-id');

    expect(res).to.have.status(400);
    expect(res).to.be.json;

    const {success, error} = res.body;

    expect(success).to.be.false;
    expect(error).to.equal('Page with given id does not exist');
  });
});
