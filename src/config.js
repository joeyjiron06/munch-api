const config = {
  jwtSecret : process.env.jwt_secret,
  port : process.env.port || 8080
};

module.exports = config;