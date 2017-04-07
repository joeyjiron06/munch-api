const chai = require('chai');
const server = require('../../index');
const MockMongoose = require('../lib/mock-mongoose');
const User = require('../../src/models/user');

const { expect } = chai;

const describeSKIP = function(name) { console.log('skipping test', name); };

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

  function postUser(user) {
    return new Promise((resolve, reject) => {
      chai.request(server)
        .post('/v1/user')
        .send(user)
        .end((err, res) => {
          if (err) {
            reject(res);
          } else {
            resolve(res);
          }
        });
    });
  }

  function deleteUser(id) {
    return new Promise((resolve, reject) => {
      chai.request(server)
        .delete(`/v1/user`)
        .send({id})
        .end((err, res) => {
          if (err) {
            reject(res);
          } else {
            resolve(res);
          }
        });
    });
  }

  function getUser(id) {
    return new Promise((resolve, reject) => {
      chai.request(server)
        .get('/v1/user')
        .send({id})
        .end((err, res) => {
          if (err) {
            reject(res);
          } else {
            resolve(res);
          }
        });
    });
  }

  function updatePassword(oldPassword, newPassword, id) {
    return new Promise((resolve, reject) => {
      chai.request(server)
        .post('/v1/user/update/password')
        .send({
          id: id,
          old_password: oldPassword,
          new_password: newPassword
        })
        .end((err, res) => {
          if (err) {
            reject(res);
          } else {
            resolve(res);
          }
        });
    });
  }

  describe('POST /user', () => {
    // todo expect content-type json, ex expect(res).to.have.header('content-type', 'text/plain');

    it('should return 400 when no email is supplied', (done) => {
      postUser({'password': 'hello1234'}).catch((res) => {
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
      postUser({email: 'joey'}).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email.message).to.not.be.empty;
        expect(res.body.errors.password.message).to.not.be.empty;
        done();
      });
    });

    it('should return 400 when no body is supplied', (done) => {
      postUser(null).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email.message).to.not.be.empty;
        expect(res.body.errors.password.message).to.not.be.empty;
        done();
      });

    });

    it('should return 409 and email error message when email is already taken', (done) => {
      let user = {email:'joeyjiron06@gmail.com', password:'testpwd1234'};
      postUser(user).then((res) => postUser(user)).catch((res) => {
        expect(res).to.have.status(409);
        expect(res.body.errors.email).to.not.be.empty;
        done();
      });
    });

    it('should return a 400 and an email error message when email is not in the right formate', (done) => {
      let user = {email:'notTheRightFormat', password:'23asdfasdf'};
      postUser(user).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email).to.not.be.empty;
        done();
      });
    });

    it('should return a 400 and password error when password is too short', (done) => {
      let user = {email:'joeyjiron06@gmail.com', password:'122'};
      postUser(user).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email).to.be.undefined;
        expect(res.body.errors.password).to.not.be.empty;
        done();
      });
    });

    it('should return a 200 and user id when given good data', (done) => {
      let user = {email:'joeyjiron06@gmail.com', password:'12345678'};
      postUser(user).then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.id).to.not.be.empty;
        expect(res.body.email).to.equal('joeyjiron06@gmail.com');
        done();
      });
    });
  });

  describe('DELETE /user', () => {

    it('should return a 400 when no user id is passed', (done) => {
      deleteUser(null).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.id).to.not.be.empty;
        done();
      });
    });

    it('should return a 400 if user is not found', (done) => {
      deleteUser('1').catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.id).to.not.be.empty;
        done();
      });
    });

    it('should delete a saved user', (done) => {
      let userId;
      postUser({email:'joeyj@gmail.com', password:'password'})
        .then((res) => {
          userId = res.body.id;
          return deleteUser(userId);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          return getUser(userId);
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.id.message).to.not.be.empty;
          done();
        });
    });
  });

  describe('GET /user', () => {

    it('should return 400 when not id is passed', (done) => {
      getUser(null).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.id.message).to.not.be.empty;
        done();
      });
    });

    it('should return 400 when no user found with id', (done) => {
      getUser('12fakeid').catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.id.message).to.not.be.empty;
        done();
      });
    });

    it('should return 200 and user info when valid user id is given', (done) => {
      let userId;
      postUser({email:'jo@gmail.com', password:'password'})
        .then((res) => {
          userId = res.body.id;
          return getUser(userId);
        })
        .then((res) => {
          let user = res.body;
          expect(res).to.have.status(200);
          expect(user).to.deep.equal({
            id : userId,
            email : 'jo@gmail.com'
          });
          done();
        });
    });
  });

  describe('POST /user/update/password', () => {
    let user = {email:'joeyjiron06@gmail.com', password:'password'};

    it('should return a 400 and error message when an invalid previous password is sent', () => {
      return postUser(user)
        .then((res) => {
          return updatePassword('thewrongpassword', 'someNewPassword', res.body.id);
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.old_password.message).to.not.be.empty;
          expect(res.body.errors.new_password).to.be.undefined;
        });
    });

    it('should return a 400 and error message when in invalid new password is sent', () => {
      return postUser(user)
        .then((res) => {
          return updatePassword('password', '2short', res.body.id);
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.new_password.message).to.not.be.empty;
          expect(res.body.errors.old_password).to.be.undefined;
        });
    });

    //invalid user id
    it('should return a 400 with error message when given a bad user id', () => {
      return updatePassword('password', 'newPassword', 'bogusIdThatDoesntExist')
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.id.message).to.not.be.empty;
          expect(res.body.errors.new_password).to.be.undefined;
          expect(res.body.errors.old_password).to.be.undefined;
        });
    });


    it('should return a 200 and user when password is updated properly', () => {
      let userId;
      return postUser(user)
        .then((res) => {
          userId = res.body.id;
          return updatePassword('password', 'newPassword', res.body.id);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.email).to.equal('joeyjiron06@gmail.com');
          expect(res.body.id).to.equal(userId);
          //TODO get token with new password should return success as well
        });
    });

  });

  describeSKIP('GET /user/email/:email', () => {
    // - invalid email
    // - email does NOT exist
    // - email does exist
  });

  describeSKIP('GET /user/token', () => {
    // - invalid email
    // - email does NOT exist
    // - email does exist
  });
});