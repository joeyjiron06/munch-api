const prepare = require('mocha-prepare');
const MockMongoose = require('./lib/mock-mongoose');

// before tests run start start mongodb process which allows mongoose to connect to it
prepare(function (done) {
  MockMongoose.initialize().then(() => done());
});