const express = require('express')
const router = express.Router()

const { Category, Course } = require('../../models')
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
    name: req.body.name,
    rank: req.body.rank
  }
}

// 公共方法,查询当前分类
async function getCategory (req, res) {
  const {id} = req.params
  // const condition = {
  //   include:[
  //     {
  //       model: Course,
  //       as: 'courses'
  //     }
  //   ]
  // }
  // const category = await Category.findByPk(id, condition)
  const category = await Category.findByPk(id)
  if(!category){
    throw new NotFoundError(`ID: ${id} Category not found`)
  }
  return category
}

// 查询分类列表
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
      order: [['rank', 'ASC'], ['id', 'ASC']],
      limit: pageSize,
      offset: offset,
    }
    if(query.name) {
      condition.where = {
        name: {
          [Op.like]: `%${query.name}%`
        }
      }
    }
    const {count,rows} = await Category.findAndCountAll(condition)
    success(res,'列表查询ok',
      {
        categories: rows,
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

// 查询分类详情
router.get('/:id', async (req, res) => {
  try {
    const category = await getCategory(req)
    success(res,'查询分类详情成功.',{category})
  } catch (error) {
    failure(res, error)
  }
})

// 创建分类
router.post('/', async (req, res) => {
  try {
    const body = filterBody(req)
    const category = await Category.create(body)
    success(res,'创建分类成功.',{category},201)
  } catch (error) {
    failure(res, error)
  }
})

// 更新分类
router.put('/:id', async (req, res) => {
  try {
    const category = await getCategory(req)
    const body = filterBody(req)
    await category.update(body)
    success(res,'update分类成功.',{category},201)
  } catch (error) {
    failure(res, error)
  }
})
// 删除分类
router.delete('/:id', async (req, res) => {
  try {
    const count = await Course.count({where:{id:req.params.id}})
    if( count > 0) {
      throw new Error(`当前分类下存在课程,无法删除`)
    }

    const category = await getCategory(req)
    await category.destroy({})
    success(res,'删除分类成功.',)
  } catch (error) {
    failure(res, error)
  }
})

module.exports = router
