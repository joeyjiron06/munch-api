const Feeds = require('../Feeds');
const Feed = require('../models/feed');

const FEED_NOT_FOUND = 'FEED_NOT_FOUND';
const FEED_HTTP_ERROR = 'FEED_HTTP_ERROR';

/**
 * GET /feed
 * Parse a feed given a url
 * @param {Request} req
 * @param {Response} res
 */
exports.getFeed = function(req, res) {
  let {id} = req.params;

  Feed.findById(id)
    .then((feed) => {
      if (!feed) {
        throw new Error('not found');
      }

      res.status(200).json(feed.toJSON());
    })
    .catch(() => {
      res.status(400).json({
        errors : {
          id : 'You must supply a valid id'
        }
      });
    });
};

/**
 * PUT /feeds
 * Add a feed
 * @param req
 * @param res
 */
exports.addFeed = function(req, res) {
  let {title, url} = req.body;
  let feed = new Feed({title, url});


  feed.save()
    .then((feed) => {
      res.status(200).json(feed);
    })
    .catch((err) => {
      if (err.code === 11000) {
        Feed.findOne({url})
          .then((feed) => {

            res.status(400).json({
              feed : feed.toJSON(),
              errors : {
                url : 'Url is already taken'
              }
            });
          })
          .catch((err) => {
            res.status(400).json({
              feed : feed.toJSON(),
              errors : {
                url : 'Url is already taken'
              }
            });
          });

      } else if (err.errors.title) {
        res.status(400).json({
          errors : {
            title : 'You must post a valid title'
          }
        });
      } else if (err.errors.url) {
        res.status(400).json({
          errors : {
            url : 'You must post a valid url'
          }
        });
      }
    });
};

/**
 * GET /feeds/:id/articles
 * Get the current articles of a certain feed
 * @param req
 * @param res
 */
exports.getArticles = function(req, res) {
  let {id} = req.params;

  let foundFeed;

  return Feed.findById(id)
    .catch(() => {
      throw FEED_NOT_FOUND;
    })
    .then((feed) => {
      foundFeed = feed;
      return Feeds.fetch(feed.url);
    })
    .then((feed) => {
      foundFeed = foundFeed.toJSON();
      foundFeed.articles = feed.items;

      res.status(200).json(foundFeed);
    })
    .catch((err) => {
      if (err === FEED_NOT_FOUND) {
        res.status(400).json({
          errors : {
            id : 'You must supply a valid id'
          }
        });
      } else {
        res.status(400).json({
          errors : {
            feed : 'Error fetching your feed'
          }
        });
      }
    });
};