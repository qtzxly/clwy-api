const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { success, failure } = require('../utils/responses');
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../utils/errors");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");

/**
 * 用户注册
 * POST /auth/sign_up
 */
router.post('/sign_up', async function (req, res) {
  try {
    const body = {
      email: req.body.email,
      username: req.body.username,
      nickname: req.body.nickname,
      password: req.body.password,
      sex: 2,
      role: 0
    }

    const user = await User.create(body);
    delete user.dataValues.password;
    success(res, '创建用户成功。', { user }, 201);
  } catch (error) {
    failure(res, error);
  }
});

/**
 * user登录
 * POST /auth/sign_in
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

    const token = jwt.sign({
      userId: user.id,
    },process.env.SECERT, {expiresIn: '30d'});
    success(res, '登录成功。', {token});
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;
