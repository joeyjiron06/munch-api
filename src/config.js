const fs = require('fs');
const {
  JWT_SECRET,
  NODE_ENV,
  PORT
} = process.env;

const jwtSecret = fs.readFileSync('.jwt.secret').toString();
const emailSecret = fs.readFileSync('.emailpassword.secret').toString();

const config = {
  jwtSecret : JWT_SECRET || jwtSecret,
  port : PORT || 8080,
  nodemailer : {
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: true,
    auth: {
      user: 'joeyjiron06@gmail.com',
      pass: emailSecret
    }
  }
};

if (NODE_ENV === 'test') {
  config.nodemailer = {
    host: 'localhost',
    secure: false,
    ignoreTLS: true,
    port: 1025
  };
}

module.exports = config;