const expect = require('chai').expect;
const fs = require('fs');
const Feeds = require('../../src/Feeds');


describe('Feeds', () => {


  describe('atom', () => {
    it('should parse feeds into a json structure', () => {
      let xml = fs.readFileSync('test/fixtures/atom.feed.xml', 'utf8');
      let data =  Feeds.atom(xml);

      expect(data.source).to.deep.equal({
        title : 'The Verge - All Posts',
        img_url: 'https://cdn3.vox-cdn.com/community_logos/34086/verge-fv.png',
        link : 'http://www.theverge.com/'
      });

      expect(data.items[0]).to.deep.equal({
        title : 'This Lamborghini is the fastest production car ever to lap the Nürburgring',
        link : 'http://www.theverge.com/2017/3/6/14837790/lamborghini-huracan-performante-unveil-geneva-motor-show-2017',
        img_url : 'https://cdn0.vox-cdn.com/thumbor/38QtYlvQYSZeOCotESIKrU4fBX0=/493x0:4824x2887/1310x873/cdn0.vox-cdn.com/uploads/chorus_image/image/53570647/Huracan_Performante_High__5_.0.jpg'
      });

      expect(data.items[1]).to.deep.equal({
        title : 'This is a test',
        link : 'http://www.test.com/hello-test',
        img_url : 'https://test.com/image.jpg'
      });
    });

    it('should return null if an invalid xml is specified', () => {
      expect(Feeds.atom('')).to.be.null;
      expect(Feeds.atom('bad data!')).to.be.null;
      expect(Feeds.atom(null)).to.be.null;
      expect(Feeds.atom(undefined)).to.be.null;
      expect(Feeds.atom(12)).to.be.null;
      expect(Feeds.atom({})).to.be.null;
      expect(Feeds.atom(function(){})).to.be.null;
    });

    it('should return a json with no link when no link is specified', () => {
      let xml = fs.readFileSync('test/fixtures/atom.feed.xml', 'utf8');

      // remove the link from the fixture and make sure it still parses
      xml = xml.replace('<link type="text/html" href="http://www.theverge.com/" rel="alternate"/>', '');
      let data = Feeds.atom(xml);
      expect(data.source.link).to.be.null;
    });

    it('should return an empty array when no entries are in xml', () => {
      let xml = '<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en"></feed>';
      let data = Feeds.atom(xml);
      expect(data.items).to.have.length(0);
    });

    it('should return entries that dont have links', () => {
      let xml = '<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en"><entry><title>Test</title></entry></feed>';
      let data = Feeds.atom(xml);
      expect(data.items[0].title).to.equal('Test');
    });
  });

});