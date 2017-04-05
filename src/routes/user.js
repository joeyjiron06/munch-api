const User = require('../models/user');

/**
 * POST /user
 * Creates a user if one doest not already exist with that username.
 * @param {Request} req
 * @param {Response} res
 */
exports.post = function(req, res) {
  let { email, password } = req.body;

  let user = new User({email, password});

  user.save()
    .then((user) => {
      console.log('got here post save');

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
