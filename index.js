const express = require('express');
const bodyParser = require('body-parser');
const Feed  = require('./src/routes/feed');
const User = require('./src/routes/user');
const Me = require('./src/routes/me');
const Auth = require('./src/routes/auth');
const config = require('./src/config');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();


mongoose.Promise = Promise;

app.use(cors());// add cors headers to all requests
app.use(cookieParser());
app.use(bodyParser.json());

app.route('/v1/feeds')
  .put(Feed.addFeed);

app.route('/v1/feeds/:id')
  .get(Feed.getFeed);

app.route('/v1/user')
  .post(User.postUser)
  .get(User.getUser)
  .delete(Auth.verifyUser, User.deleteUser);

app.route('/v1/user/update/password')
  .post(User.updatePassword);

app.route('/v1/user/reset-password')
  .post(User.resetPassword);

app.route('/v1/user/decode-email')
  .post(User.verifyEmail);

app.route('/v1/authenticate')
  .post(Auth.postAuthenticate);


app.route('/v1/me/feeds')
  .get(Auth.verifyUser, Me.getFeeds)
  .put(Auth.verifyUser, Me.addFeed)
  .delete(Auth.verifyUser, Me.deleteFeed);


console.log('listening on port', config.port);

app.listen(config.port);


module.exports = app;
