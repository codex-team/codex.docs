import fs from 'fs';
import path from 'path';
import config from 'config';
import chai from 'chai';
import chaiHTTP from 'chai-http';
import server from '../../bin/server.js';
import model from '../../backend/models/page.js';
import Page from '../../backend/models/page.js';
import PageOrder from '../../backend/models/pageOrder.js';
import translateString from '../../backend/utils/translation.js';
import { fileURLToPath } from 'url';

/**
 * The __dirname CommonJS variables are not available in ES modules.
 * https://nodejs.org/api/esm.html#no-__filename-or-__dirname
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));


const {expect} = chai;
const app = server.app;

chai.use(chaiHTTP);

describe('Pages REST: ', () => {
  let agent: ChaiHttp.Agent;
  const transformToUri = (text: string):string => {
    return translateString(text
      .replace(/&nbsp;/g, ' ')
      .replace(/[^a-zA-Z0-9А-Яа-яЁё ]/g, ' ')
      .replace(/  +/g, ' ')
      .trim()
      .toLowerCase()
      .split(' ')
      .join('-'));
  };

  before(async () => {
    agent = chai.request.agent(app);
  });

  after(async () => {
    const pathToPagesDB = path.resolve(__dirname, '../../../', config.get('database'), './pages.db');
    const pathToPagesOrderDB = path.resolve(__dirname, '../../../', config.get('database'), './pagesOrder.db');
    const pathToAliasesDB = path.resolve(__dirname, '../../../', config.get('database'), './aliases.db');

    if (fs.existsSync(pathToPagesDB)) {
      fs.unlinkSync(pathToPagesDB);
    }

    if (fs.existsSync(pathToPagesOrderDB)) {
      fs.unlinkSync(pathToPagesOrderDB);
    }

    if (fs.existsSync(pathToAliasesDB)) {
      fs.unlinkSync(pathToAliasesDB);
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
    const parent = 0;
    const res = await agent
      .put('/api/page')
      .send({body, parent});

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const {success, result} = res.body;

    expect(success).to.be.true;
    expect(result._id).to.be.a('string');
    expect(result.title).to.equal(body.blocks[0].data.text);
    expect(result.uri).to.equal(transformToUri(body.blocks[0].data.text));
    expect(result.body).to.deep.equal(body);

    const createdPage = await model.get(result._id);

    expect(createdPage).not.be.null;
    expect(createdPage._id).to.equal(result._id);
    expect(createdPage.title).to.equal(body.blocks[0].data.text);
    expect(createdPage.uri).to.equal(transformToUri(body.blocks[0].data.text));
    expect(createdPage.body).to.deep.equal(body);

    const pageOrder = await PageOrder.get('' + (createdPage.data.parent || 0));
    expect(pageOrder.order).to.be.an('array');

    await createdPage.destroy();
    await pageOrder.destroy();
  });

  it('Page data validation on create', async () => {
    const res = await agent
      .put('/api/page')
      .send({ someField: 'Some text' });

    expect(res).to.have.status(400);
    expect(res).to.be.json;

    const { success, error } = res.body;

    expect(success).to.be.false;
    expect(error).to.equal('validationError');
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
    expect(foundPage.uri).to.equal(transformToUri(body.blocks[0].data.text));
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
    const updatedUri = 'updated-uri';

    res = await agent
      .post(`/api/page/${_id}`)
      .send({body: updatedBody, uri: updatedUri});

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const {success, result} = res.body;

    expect(success).to.be.true;
    expect(result._id).to.equal(_id);
    expect(result.title).not.equal(body.blocks[0].data.text);
    expect(result.title).to.equal(updatedBody.blocks[0].data.text);
    expect(result.uri).not.equal(transformToUri(body.blocks[0].data.text));
    expect(result.uri).to.equal(updatedUri);
    expect(result.body).not.equal(body);
    expect(result.body).to.deep.equal(updatedBody);

    const updatedPage = await model.get(_id);
    const pageOrder = await PageOrder.get('' + updatedPage._parent);

    expect(updatedPage._id).to.equal(_id);
    expect(updatedPage.title).not.equal(body.blocks[0].data.text);
    expect(updatedPage.title).to.equal(updatedBody.blocks[0].data.text);
    expect(updatedPage.uri).not.equal(transformToUri(body.blocks[0].data.text));
    expect(updatedPage.uri).to.equal(updatedUri);
    expect(updatedPage.body).not.equal(body);
    expect(updatedPage.body).to.deep.equal(updatedBody);

    await pageOrder.destroy();
    await updatedPage.destroy();
  });

  it('Handle multiple page creation with the same uri', async () => {
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

    res = await agent
      .put('/api/page')
      .send({body: body});

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const {success: secondPageSuccess, result: secondPageResult} = res.body;

    expect(secondPageSuccess).to.be.true;
    expect(secondPageResult.title).to.equal(body.blocks[0].data.text);
    expect(secondPageResult.uri).to.equal(transformToUri(body.blocks[0].data.text) + '-1');
    expect(secondPageResult.body).to.deep.equal(body);

    const newFirstPageUri = 'New-uri';

    res = await agent
      .post(`/api/page/${_id}`)
      .send({body: body, uri: newFirstPageUri});

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    res = await agent
      .put('/api/page')
      .send({body: body});

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const {success: thirdPageSuccess, result: thirdPageResult} = res.body;

    expect(thirdPageSuccess).to.be.true;
    expect(thirdPageResult.title).to.equal(body.blocks[0].data.text);
    expect(thirdPageResult.uri).to.equal(transformToUri(body.blocks[0].data.text));
    expect(thirdPageResult.body).to.deep.equal(body);
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
            text: 'Page header to be deleted'
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

    res = await agent
      .delete(`/api/page/${_id}`);

    expect(res).to.have.status(200);
    expect(res).to.be.json;

    const {success, result} = res.body;

    expect(success).to.be.true;

    if (result) {
      expect(result._id).to.be.undefined;
      expect(result.title).to.equal(body.blocks[0].data.text);
      expect(result.uri).to.equal(transformToUri(body.blocks[0].data.text));
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

  async function createPageTree():Promise<string[]> {
    /**
     * Creating page tree
     *
     *         0
     *       /  \
     *      1   2
     *     / \   \
     *    3   5   6
     *   /       / \
     *  4       7  8
     */
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

    let parent, res, result;

    /** Page 1 */
    parent = 0;
    res = await agent
      .put('/api/page')
      .send({body, parent});

    result = res.body.result;
    const page1 = result;

    /** Page 2 */
    parent = 0;
    res = await agent
      .put('/api/page')
      .send({body, parent});

    result = res.body.result;
    const page2 = result;

    /** Page 3 */
    parent = page1._id;
    res = await agent
      .put('/api/page')
      .send({body, parent});

    result = res.body.result;
    const page3 = result;

    /** Page 4 */
    parent = page3._id;
    res = await agent
      .put('/api/page')
      .send({body, parent});

    result = res.body.result;
    const page4 = result;

    /** Page 5 */
    parent = page1._id;
    res = await agent
      .put('/api/page')
      .send({body, parent});

    result = res.body.result;
    const page5 = result;

    /** Page 6 */
    parent = page2._id;
    res = await agent
      .put('/api/page')
      .send({body, parent});

    result = res.body.result;
    const page6 = result;

    /** Page 7 */
    parent = page6._id;
    res = await agent
      .put('/api/page')
      .send({body, parent});

    result = res.body.result;
    const page7 = result;

    /** Page 8 */
    parent = page6._id;
    res = await agent
      .put('/api/page')
      .send({body, parent});

    result = res.body.result;
    const page8 = result;

    return [
      0,
      page1._id,
      page2._id,
      page3._id,
      page4._id,
      page5._id,
      page6._id,
      page7._id,
      page8._id
    ];
  }

  it('Removing a page and its children', async () => {
    const pages = await createPageTree();

    /**
     * Deleting from tree page1
     * Also pages 3, 5 and 4 must be deleted
     */
    await agent
      .delete(`/api/page/${pages[1]}`);

    const page3 = await Page.get(pages[3]);
    expect(page3.data._id).to.be.undefined;

    const page4 = await Page.get(pages[4]);
    expect(page4.data._id).to.be.undefined;

    const page5 = await Page.get(pages[5]);
    expect(page5.data._id).to.be.undefined;

    /** Okay, pages above is deleted */
    const page2 = await Page.get(pages[2]);
    expect(page2.data._id).not.to.be.undefined;

    /** First check pages 6, 7 and 8 before deleting */
    let page6 = await Page.get(pages[6]);
    expect(page6.data._id).not.to.be.undefined;

    let page7 = await Page.get(pages[7]);
    expect(page7.data._id).not.to.be.undefined;

    let page8 = await Page.get(pages[8]);
    expect(page8.data._id).not.to.be.undefined;

    /**
     * Delete page6
     * also pages 7 and 8 must be deleted
     */
    await agent
      .delete(`/api/page/${pages[6]}`);

    page6 = await Page.get(pages[6]);
    expect(page6.data._id).to.be.undefined;

    page7 = await Page.get(pages[7]);
    expect(page7.data._id).to.be.undefined;

    page8 = await Page.get(pages[8]);
    expect(page8.data._id).to.be.undefined;
  });
});
