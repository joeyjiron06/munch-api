const { expect }= require('chai');
const config = require('../../src/config');
const MockMongoose = require('../lib/mock-mongoose');
const MailDev = require('maildev');
const MunchAPI = require('../lib/munch-api');
const parseCookie = require('../lib/parse-cookie');
const requireAuth = require('../lib/require-auth');


describe('Me API', () => {
  before(() => {
    return MockMongoose.connect();
  });

  after(() => {
    return MockMongoose.disconnect();
  });

  beforeEach(() => {
    return MockMongoose.clear();
  });

  // MY FEEDS endpoints
  describe('GET /me/feeds', () => {
    requireAuth('GET', '/me/feeds');

    it('should return status 200 and an array of feeds for the signed in user', () => {

    });
  });

  describe('PUT me/feeds', () => {
    requireAuth('PUT', '/me/feeds');

    it('should return status 400 and an error message if there is no body', () => {

    });

    it('should return status 400 and an error message if there is no title', () => {

    });

    it('should return status 400 and an error message if there is no url', () => {

    });

    it('should return status 400, an error message and feed if url of the feed is already taken', () => {

    });

    it('should return status 200 when an authenticated user adds a feed', () => {

    });
  });

  describe('DELETE me/feeds/{id}', () => {
    requireAuth('DELETE', '/me/feeds/1');

    it('should return 400 if an invalid id is given', () => {

    });

    it('should delete a feed for an authenticated user', () => {

    });
  });
});