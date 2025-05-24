const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // importa tu aplicación Express
const expect = chai.expect;

chai.use(chaiHttp);

describe('User API', () => {
  it('debería devolver lista de usuarios', (done) => {
    chai.request(app)
      .get('/api/users')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        done();
      });
  });
});
