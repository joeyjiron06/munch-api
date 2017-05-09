const User = require('../models/user');
const Emailer = require('../utils/emailer');
const jwt = require('../utils/jwt');
const ERROR_MESSAGES = require('../utils/error-messages');

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
    .catch((err) => {
      let errors = {};
      let status = 400;

      if (err.code === 11000) {
        status = 409;
        errors.email = ERROR_MESSAGES.EMAIL_TAKEN;
      } else {
        if (err.errors.email) {
          errors.email = ERROR_MESSAGES.INVALID_EMAIL;
        }

        if (err.errors.password) {
          errors.password = ERROR_MESSAGES.INVALID_PASSWORD;
        }
      }

      res.status(status).json({errors});
    });
};

/**
 * POST /user/update/password
 * Gets a user
 * @param {Request} req
 * @param {Response} res
 */
exports.updatePassword = function(req, res) {

  let { id,
        old_password,
        new_password,
        reset_password_token } = req.body;

  let verify;

  if (reset_password_token) {
    let user = jwt.decode(reset_password_token);
    verify = User.findUser({id:user.id});
  } else {
    verify = User.verifyPassword({id}, old_password);
  }

  verify
    .then((user) => {
      user.password = new_password;
      return user.save();
    })
    .then((user) => {
      res.status(200).json({
        id: user._id,
        email: user.email
      });
    })
    .catch((err) => {
      let errors = {};

      if (err === User.ERROR.INVALID_PASSWORD) {
        errors.old_password = ERROR_MESSAGES.INVALID_OLD_PASSWORD;
      } else if (err === User.ERROR.USER_NOT_FOUND) {
        errors.id = ERROR_MESSAGES.USER_NOT_EXISTS;
      } else {
        errors.new_password = ERROR_MESSAGES.INVALID_PASSWORD;
      }

      res.status(400).json({errors});
    });
};

/**
 * POST /user/decode-email
 * Gets a user
 * @param {Request} req
 * @param {Response} res
 */
exports.verifyEmail = function(req, res) {
  let { email } = req.body;

  User.findOne({email})
    .then((user) => {
      res.status(200).json({
        isEmailAvailable: !user
      });
    })
    .catch((err) => {
      console.log('SHOULD NOT GET HERE in verifyEmail');
      res.status(200).json({
        isEmailAvailable:true
      });
    });
};

/**
 * POST /user/reset-password
 * Send an email to the user with an email link to reset password
 * @param {Request} req
 * @param {Response} res
 */
exports.resetPassword = function(req, res) {
  let { email } = req.body;

  User.findUser({email})
    .then((user) => {
      let token = jwt.encode({id:user.id});

      Emailer.sendEmail({
        from : '"Joey Jiron" <test@test.com>', // TODO add the right email
        to : user.email,
        subject : 'Munch password reset',
        html: `<p>We heard that you lost your Munch password. Sorry about that!</p> 
          <p>But don’t worry! You can use the following link within the next day to reset your password:</p>
          <p>https://munch.com/password_reset/${token}</p>
          <p>If you don’t use this link within 24 hours, it will expire. To get a new password reset link, visit https://munch.com/password_reset</p>
          <p>Thanks, <br>
            Your friends at GitHub
          </p>
        `
      });


      res.status(200).json({
        id : user.id,
        email : user.email,
        token : token,
        message:'Password has been reset and email was sent.'
      })
    })
    .catch((err) => {
      let errors = {};

      if (err === User.ERROR.USER_NOT_FOUND) {
        errors.user = 'User not found';
      } else {
        errors.email = 'A valid email is required';
      }

      res.status(400).json({errors});
    });
};