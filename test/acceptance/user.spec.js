const chai = require('chai');
const server = require('../../index');
const chaiHttp = require('chai-http');
const MockMongoose = require('../lib/mock-mongoose');
const User = require('../../src/models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('User', () => {
  before((done) => {
    MockMongoose.connect().then(() => done());
  });

  after((done) => {
    MockMongoose.disconnect().then(() => done());
  });

  beforeEach((done) => {
    MockMongoose.clear().then(() => done());
  });

  describe('POST /user', () => {
    // todo expect content-type json, ex expect(res).to.have.header('content-type', 'text/plain');

    function postUser(user, callback) {
      chai.request(server)
        .post('/v1/user')
        .send(user)
        .end(callback);
    }


    it('should return 400 when no email is supplied', (done) => {
      postUser({'password': 'hello1234'}, (err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an.object;
        expect(res.body.errors).to.be.an.object;
        expect(res.body.errors.email).to.be.an.object;
        expect(res.body.errors.email.message).to.not.be.empty;
        expect(res.body.errors.password).to.be.undefined;
        done();
      });
    });

    it('should return 400 when no password is supplied', (done) => {
      postUser({email: 'joey'}, (err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email.message).to.not.be.empty;
        expect(res.body.errors.password.message).to.not.be.empty;
        done();
      });
    });

    it('should return 400 when no body is supplied', (done) => {
      postUser(null, (err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email.message).to.not.be.empty;
        expect(res.body.errors.password.message).to.not.be.empty;
        done();
      });

    });

    it('should return 409 and email error message when email is already taken', (done) => {
      let user = {email:'joeyjiron06@gmail.com', password:'testpwd1234'};
      postUser(user, (err, res) => {
        if (err) {
          console.error('first user creation errored');
          throw err;
        }


        postUser(user, (err, res) => {
          expect(res).to.have.status(409);
          expect(res.body.errors.email).to.not.be.empty;
          done();
        });
      });
    });

    it('should return a 400 and an email error message when email is not in the right formate', (done) => {
      let user = {email:'notTheRightFormat', password:'23asdfasdf'};
      postUser(user, (err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email).to.not.be.empty;
        done();
      });
    });

    it('should return a 400 and password error when password is too short', (done) => {
      let user = {email:'joeyjiron06@gmail.com', password:'122'};
      postUser(user, (err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email).to.be.undefined;
        expect(res.body.errors.password).to.not.be.empty;
        done();
      });
    });

    it('should return a 200 and user id when given good data', (done) => {
      let user = {email:'joeyjiron06@gmail.com', password:'12345678'};
      postUser(user, (err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.id).to.not.be.empty;
        expect(res.body.email).to.equal('joeyjiron06@gmail.com');
        done();
      });
    });
  });
});