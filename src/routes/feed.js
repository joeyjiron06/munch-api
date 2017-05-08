const Feeds = require('../Feeds');
const Feed = require('../models/feed');

/**
 * GET /feed
 * Parse a feed given a url
 * @param {Request} req
 * @param {Response} res
 */
exports.getFeed = function(req, res) {
  if (req.query.url) {
    Feeds.fetch(req.query.url)
      .then((feed) => {
        res.status(200)
          .json(feed);
      })
      .catch((response) => {
        res.status(400).json({
          url : req.query.url,
          message : 'invalid url'
        })
      });

  } else {
    res.status(400).json({
      message : 'You must specify a feed url'
    })
  }
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
