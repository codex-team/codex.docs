import fs from 'fs';
import path from 'path';
import config from 'config';
import chai from 'chai';
import chaiHTTP from 'chai-http';
import server from '../../bin/server.js';
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

describe('Aliases REST: ', () => {
  let agent: ChaiHttp.Agent;

  before(async () => {
    agent = chai.request.agent(app);
  });

  after(async () => {
    const pathToDB = path.resolve(__dirname, '../../', config.get('database'), './pages.db');

    if (fs.existsSync(pathToDB)) {
      fs.unlinkSync(pathToDB);
    }

    const pathToAliasDB = path.resolve(__dirname, '../../', config.get('database'), './aliases.db');

    if (fs.existsSync(pathToAliasDB)) {
      fs.unlinkSync(pathToAliasDB);
    }
  });

  it('Finding page with alias', async () => {
    const body = {
      time: 1548375408533,
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

    const get = await agent.get('/' + uri);

    expect(get).to.have.status(200);
  });
});
