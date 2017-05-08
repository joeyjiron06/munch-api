const chai = require('chai');
const server = require('../../index');
const chaiHttp = require('chai-http');
const mockServer = require('../lib/mock-server');
const MunchAPI = require('../lib/munch-api');
const MockMongoose = require('../lib/mock-mongoose');

const expect = chai.expect;

chai.use(chaiHttp);


describe('Feed API', () => {

  before(() => MockMongoose.connect());

  after(() => MockMongoose.disconnect());

  beforeEach(() => MockMongoose.clear());

  describe('GET /feeds/{id}', () => {
    it('should return status 400 and error message if invalid is given', () => {

    });

    it('should return status 200 and a single feed', () => {

    });
  });


  describe('GET /feeds/{id}/articles', () => {
    it('should return status 400 when invalid feed id is specified', () => {

    });

    it('should return status 200 and a feed with articles', () => {

    });
  });   //TODO unit tests for cache


  describe('PUT /feeds', () => {
    it('should return status 400 and an error message if there is no title', () => {
      return MunchAPI.addFeed({})
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.title).to.be.equal('You must post a valid title');
        });
    });


    it('should return status 400 and an error message if there is no url', () => {
      return MunchAPI.addFeed({title:'hello'})
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.url).to.be.equal('You must post a valid url');
        });
    });

    it('should return status 400, an error message and feed if url of the feed is already taken', () => {
      return MunchAPI.addFeed({title:'The Verge', url:'https://theverge.com/rss.xml'})
        .then(() => {
          return MunchAPI.addFeed({title:'The Verge', url:'https://theverge.com/rss.xml'});
        })
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.url).to.be.equal('Url is already taken');
          expect(res.body.feed.id).to.not.be.empty;
          expect(res.body.feed.title).to.be.equal('The Verge');
          expect(res.body.feed.url).to.be.equal('https://theverge.com/rss.xml');
        });
    });

    it('should return status 200 and the feed upon successful creation', () => {
      return MunchAPI.addFeed({title:'The Verge', url:'https://theverge.com/rss.xml'})
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.id).to.not.be.empty;
          expect(res.body.title).to.equal('The Verge');
          expect(res.body.url).to.equal('https://theverge.com/rss.xml');
        });
    });
  });


  // TODO remove
  describe('/GET feed', () => {
    before(() => {
      mockServer.init(6000);
    });
    after(() => {
      mockServer.destroy();
    });

    function getFeed(url) {
      return new Promise((resolve, reject) => {
        chai.request(server)
          .get(url !== undefined ? `/v1/feed?url=${url}` : '/v1/feed')
          .end((err, res) => {
            if (err) {
              reject(res);
            } else {
              resolve(res);
            }
          });

      });
    }

    it('should return 400 status code and error message when no url is specified', () => {
      return getFeed(undefined).catch((res) => {
        expect(res.status).to.equal(400);
        expect(res.body).to.deep.equal({
          message : 'You must specify a feed url'
        });
      });
    });

    it('should return 400 status code and error message an empty url is specified', () => {
      return getFeed('').catch((res) => {
        expect(res.status).to.equal(400);
        expect(res.body).to.deep.equal({
          message : 'You must specify a feed url'
        });
      });
    });

    it('should return 400 status code and an error message when an INVALID RSS feed is specified', () => {
      return getFeed(encodeURIComponent('http://hi.com')).catch((res) => {
        expect(res.status).to.equal(400);
        expect(res.body).to.deep.equal({
          url : 'http://hi.com',
          message : 'invalid url'
        });
      });
    });

    it('should return an array of articles when given a url', () => {
      let mockExternalUrl =  mockServer.getUrl('/atom.feed.xml');
      return getFeed(encodeURIComponent(mockExternalUrl)).then((res) => {
        expect(res.status).to.equal(200);

        let feed = res.body;
        expect(feed).to.not.be.empty;

        expect(feed.source.img_url).to.not.be.empty;
        expect(feed.source.title).to.equal('The Verge - All Posts');
        expect(feed.source.link).to.equal('http://www.theverge.com/');

        let firstArticle = feed.items[0];
        expect(firstArticle.title).to.not.be.empty;
        expect(firstArticle.img_url).to.not.be.empty;
        expect(firstArticle.link).to.match(/^http:\/\/www\.theverge\.com/);
      });
    });

    it('should return CORS headers', () => {
      let mockExternalUrl = mockServer.getUrl('/atom.feed.xml');
      return getFeed(encodeURIComponent(mockExternalUrl)).then((res) => {
        let headers = res.headers;
        expect(headers['access-control-allow-origin']).to.equal('*');
      });
    });
  });
});