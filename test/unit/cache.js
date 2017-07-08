const { expect } = require('chai');
const Cache = require('../../src/utils/cache');
const MockDate = require('../lib/mock-date');


describe('Cache' , () => {
  let cache;

  beforeEach(() => {
    MockDate.init();
    cache = new Cache();
  });

  afterEach(() => {
    MockDate.restore()
  });

  it('should return undefined for a value when nothing has been saved', () => {
    expect(cache.get('someKey')).to.be.undefined;
  });

  it('should be able to set and get a value', () => {
    cache.set('someKey', 'test');
    expect(cache.get('someKey')).to.equal('test');
  });

  it('should return undefined when past ttl', () => {
    let ttl = 60 * 1000;
    cache.set('test', 123, {ttl});
    MockDate.tick(ttl + 1);
    expect(cache.get('test')).to.be.undefined;
  });

  it('should respect the limit of the cache', () => {
    cache = new Cache({limit:3});
    cache.set(1, '1');
    cache.set(2, '2');
    cache.set(3, '3');
    cache.set(4, '4');
    cache.set(5, '5');

    expect(cache.get(1)).to.be.undefined;
    expect(cache.get(2)).to.be.undefined;
    expect(cache.get(3)).to.equal('3');
    expect(cache.get(4)).to.equal('4');
    expect(cache.get(5)).to.equal('5');
  });

  it('should bump the date when get is called', () => {
    let ttl = 60 * 1000;
    cache.set('test', 123, {ttl});
    MockDate.tick(ttl - 5);
    expect(cache.get('test')).to.equal(123);
    MockDate.tick(ttl + 5 + 1);
    expect(cache.get('test')).to.equal(123);
  });

  it('should respect limit even when supplied same key', () => {
    cache = new Cache({limit:3});
    cache.set(1, '1');
    cache.set(2, '2');
    cache.set(3, '3');
    cache.set(1, '1');
    expect(cache.get(1)).to.equal('1');
    expect(cache.get(2)).to.equal('2');
    expect(cache.get(3)).to.equal('3');
  });
});