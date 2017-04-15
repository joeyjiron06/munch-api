const User = require('../models/user');

/**
 * POST /authenticate
 * Authenticates a user and returns a Json web token.
 * @param {Request} req
 * @param {Response} res
 */
exports.postAuthenticate = function(req, res) {
  let { email } = req.body;

  if (!User.isValidEmail(email)) {
    res.status(400).json({
      errors : {
        email : 'You must supply a valid email'
      }
    });
  } else {
    res.status(400).json({
      errors : {
        user : 'User does not exist'
      }
    });
  }
};