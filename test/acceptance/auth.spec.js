const chai = require('chai');
const server = require('../../index');
const MockMongoose = require('../lib/mock-mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
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

  function parseCookie(cookie) {
    let result = {};

    cookie.split(';').forEach((kvPair) => {
      let split = kvPair.split('=');
      let key = split[0].trim();
      let val = split[1].trim();
      result[key] = val;
    });

    return result;
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

    it('should return a 200 success and json webtoken if email and password is correct', () => {
      let userId;
      return postUser('joeyjiron06@gmail.com', 'mylittlesecret')
        .then((res) => {
          userId = res.body.id;
          return authenticate('joeyjiron06@gmail.com', 'mylittlesecret')
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.equal({
            id : userId,
            email : 'joeyjiron06@gmail.com'
          });
        });
    });

    it('should return a json web token when login is susccessful', () => {
      return postUser('joeyjiron06@gmail.com', 'mylittlesecret')
        .then((res) => authenticate('joeyjiron06@gmail.com', 'mylittlesecret'))
        .then((res) => {
          let cookie = parseCookie(res.headers['set-cookie'][0]);
          expect(cookie.munchtoken, 'should have munchtoken cookie').to.not.be.empty;
          expect(cookie.munchtoken, 'should be a valid json webtoken').to.satisfy(value => jwt.verify(value, config.jwtSecret));
        });
    });
  });


});
