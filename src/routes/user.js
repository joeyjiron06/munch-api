const User = require('../models/user');

/**
 * POST /user
 * Creates a user if one doest not already exist with that username.
 * @param {Request} req
 * @param {Response} res
 */
exports.postUser = function(req, res) {
  let { email, password } = req.body;

  let user = new User({email, password});

  user.save()
    .then((user) => {
      res.status(200).json({
        id : user._id,
        email
      })
    })
    .catch((error) => {
      if (error.code === 11000) {
        let errors = { email : { message : `Email '${email}' is already taken`} };
        res.status(409).json({errors});
      } else {
        let { errors } = error;

        Object.keys(errors).forEach((key) => {
          let message = errors[key].message;
          errors[key] = { message };
        });

        res.status(400).json({errors});
      }
    });
};

/**
 * DELETE /user
 * Deletes a user
 * @param {Request} req
 * @param {Response} res
 */
exports.deleteUser = function(req, res) {
  let { id } = req.body;

  if (!id) {
    res.status(400).json({
      errors : {id: {message:'An id is required. Please send a json like follows {"id":"myUserId"}'}}
    });
  } else {
    User.remove({_id:id})
      .then(() => {
        res.status(200).json({});
      })
      .catch(() => {
        res.status(400).json({
          errors : {id: {message:'A valid id is required. Please send a json like follows {"id":"myUserId"}'}}
        });
      });
  }
};

/**
 * GET /user
 * Gets a user
 * @param {Request} req
 * @param {Response} res
 */
exports.getUser = function(req, res) {
  let { id } = req.body;

  User.findOne({_id:id})
    .then((user) => {
      res.status(200).json({
        id : user._id,
        email : user.email
      });
    })
    .catch((err) => {
      res.status(400).json({
        errors : {
          id : {message : 'User not found'}
        }
      });
    });
};

/**
 * POST /user/update/password
 * Gets a user
 * @param {Request} req
 * @param {Response} res
 */
exports.updatePassword = function(req, res) {

  let { old_password, new_password, id } = req.body;

  User.findOne({_id:id})
    .then((user) => {
      return user.comparePassword(old_password).then((isPasswordMatch) => { return {user, isPasswordMatch}; });
    })
    .then((res) => {
      let {isPasswordMatch, user} = res;
      if (isPasswordMatch) {
        user.password = new_password;
        return user.save();
      } else {
        return Promise.reject({kind:'WRONG_PASS'});
      }
    })
    .then((user) => {
      res.status(200).json({
        id: user._id,
        email: user.email
      });
    })
    .catch((err) => {
      if (err.kind === 'WRONG_PASS') {
        res.status(400).json({
          errors : {old_password : {message : 'Your new password is invalid'}}
        });
      } else if (err.kind === 'ObjectId') {
        res.status(400).json({
          errors : {id: {message : 'User not found'}}
        });
      } else {
        res.status(400).json({
          errors : {new_password : {message : err.errors.password.message}}
        });
      }
    });
};