const chai = require('chai');
const server = require('../../index');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);



describe('User', () => {
  describe('POST /user', () => {
    // todo expect content-type json, ex expect(res).to.have.header('content-type', 'text/plain');

    function postUser(user, callback) {
      chai.request(server)
        .post('/v1/user')
        .send(user)
        .end(callback);
    }


    // + no email
    it('should return 400 when no email is supplied', (done) => {
      postUser({'password': 'hello'}, (err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          message : 'email required'
        });
        done();
      });
    });

    // + no password
    it('should return 400 when no password is supplied', (done) => {
      postUser({email: 'joey'}, (err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          message : 'password required'
        });
        done();
      });
    });

    it('should return 400 when no body is supplied', (done) => {
      postUser(null, (err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          message : 'you must send a body'
        });
        done();
      });

    });

    // - email already taken
    it('should return 409 when email is already taken', (done) => {
      let user = {username:'joey-test', password:'testpwd'};
      postUser(user, (err, res) => {
        if (err) {
          console.error('first user creation errored');
          throw err;
        }

        postUser(user, (err, res) => {
          expect(res).to.have.status(409);
          expect(res.body).to.deep.equal({
            message : 'username already taken'
          });

          done();
        });
      });
    });

    // - email not in email format
    // - password too short
    // - success

  });
});