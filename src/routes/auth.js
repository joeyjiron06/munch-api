
/**
 * POST /authenticate
 * Authenticates a user and returns a Json web token.
 * @param {Request} req
 * @param {Response} res
 */
exports.postAuthenticate = function(req, res) {
  res.status(400).json({
    errors : {
      user : 'User does not exist'
    }
  });
};