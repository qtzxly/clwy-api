const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const { Op } = require('sequelize');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const crypto = require('crypto');

/**
 * 管理员登录
 * POST /admin/auth/sign_in
 */
router.post('/sign_in', async (req, res) => {
  try {
    // console.log(crypto.randomBytes(16).toString('hex'));
    const {login, password} = req.body;
    if(!login) {
      throw new BadRequestError('邮箱/用户名必填');
    }
    if( !password) {
      throw new BadRequestError('密码必填');
    }

    const condition = {
      where: {
        [Op.or]: [
          {email: login},
          {username: login}
        ]
      }
    }
    const user = await User.findOne(condition)
    if(!user) {
      throw new NotFoundError('用户不存在')
    }
    const isPasswordValid = await bcrypt.compareSync(password, user.password);
    if(!isPasswordValid) {
      throw new UnauthorizedError('密码错误');
    }

    if(user.role !== 100) {
      throw new UnauthorizedError('无权限');
    }

    const token = jwt.sign({
      userId: user.id,
    },process.env.SECERT, {expiresIn: '30d'});
    success(res, '登录成功。', {token});
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;
