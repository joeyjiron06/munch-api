const { expect } = require('chai');
const { Mockgoose } = require('mockgoose');
const mongoose = require('mongoose');

const mockgoose = new Mockgoose(mongoose);

const User = require('../../src/models/user');


describe('User Model', () => {

  before((done) => {
    console.log('BEFORE : storage prepared!');
    mockgoose.prepareStorage().then(() => {
      console.log('AFTER : storage prepared!');

      mongoose.Promise = global.Promise;
      mongoose.connect('mongodb://localhost/testdb');
      mongoose.connection.on('connected', (err) => {
        if (err) { console.error('ERROR connecting to db', err); }
        done(err);
      });

      mongoose.connection.on('error', (err) => {
        if (err) { console.error('ERROR connecting to db', err); }
        done(err);
      });

    })
      .catch((error) => {
        console.log('ERROR preparing storage', error);
        done(error);
      });
  });


  describe('save', () => {
    it('should return a promise',  () => {
      let promise = new User({username:'what', password:'1234'}).save();
      expect(promise).to.be.instanceOf(global.Promise);
    });


    //it('should return an error of no email', () => {
    //  new User({password:'password'})
    //    .save()
    //    .then(() => {
    //      throw new Error('saving a user with no password must reject the promise');
    //    })
    //    .catch((err) => {
    //      expect(err).to.be.defined;
    //    });
    //});
    // - should return an error if no email
    // - should return an error if email is not an email format
    // - should return an error if no password
    // - should return an error if password is less than 3 chars
    // - should return an error if user exists
    // - should return the saved user if success
  });


});
