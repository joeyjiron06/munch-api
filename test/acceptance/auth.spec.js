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

  function postUser(email, password) {
    return new Promise((resolve, reject) => {
      chai.request(server)
        .post('/v1/user')
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
      return authenticate('joeshmoe@gmail.com', 'password').catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          errors : {
            user : 'User does not exist'
          }
        });
      });
    });
    it('should return 400 when an invalid email is supplied', () => {
      return authenticate('notAValidEmail','password').catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          errors : {
            email : 'You must supply a valid email'
          }
        });
      });
    });

    it('should return 400 if password does not match the password on file', () => {
      return postUser('joeyjiron06@gmail.com', 'mylittlesecret')
        .then(() => authenticate('joeyjiron06@gmail.com', 'thisIsTheWrongPassword'))
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.deep.equal({
            errors : {
              password : 'Invalid password'
            }
          });
        });
    });
    // - 200 username and password are correct, returns a jsonwebtoken cookie
  });


});
