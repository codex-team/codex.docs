import chai from 'chai';
import chaiHTTP from 'chai-http';
import server from '../../bin/server.js';

const {expect} = chai;
const app = server.app;

chai.use(chaiHTTP);

describe('Links REST: ', () => {
  it('Responds 400 when url is missing', async () => {
    const res = await chai.request(app).get('/api/fetchUrl');

    expect(res).to.have.status(400);
    expect(res.body).to.deep.equal({ success: 0 });
  });

  it('Responds 400 when url is not a single string', async () => {
    const res = await chai.request(app).get('/api/fetchUrl?url[]=https://example.com');

    expect(res).to.have.status(400);
    expect(res.body).to.deep.equal({ success: 0 });
  });
});
