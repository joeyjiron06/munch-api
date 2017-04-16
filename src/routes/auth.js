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

  if (!User.isValidEmail(email)) {
    res.status(400).json({
      errors : {
        email : 'You must supply a valid email'
      }
    });
  } else {
    const USER_NOT_FOUND = 'USER_NOT_FOUND';
    const INVALID_PASSWORD = 'INVALID_PASSWORD';

    let foundUser;

    User.findOne({email})
      .then((user) => {
        if (!user) {
          throw USER_NOT_FOUND;
        }
        foundUser = user;
        return user.comparePassword(password);
      })
      .then((isValidPassword) => {
        if (!isValidPassword) {
          throw INVALID_PASSWORD;
        }

        res.status(200)
          .cookie('munchtoken', jwt.sign({id:foundUser.id}, process.env.jwt_secret))
          .json({
            id : foundUser.id,
            email : foundUser.email
          });
      })
      .catch((err) => {
        if (err === USER_NOT_FOUND) {
          res.status(400).json({
            errors : {
              user : 'User does not exist',
            }
          });
        } else if (err === INVALID_PASSWORD) {
          res.status(400).json({
            errors : {
              password : 'Invalid password',
            }
          });
        }
      });
  }
};