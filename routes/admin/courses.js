const express = require('express')
const router = express.Router()

const { Course, Category, User, Chapter } = require('../../models')
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
function filterBody(req){
  return {
    categoryId: req.body.categoryId,
    userId: req.body.userId,
    name: req.body.name,
    image: req.body.image,
    recommended: req.body.recommended,
    introductory: req.body.introductory,
    content: req.body.content
  }
}

// 公共方法,查询当前课程
async function getCourse (req, res) {
  const {id} = req.params
  const condition = getCondition()
  const course = await Course.findByPk(id, condition)
  if(!course){
    throw new NotFoundError(`ID: ${id} Course not found`)
  }
  return course
}

/**
 * 公共方法: 关联分类,用户数据
 * @returns {{include: [{as: string, model, attributes: string[]},{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition () {
  return {
    attributes: {exclude: ['CategoryId', 'UserId']},
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar'],
      }
    ]
  }
}

// 查询课程列表
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
      ...getCondition(),
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: offset,
    }
    if (query.categoryId) {
      condition.where = {
        categoryId: {
          [Op.eq]: query.categoryId
        }
      };
    }

    if (query.userId) {
      condition.where = {
        userId: {
          [Op.eq]: query.userId
        }
      };
    }

    if (query.name) {
      condition.where = {
        name: {
          [Op.like]: `%${ query.name }%`
        }
      };
    }

    if (query.recommended) {
      condition.where = {
        recommended: {
          // 需要转布尔值
          [Op.eq]: query.recommended === 'true'
        }
      };
    }

    if (query.introductory) {
      condition.where = {
        introductory: {
          [Op.eq]: query.introductory === 'true'
        }
      };
    }

    const {count,rows} = await Course.findAndCountAll(condition)
    success(res,'列表查询ok',
      {
        courses: rows,
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

// 查询课程详情
router.get('/:id', async (req, res) => {
  try {
    const course = await getCourse(req)
    success(res,'查询课程详情成功.',{course})
  } catch (error) {
    failure(res, error)
  }
})

// 创建课程
router.post('/', async (req, res) => {
  try {
    const body = filterBody(req)
    const course = await Course.create(body)
    success(res,'创建课程成功.',{course},201)
  } catch (error) {
    failure(res, error)
  }
})

// 更新课程
router.put('/:id', async (req, res) => {
  try {
    const course = await getCourse(req)
    const body = filterBody(req)
    await course.update(body)
    success(res,'update课程成功.',{course},201)
  } catch (error) {
    failure(res, error)
  }
})
// 删除课程
router.delete('/:id', async (req, res) => {
  try {
    const count = await Chapter.count({where:{id:req.params.id}})
    if( count > 0) {
      throw new Error(`当前课程有章节,无法删除`)
    }

    const course = await getCourse(req)
    await course.destroy({})
    success(res,'删除课程成功.',)
  } catch (error) {
    failure(res, error)
  }
})

module.exports = router
