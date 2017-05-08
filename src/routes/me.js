const Feed = require('../models/feed');
const User = require('../models/user');

/**
 * GET /me/feeds
 * Retrieve a user's feeds
 * @param {Request} req
 * @param {Response} res
 */
exports.getFeeds = function(req, res) {
  User.findById(req.user._id)
    .populate('feeds')
    .exec()
    .then((user) => {
      res.status(200).json(user.feeds);
    });
};

/**
 * PUT /me/feeds
 * Add a feed to a user's list
 * @param {Request} req
 * @param {Response} res
 */
exports.addFeed = function(req, res) {
  let user = req.user;
  let feedId = req.body.id;


  Feed.findById(feedId)
    .then((feed) => {
      if (!feed) {
        throw new Error('no feed found');
      }

      user.feeds.push(feed._id);
      return user.save()
        .then(() => {
          res.status(200).json(feed);
        });
    })
    .catch(() => {
      res.status(400).json({
        errors : {
          id : 'You must supply a valid id'
        }
      });
    });
};