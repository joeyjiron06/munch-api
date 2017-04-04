const { expect } = require('chai');
const mongoose = require('mongoose');
const MockMongoose = require('../lib/mock-mongoose');
const User = require('../../src/models/user');

/**
 * User model Tests
 * These are integration tests, testing the methods on mongoose.
 * For testing purposes we only use an in memory database and connect to it
 *
 */
describe('User Model', () => {

  // TODO move this to a global setup
  before((done) => {
    MockMongoose.initialize().then(() => done());
  });

  beforeEach((done) => {
    // remove all users before each test
    User.remove({}).then(() => done());
  });

  describe('save', () => {
    let user;

    it('should return a promise',  () => {
      user = new User({email:'what@what.com', password:'1234'});
      expect(user.save()).to.be.instanceOf(Promise);
    });

    it('should return an error if no email supplied', (done) => {
      user = new User({});
      user.save().then(() => {
         throw new Error('saving a user with no password must reject the promise');
       })
       .catch((err) => {
          expect(err.errors.email).to.be.an.error;
          expect(err.errors.email.message).to.be.definded;
          done();
       });
    });

    it('should return an error if email is not an email format', (done) => {
      user = new User({email:'whatIsThisItsNotAnEmail', password:'password'});
      user.save().then(() => {
        throw new Error('saving a user with invalid email must reject the promise');
      })
      .catch((err) => {
        expect(err.errors.email).to.be.an.error;
        expect(err.errors.email.message).to.be.definded;
        done();
      });
    });

    it('should return a error if no password is given', (done) => {
      user = new User({email:'joeyjiron06@gmail.com'});
      user.save().then(() => {
        throw new Error('saving a user with NO password must reject the promise');
      })
      .catch((err) => {
        expect(err.errors.password).to.be.an.error;
        expect(err.errors.password.message).to.be.defined;
        done();
      });
    });

    it('should return an invalid password error if its less than 3 chars', (done) => {
      user = new User({email:'joeyjiron06@gmail.com', password:'aa'});
      user.save().then(() => {
        throw new Error('saving a user with invalid password must reject the promise');
      })
      .catch((err) => {
        expect(err.errors.password).to.be.an.error;
        expect(err.errors.password.message).to.not.be.empty;
        done();
      });
    });

    it('should return an error if the user already exists', (done) => {
      new User({email:'joeyjiron06@gmail.com', password:'password'}).save()
        .then((user) => {
          return new User({email:'joeyjiron06@gmail.com', password:'someotherpassword'}).save();
        })
        .then((user) => {
          throw new Error('promise should be rejected when trying to add a user for a second time');
        })
        .catch((err) => {
          expect(err.code).to.equal(11000);
          done();
        });
    });

    it('should save a user with a valid email and password', (done) => {
      new User({email:'joeyjiron06@gmail.com', password:'password'}).save()
        .then((user) => {
          expect(user).to.be.an.object;
          expect(user.email).to.equal('joeyjiron06@gmail.com');

          return User.find({});
        })
        .then((foundUsers) => {
          expect(foundUsers).to.have.length(1);
          expect(foundUsers[0].email).to.equal('joeyjiron06@gmail.com');
          done();
        });
    });

    it('should be able to save multiple users', (done) => {
      new User({email:'barbarastreisand@gmail.com', password:'password'}).save()
      .then((user) => {
        return new User({email:'bobsagat@gmail.com', password:'mypass'}).save();
      })
      .then((user) => {
        return User.find();
      })
      .then((users) => {
        expect(users).to.have.length(2);
        done();
      });
    });

    it('should not save clear text password', (done) => {
      new User({email:'joeyjiron06@gmail.com', password:'secret'}).save()
        .then((user) => {
          expect(user.password).to.not.equal('secret');
          done();
        });
    });
  });


});
