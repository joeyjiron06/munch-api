const chai = require('chai');
const server = require('../../index');

class MunchAPI {

  static get(url, data) {
    return MunchAPI.fetch(url, 'GET', data);
  }

  static post(url, data) {
    return MunchAPI.fetch(url, 'POST', data);
  }

  static del(url, data) {
    return MunchAPI.fetch(url, 'delete', data);
  }

  static fetch(url, method, data) {
    return new Promise((resolve, reject) => {
      let request = chai.request(server);
      method = method.toLowerCase();

      request[method](url)
        .send(data)
        .end((err, res) => {
          if (err) {
            reject(res);
          } else {
            resolve(res);
          }
        });
    });
  }


  static postUser(user) {
    return MunchAPI.post('/v1/user', user);
  }

  static deleteUser(id) {
    return MunchAPI.del('/v1/user', {id});
  }

  static getUser(id) {
    return MunchAPI.get('/v1/user', {id});
  }

  static verifyEmail(email) {
    return MunchAPI.post('/v1/user/decode-email', {email});
  }

  static resetPassword(email) {
    return MunchAPI.post('/v1/user/reset-password', {email});
  }

  static updatePassword(oldPassword, newPassword, id, resetPasswordToken) {
    return MunchAPI.post('/v1/user/update/password', {
      id: id,
      old_password: oldPassword,
      new_password: newPassword,
      reset_password_token: resetPasswordToken
    });
  }

  static authenticate(email, password) {
  return new Promise((resolve, reject) => {
    chai.request(server)
      .post('/v1/authenticate')
      .send({email, password})
      .end((err, res) => {
        if (err) {
          reject(res);
        } else {
          resolve(res);
        }
      });
  });
}
}

module.exports = MunchAPI;
