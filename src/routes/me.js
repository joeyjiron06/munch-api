/**
 * GET /me/feeds
 * Retrieve a user's feeds
 * @param {Request} req
 * @param {Response} res
 */
exports.getFeeds = function(req, res) {
  res.status(200).json([]);
};

/**
 * PUT /me/feeds
 * Add a feed to a user's favorites
 * @param {Request} req
 * @param {Response} res
 */
exports.addFeed = function(req, res) {

};
