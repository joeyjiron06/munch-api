/**
 * POST /user
 * Creates a user if one doest not already exist with that username.
 * @param {Request} req
 * @param {Response} res
 */
exports.postUser = function(req, res) {
  let { email, password } = req.body;

  if (!email && !password) {
    res.status(400).json({
      message : 'you must send a body'
    });
  } else if (!email) {
    res.status(400).json({
      message : 'email required'
    });
  } else if (!password) {
    res.status(400).json({
      message : 'password required'
    });
  } else {
    res.json(req.body);
  }
};
