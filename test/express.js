const { app } = require('../bin/www');
const chai = require('chai');
const chaiHTTP = require('chai-http');
const { expect } = chai;

chai.use(chaiHTTP);

describe('Express app', () => {
  it('App is available', async () => {
    let agent = chai.request.agent(app);

    const result = await agent
      .get('/');

    expect(result).to.have.status(200);
  });
});
