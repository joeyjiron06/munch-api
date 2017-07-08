class Cache {

  /**
   * @param {object} [options]
   * @param {number} options.limit - the size limit of the cache
   */
  constructor(options) {
    this.options = options || {};
    this.size = 0;
    this.hash = {};
  }

  /**
   *
   * @param {*}      key            - the get to hash on
   * @param {*}      value          - the value to save
   * @param {object} [options]      - options for saving
   * @param {number} [options.ttl]  - time to live. default behavoir is it will get kicked out when cache is full
   */
  set(key, value, options) {
    options = Object.assign({ttl:Number.POSITIVE_INFINITY}, options);

    if (!this.hash[key]) {
      this.hash[key] = {};
      this.size++;
    }

    this.hash[key].value = value;
    this.hash[key].lastUsed = Date.now();
    this.hash[key].ttl = options.ttl;


    if (this.options.limit !== undefined && this.size > this.options.limit) {
      delete this.hash[this.findOldestKey()];
      this.size--;
    }
  }


  /**
   *
   * @param {string} key
   * @return {*|undefined} the given value for the key
   */
  get(key) {
    let hashItem = this.hash[key];

    if (!hashItem) {
      return undefined;
    }

    let delta = Date.now() - hashItem.lastUsed;
    if (delta > hashItem.ttl) {
      return undefined;
    }

    hashItem.lastUsed = Date.now();
    return hashItem.value;
  }


  findOldestKey() {
    let oldestTime;
    let oldestKey;

    Object.getOwnPropertyNames(this.hash).forEach((key) => {
      let item = this.hash[key];
      if (!oldestTime || item.lastUsed < oldestTime) {
        oldestTime = item.lastUsed;
        oldestKey = key;
      }
    });

    return oldestKey;
  }
}

module.exports = Cache;