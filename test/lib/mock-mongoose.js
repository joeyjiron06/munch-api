const path = require('path');
const fs = require('fs-extra');
const {MongodHelper} = require('mongodb-prebuilt');
const mongoose = require('mongoose');


class MockMongoose {
  /**
   * Start the in memory server and connect to it.
   * @public
   * @return {Promise}
   */
  static initialize() {
    mongoose.Promise = Promise;
    let tmpDir = this.prepareTempStorage();

    let port = 27017;
    return this.startMongo(port, tmpDir).then(() => {
      return this.connect(`mongodb://localhost:${port}`);
    });
  }

  /**
   * @private
   * @return {string} the path to the temp directory
   */
  static prepareTempStorage() {
    let pathname = path.join(process.cwd(), 'tmp');

    // clear folder if there was anything there before
    fs.removeSync(pathname);

    // create folder. start with a fresh copy
    fs.ensureDirSync(pathname);

    return pathname;
  }

  /**
   * Starts a mongodb sever at the given port
   * @private
   * @param {number} port - the port to start the db server
   * @param {string} tmpDir - the temp directory for db even though it's in memory, it still needs that
   * @return {Promise}
   */
  static startMongo(port, tmpDir) {
    let mongod = new MongodHelper([
      '--port',port,
      '--storageEngine', 'ephemeralForTest',
      '--dbpath', tmpDir,
    ]);
    return mongod.run();
  }

  /**
   * Connect mongoose to the given url
   * @private
   * @param {string} url - the url to mongodb database
   * @return {Promise}
   */
  static connect(url) {
    return new Promise((resolve, reject) => {
      mongoose.connect(url);
      mongoose.connection.on('connected', (err) => {
        if (err) { reject(err);}
        else { resolve(); }
      });
    });
  }
}


module.exports = MockMongoose;