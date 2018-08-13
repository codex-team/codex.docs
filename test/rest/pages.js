const {app} = require('../../bin/www');
const model = require('../../models/page');

const chai = require('chai');
const chaiHTTP = require('chai-http');
const {expect} = chai;

chai.use(chaiHTTP);

describe('Pages REST: ', () => {
    let agent;

    before(async () => {
        agent = chai.request.agent(app);
    });

    it('Creating page', async () => {
        const title = 'Test page';
        const body = 'Test page body';

        const res = await agent
            .put('/page')
            .send({title, body});
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        const {success, result} = res.body;

        expect(success).to.be.true;
        expect(result._id).to.be.a('string');
        expect(result.title).to.equal(title);
        expect(result.body).to.equal(body);

        const createdPage = await model.get(result._id);

        expect(createdPage).not.be.null;
        expect(createdPage._id).to.equal(result._id);
        expect(createdPage.title).to.equal(title);
        expect(createdPage.body).to.equal(body);

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
        expect(error).to.equal('Invalid request format');
    });

    it('Finding page', async () => {
        const title = 'Test page';
        const body = 'Test page body';

        const put = await agent
            .put('/page')
            .send({title, body});
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
        expect(foundPage.title).to.equal(title);
        expect(foundPage.body).to.equal(body);

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
        const title = 'Test page';
        const body = 'Test page body';

        let res = await agent
            .put('/page')
            .send({title, body});
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        const {result: {_id}} = res.body;

        const updatedTitle = 'Updated test page';
        const updatedBody = 'Updated test page body';

        res = await agent
            .post(`/page/${_id}`)
            .send({title: updatedTitle, body: updatedBody});

        expect(res).to.have.status(200);
        expect(res).to.be.json;

        const {success, result} = res.body;

        expect(success).to.be.true;
        expect(result._id).to.equal(_id);
        expect(result.title).not.equal(title);
        expect(result.title).to.equal(updatedTitle);
        expect(result.body).not.equal(body);
        expect(result.body).to.equal(updatedBody);

        const updatedPage = await model.get(_id);

        expect(updatedPage._id).to.equal(_id);
        expect(updatedPage.title).not.equal(title);
        expect(updatedPage.title).to.equal(updatedTitle);
        expect(updatedPage.body).not.equal(body);
        expect(updatedPage.body).to.equal(updatedBody);

        updatedPage.destroy();
    });

    it('Updating page with not existing id', async () => {
       const res = await agent
                             . post('/page/not-existing-id')
                             .send({title: 'Updated title', body: 'Updated body'});

       expect(res).to.have.status(400);
       expect(res).to.be.json;

       const {success, error} = res.body;

       expect(success).to.be.false;
       expect(error).to.equal('Page with given id does not exist');
    });

    it('Removing page', async () => {
        const title = 'Test page';
        const body = 'Test page body';

        let res = await agent
            .put('/page')
            .send({title, body});
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
        expect(result.title).to.equal(title);
        expect(result.body).to.equal(body);

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
    })

});