const {app} = require('../../bin/www');

const fs = require('fs');
const path = require('path');
const config = require('../../config');
const chai = require('chai');
const chaiHTTP = require('chai-http');
const {expect} = chai;

chai.use(chaiHTTP);

describe('Aliases REST: ', () => {
  let agent;

  before(async () => {
    agent = chai.request.agent(app);
  });

  after(async () => {
    const pathToDB = path.resolve(__dirname, '../../', config.database, './pages.db');

    if (fs.existsSync(pathToDB)) {
      fs.unlinkSync(pathToDB);
    }

    const pathToAliasDB = path.resolve(__dirname, '../../', config.database, './aliases.db');

    if (fs.existsSync(pathToAliasDB)) {
      fs.unlinkSync(pathToAliasDB);
    }
  });

  it('Finding page with alias', async () => {
    const body = {
      blocks: [
        {
          type: 'header',
          data: {
            text: 'Test header'
          }
        }
      ]
    };

    const put = await agent
      .put('/api/page')
      .send({body});

    expect(put).to.have.status(200);
    expect(put).to.be.json;

    const {result: {uri}} = put.body;

    const get = await agent.get(`/${uri}`);

    expect(get).to.have.status(200);
  });
});
