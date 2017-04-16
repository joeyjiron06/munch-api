const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;
const SALT_FACTOR = 10;

const UserSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    validate: {
      validator(email) {
        return isEmail(email);
      },
      message: '{VALUE} is not a valid email address'
    },
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Your password must be at least {MINLENGTH} characters']
  },
});

UserSchema.pre('save', function(next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});


UserSchema.methods.comparePassword = function(candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) {
        reject(err);
      } else {
        resolve(isMatch);
      }
    });
  });
};

/**
 * Verify a password for a specific user
 * Should pass either an id or email
 * @param {object} options
 * @param {string} options.id - the id of the user
 * @param {string} options.email - the email of the user
 * @param {string} password - the password of the user to verify
 */
UserSchema.statics.verifyPassword = function(options, password) {
  let foundUser;

  return this.findUser(options)
    .then(user => {
      foundUser = user;
      return user.comparePassword(password);
    })
    .then(isValidPassword => {
      if (!isValidPassword) {
        throw UserSchema.statics.ERROR.INVALID_PASSWORD;
      }

      return foundUser;
    });
};


/**
 * Find a user. If user is not found then it will throw an appropriate error
 * @param {object} options
 * @param {string} options.id - the id of the user
 * @param {string} options.email - the email of the user
 * @return Promise.<User|UserSchema.statics.ERROR> resolves with a user if found by id or email, or rejects with an error
 */
UserSchema.statics.findUser = function(options) {
  let { id, email } = options;
  let findUser = id ? this.findById(id) : this.findOne({email});

  return findUser
    .then((user) => {
      if (!user && !isEmail(email)) {
        throw UserSchema.statics.ERROR.INVALID_EMAIL;
      } else if (!user) {
        throw UserSchema.statics.ERROR.USER_NOT_FOUND;
      }

      return user;
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        throw UserSchema.statics.ERROR.USER_NOT_FOUND;
      }

      throw err;
    });
};

UserSchema.statics.ERROR = {
  USER_NOT_FOUND : 'USER_NOT_FOUND',
  INVALID_EMAIL : 'INVALID_EMAIL',
  INVALID_PASSWORD : 'INVALID_PASSWORD'
};

module.exports = mongoose.model('User', UserSchema);
