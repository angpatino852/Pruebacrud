import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index.js';

const { expect } = chai;
chai.use(chaiHttp);

describe('Pruebas de la API', () => {
  it('GET / debería responder con 200', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal('Hola desde la API');
        done();
      });
  });
});
