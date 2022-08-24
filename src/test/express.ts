import chaiHTTP from 'chai-http';
import chai, { expect } from 'chai';

import server from '../bin/server.js';

const app = server.app;

chai.use(chaiHTTP);

describe('Express app', () => {
  it('App is available', async () => {
    const agent = chai.request.agent(app);

    const result = await agent
      .get('/');

    expect(result).to.have.status(200);
  });
});
