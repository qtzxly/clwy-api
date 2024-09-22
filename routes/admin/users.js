const express = require('express')
const router = express.Router()

const { User } = require('../../models')
const {Op} = require('sequelize')
const {
  NotFoundError,
  success,
  failure
} = require('../../utils/response')

/**
 * 公共方法: 白名单过滤
 * @param req
 * @returns {{name, rank: (number|*)}}
 */
function filterBody(req) {
  return {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    nickname: req.body.nickname,
    sex: req.body.sex,
    company: req.body.company,
    introduce: req.body.introduce,
    role: req.body.role,
    avatar: req.body.avatar
  };
}

// 公共方法,查询当前用户
async function getUser (req, res) {
  const {id} = req.params
  const user = await User.findByPk(id)
  if(!user){
    throw new NotFoundError(`ID: ${id} User not found`)
  }
  return user
}

// 查询用户列表
router.get('/', async (req, res) => {
  try {
    const query = req.query
    // 分页
    // 第几页
    const currentPage = Math.abs(Number(query.currentPage) || 1)
    // 每页多少条数据
    const pageSize = Math.abs(Number(query.pageSize)||10)
    const offset = (currentPage - 1) * pageSize
    const condition = {
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: offset,
    }
    if (query.email) {
      condition.where = {
        email: {
          [Op.eq]: query.email
        }
      };
    }

    if (query.username) {
      condition.where = {
        username: {
          [Op.eq]: query.username
        }
      };
    }

    if (query.nickname) {
      condition.where = {
        nickname: {
          [Op.like]: `%${ query.nickname }%`
        }
      };
    }

    if (query.role) {
      condition.where = {
        role: {
          [Op.eq]: query.role
        }
      };
    }

    const {count,rows} = await User.findAndCountAll(condition)
    success(res,'列表查询ok',
      {
        users: rows,
        pagination: {
          total: count,
          currentPage: currentPage,
          pageSize: pageSize,
        }
      }
    )
  } catch (error) {
    failure(res, error)
  }
})

// 查询用户详情
router.get('/:id', async (req, res) => {
  try {
    const user = await getUser(req)
    success(res,'查询用户详情成功.',{user})
  } catch (error) {
    failure(res, error)
  }
})

// 创建用户
router.post('/', async (req, res) => {
  try {
    const body = filterBody(req)
    const user = await User.create(body)
    success(res,'创建用户成功.',{user},201)
  } catch (error) {
    failure(res, error)
  }
})

// 更新用户
router.put('/:id', async (req, res) => {
  try {
    const user = await getUser(req)
    const body = filterBody(req)
    await user.update(body)
    success(res,'update用户成功.',{user},201)
  } catch (error) {
    failure(res, error)
  }
})
// 删除用户
// router.delete('/:id', async (req, res) => {
//   try {
//     const user = await getUser(req)
//     await user.destroy({})
//     success(res,'删除用户成功.',)
//   } catch (error) {
//     failure(res, error)
//   }
// })

module.exports = router
