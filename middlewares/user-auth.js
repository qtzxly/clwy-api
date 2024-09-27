const jwt = require('jsonwebtoken');
const {User} = require('../models');
const {UnauthorizedError} = require('../utils/errors');
const {success, failure} = require('../utils/responses');
module.exports = async (req, res, next) => {
  try {
    // /
    const {token } = req.headers;
    if(!token) {
      throw new UnauthorizedError('当前接口需要认证才能访问');
    }
    const decoded = jwt.verify(token, process.env.SECERT);
    const { userId } = decoded;

    req.userId = userId;
    next()
  } catch (error) {
    failure(res, error);
  }
}