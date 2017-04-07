const express = require('express');
const bodyParser = require('body-parser');
const Feed  = require('./src/routes/feed');
const User = require('./src/routes/user');
const cors = require('cors');
const mongoose = require('mongoose');


const PORT = 8080;
const app = express();


mongoose.Promise = Promise;

app.use(cors());// add cors headers to all requests
app.use(bodyParser.json());

app.route('/v1/feed')
  .get(Feed.getFeed);


app.route('/v1/user')
  .post(User.postUser)
  .get(User.getUser)
  .delete(User.deleteUser);

app.route('/v1/user/update/password')
  .post(User.updatePassword);


console.log('listening on port', PORT);

app.listen(PORT);


module.exports = app;
