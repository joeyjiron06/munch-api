const express = require('express');
const bodyParser = require('body-parser');
const Feeds = require('./src/Feeds');
const User = require('./src/routes/user');
const cors = require('cors');
const mongoose = require('mongoose');


const PORT = 8080;
const app = express();


mongoose.Promise = Promise;

app.use(cors());// add cors headers to all requests
app.use(bodyParser.json());

app.route('/v1/feed')
  .get((req, res) => {
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
  });


app.route('/v1/user')
  .postUser(User.postUser)
  .get(User.getUser)
  .delete(User.deleteUser);


console.log('listening on port', PORT);

app.listen(PORT);


module.exports = app;
