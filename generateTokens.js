const jwt = require('jsonwebtoken');
const User = require('./models/userModel.js');
const { GraphQLError } = require('graphql');

const genAccessTokenToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


module.exports = genAccessTokenToken;