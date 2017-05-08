const { expect }= require('chai');
const config = require('../../src/config');
const MockMongoose = require('../lib/mock-mongoose');
const MailDev = require('maildev');
const MunchAPI = require('../lib/munch-api');
const parseCookie = require('../lib/parse-cookie');
const requireAuth = require('../lib/require-auth');


describe('Me API', () => {
  let user;

  before(() => {
    return MockMongoose.connect();
  });

  after(() => {
    return MockMongoose.disconnect();
  });

  beforeEach(() => {
    return MockMongoose.clear()
      .then(() => {
        return MunchAPI.postUser({email:'joeyjiron06@gmail.com', password:'password'});
      })
      .then((res) => {
        user = res.body;
        return MunchAPI.authenticate('joeyjiron06@gmail.com', 'password');
      })
      .then((res) => {
        user.munchtoken = res.cookie.munchtoken;
      });
  });

  // MY FEEDS endpoints
  describe('GET /me/feeds', () => {
    requireAuth('GET', '/v1/me/feeds');


    it('should return status 200 and an empty array for a new user', () => {
      return MunchAPI.getMyFeeds(user.munchtoken)
        .then((res) => {
          expect(res.body).to.be.an.instanceOf(Array);
          expect(res.body).to.have.length(0);
        });
    });

    it('should return status 200 and an array of feeds for the signed in user', () => {
      return MunchAPI.addFeed({url:'https://verge.com/rss.xml', title:'The Verge'}, user.munchtoken)
        .then(() => {
          return MunchAPI.getMyFeeds(user.munchtoken);
        })
        .then((res) => {
          let feeds = res.body;
          expect(feeds).to.have.length(1);
          expect(feeds[0].id).to.not.be.empty;
          expect(feeds[0].title).to.be.equal('The Verge');
          expect(feeds[0].url).to.be.equal('https://verge.com/rss.xml');
        });
    });
  });

  describe('PUT me/feeds', () => {
    requireAuth('PUT', '/v1/me/feeds');



    // it('should return status 200 when an authenticated user adds a feed', () => {
    //
    // });
  });
  //
  // describe('DELETE me/feeds/{id}', () => {
  //   requireAuth('DELETE', '/v1/me/feeds/1');
  //
  //   it('should return 400 if an invalid id is given', () => {
  //
  //   });
  //
  //   it('should delete a feed for an authenticated user', () => {
  //
  //   });
  // });
});