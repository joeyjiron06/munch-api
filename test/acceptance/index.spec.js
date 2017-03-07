const chai = require('chai');
const server = require('../../index');
const chaiHttp = require('chai-http');

const expect = chai.expect;
const RSS_URL = 'http://www.theverge.com/rss/index.xml';

chai.use(chaiHttp);

describe('Server', () => {
  describe('/GET feed', () => {
    it('should return 400 status code and error message when no url is specified', (done) => {
      chai.request(server)
        .get('/v1/feed')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.deep.equal({
            message : 'You must specify a feed url'
          });
          done();
        });
    });

    it('should return 400 status code and error message an empty url is specified', (done) => {
      chai.request(server)
        .get('/v1/feed?url')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.deep.equal({
            message : 'You must specify a feed url'
          });
          done();
        });
    });

    it('should return a JSON structure when given a url', (done) => {
      chai.request(server)
        .get(`/v1/feed?url=${encodeURIComponent(RSS_URL)}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.not.be.empty;

          let firstArticle = res.body[0];
          expect(firstArticle.title).to.not.be.empty;
          expect(firstArticle.img_url).to.not.be.empty;
          expect(firstArticle.link).to.match(/^http:\/\/www\.theverge\.com/);
          expect(firstArticle.source.img_url).to.not.be.empty;
          expect(firstArticle.source.title).to.equal('The Verge');
          expect(firstArticle.source.link).to.equal('http://www.theverge.com/');

          done();
        });
    });
  });
});