const chai = require('chai');
const server = require('../../index');
const MockMongoose = require('../lib/mock-mongoose');
const { expect } = chai;

describe('Auth API', () => {
  before(() => {
    return MockMongoose.connect();
  });

  after(() => {
    return MockMongoose.disconnect();
  });

  beforeEach(() => {
    return MockMongoose.clear();
  });

  function authenticate(email, password) {
    return new Promise((resolve, reject) => {
      chai.request(server)
        .post('/v1/authenticate')
        .send({email, password})
        .end((err, res) => {
          if (err) {
            reject(res);
          } else {
            resolve(res);
          }
        });
    });
  }

  describe('POST /authenticate', () => {
    it('should return a 400 user does not exist error if no user exists for that email', () => {
      return authenticate('joeshmoe@gmail.com', 'password').catch(res => {
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          errors : {
            user : 'User does not exist'
          }
        });
      });
    });
    // - 400 invalid email
    it('should return 400 when an invalid email is supplied', () => {
      return authenticate('notAValidEmail','password').catch(res => {
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          errors : {
            email : 'You must supply a valid email'
          }
        });
      });
    });
    // - 400 password doest not match
    // - 200 username and password are correct, returns a jsonwebtoken cookie
  });


});
