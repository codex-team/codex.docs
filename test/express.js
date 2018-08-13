const {app} = require('../bin/www');
const chai = require('chai');
const chaiHTTP = require('chai-http');
const {expect} = chai;

chai.use(chaiHTTP);


describe(`Express app`, () => {

    it('App is available', (done) => {
      chai
        .request(app)
        .get('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        })
    });

});