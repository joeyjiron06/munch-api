const User = require('../models/user');
const jwt = require('jsonwebtoken');

/**
 * POST /authenticate
 * Authenticates a user and returns a Json web token.
 * @param {Request} req
 * @param {Response} res
 */
exports.postAuthenticate = function(req, res) {
  let { email, password } = req.body;

  User.verify(email, password)
    .then((user) => {
      res.status(200)
        .cookie('munchtoken', jwt.sign({id:user.id}, process.env.jwt_secret))
        .json({
          id : user.id,
          email : user.email
        });
    })
    .catch((err) => {
      let errors = {};

      if (err === User.ERROR.INVALID_EMAIL) {
        errors.email = 'You must supply a valid email';
      } else if (err === User.ERROR.USER_NOT_FOUND) {
        errors.user = 'User does not exist'
      } else if (err === User.ERROR.INVALID_PASSWORD) {
        errors.password = 'Invalid password';
      } else {
        errors.message = 'There was an unknown error authenticating the user';
        console.log('unknown error authing the user', err);
      }

      res.status(400).json({errors});
    });
};