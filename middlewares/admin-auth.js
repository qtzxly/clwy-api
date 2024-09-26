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
    const user = await User.findByPk(userId)
    if(!user) {
      throw new UnauthorizedError('用户不存在')
    }
    if( user.role !== 100) {
      throw new UnauthorizedError('没有管理员权限')
    }
    req.user = user;
    next()
  } catch (error) {
    failure(res, error);
  }
}