
const nodemailer = require('nodemailer');
const testConfig = {
  host: 'localhost',
  secure: false,
  ignoreTLS: true,
  port: 1025
};

const prodConfig = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  secure: true,
  auth: {
    user: 'joeyjiron06@gmail.com',
    pass: 'frosty6frosty6'
  }
};


let transporter = nodemailer.createTransport(testConfig);

/**
 * @param {object} email
 * @param {string} email.from - who to send it from
 * @param {string} email.to - who to send it to
 * @param {string} email.subject - the subject of the email
 * @param {string} [email.text] - the body text of the email
 * @param {string} [email.html] - the body text of the email as HTML
 */
exports.sendEmail = function(email) {
  transporter.sendMail(email, (err) => {
    if (err) {
      console.error('error sending email', email, err);
    }
  });
};