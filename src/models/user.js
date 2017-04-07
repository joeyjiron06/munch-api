const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
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

  if (!this.isModified('password')) {
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

module.exports = mongoose.model('User', UserSchema);
