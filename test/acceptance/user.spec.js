const chai = require('chai');
const server = require('../../index');
const config = require('../../src/config');
const MockMongoose = require('../lib/mock-mongoose');
const MailDev = require('maildev');

const { expect } = chai;

describe('User API', () => {
  before(() => {
    return MockMongoose.connect();
  });

  after(() => {
    return MockMongoose.disconnect();
  });

  beforeEach(() => {
    return MockMongoose.clear();
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

  function updatePassword(oldPassword, newPassword, id, resetPasswordToken) {
    return new Promise((resolve, reject) => {
      chai.request(server)
        .post('/v1/user/update/password')
        .send({
          id: id,
          old_password: oldPassword,
          new_password: newPassword,
          reset_password_token : resetPasswordToken
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

  function verifyEmail(email) {
    return new Promise((resolve, reject) => {
      chai.request(server)
        .post('/v1/user/decode-email')
        .send({email})
        .end((err, res) => {
          if (err) {
            reject(res);
          } else {
            resolve(res);
          }
        });
    });
  }

  function resetPassword(email) {
    return new Promise((resolve, reject) => {
      chai.request(server)
        .post('/v1/user/reset-password')
        .send({email})
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

    it('should return 400 when no email is supplied', () => {
      return postUser({'password': 'hello1234'}).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an.object;
        expect(res.body.errors).to.be.an.object;
        expect(res.body.errors.email).to.be.an.object;
        expect(res.body.errors.email.message).to.not.be.empty;
        expect(res.body.errors.password).to.be.undefined;
      });
    });

    it('should return 400 when no password is supplied', () => {
      return postUser({email: 'joey'}).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email.message).to.not.be.empty;
        expect(res.body.errors.password.message).to.not.be.empty;
      });
    });

    it('should return 400 when no body is supplied', () => {
      return postUser(null).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email.message).to.not.be.empty;
        expect(res.body.errors.password.message).to.not.be.empty;
      });

    });

    it('should return 409 and email error message when email is already taken', () => {
      let user = {email:'joeyjiron06@gmail.com', password:'testpwd1234'};
      return postUser(user).then((res) => postUser(user)).catch((res) => {
        expect(res).to.have.status(409);
        expect(res.body.errors.email).to.not.be.empty;
      });
    });

    it('should return a 400 and an email error message when email is not in the right formate', () => {
      let user = {email:'notTheRightFormat', password:'23asdfasdf'};
      return postUser(user).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email).to.not.be.empty;
      });
    });

    it('should return a 400 and password error when password is too short', () => {
      let user = {email:'joeyjiron06@gmail.com', password:'122'};
      return postUser(user).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email).to.be.undefined;
        expect(res.body.errors.password).to.not.be.empty;
      });
    });

    it('should return a 200 and user id when given good data', () => {
      let user = {email:'joeyjiron06@gmail.com', password:'12345678'};
      return postUser(user).then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.id).to.not.be.empty;
        expect(res.body.email).to.equal('joeyjiron06@gmail.com');
      });
    });
  });

  describe('DELETE /user', () => {

    it('should return a 400 when no user id is passed', () => {
      return deleteUser(null).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.id).to.not.be.empty;
      });
    });

    it('should return a 400 if user is not found', () => {
      return deleteUser('1').catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.id).to.not.be.empty;
      });
    });

    it('should delete a saved user', () => {
      let userId;
      return postUser({email:'joeyj@gmail.com', password:'password'})
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
        });
    });
  });

  describe('GET /user', () => {

    it('should return 400 when not id is passed', () => {
      return getUser(null).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.id.message).to.not.be.empty;
      });
    });

    it('should return 400 when no user found with id', () => {
      return getUser('12fakeid').catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.id.message).to.not.be.empty;
      });
    });

    it('should return 200 and user info when valid user id is given', () => {
      let userId;
      return postUser({email:'jo@gmail.com', password:'password'})
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
        });
    });
  });

  describe('GET /user/decode-email', () => {
    it('should return true if email is available to use', () => {
      return verifyEmail('joeyjiron06@gmail.com')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.isEmailAvailable).to.be.true;
        })
    });

    it('should return false if email is NOT available to use', () => {
      return postUser({email:'joeyjiron06@gmail.com', password:'password'})
        .then(() => verifyEmail('joeyjiron06@gmail.com'))
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.isEmailAvailable).to.be.false;
        })
    });
  });

  describe('POST /user/reset-password', () => {
    // create a fake mail server
    let maildevServer;

    before((done) => {
      maildevServer = new MailDev({
        port : config.nodemailer.port
      });
      maildevServer.listen(() => done());
    });

    afterEach(() => {
      maildevServer.removeAllListeners();
    });

    after((done) => {
      maildevServer.end(() => done());
    });


    it('should return 400 when no email is specified and an error message', () => {
      return resetPassword(null)
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors).to.deep.equal({
            email : 'A valid email is required'
          });
        });
    });

    it('should return 400 when invalid email is sent and error message', () => {
      return resetPassword('thisIsNotAValidEmailAddress')
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors).to.deep.equal({
            email : 'A valid email is required'
          });
        });
    });

    it('should return 400 when user is not found with that email and an error message', () => {
      return resetPassword('joeyjiron06@gmail.com')
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors).to.deep.equal({
            user : 'User not found'
          });
        });
    });

    it('should return 200 when a valid email is given', () => {
      return postUser({email:'test@test.com', password:'password'})
        .then(() => resetPassword('test@test.com'))
        .then((res) => {
          expect(res).to.have.status(200);
        });
    });

    it('should return a valid token that can be used for /user/update/password', () => {
      return postUser({email:'test@test.com', password:'password'})
        .then(() => resetPassword('test@test.com'))
        .then((res) => {
          let {id, token} = res.body;
          return updatePassword(null, 'newPassword', id, token);
        })
        .then((res) => {
          expect(res).to.have.status(200);
        })
        .catch((err) => {
          console.log('error in token', err);
        })
    });

    it('should send an actual email with a token', (done) => {
      // wait for mail server to receive a new email
      maildevServer.on('new', email => {
        expect(email, 'email exists').to.not.be.empty;
        expect(email.headers.from, 'should be from joey jiron').to.include('Joey Jiron');
        expect(email.headers.to, 'should be to the user').to.equal('test@test.com');
        expect(email.html, 'should have a body that contains').to.not.be.empty;
        done();
      });
      postUser({email:'test@test.com', password:'password'})
        .then(() => resetPassword('test@test.com'))
    });
  });
});