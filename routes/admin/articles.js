const express = require('express')
const router = express.Router()

const { Article } = require('../../models')
const {Op} = require('sequelize')
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');


// 公共方法,过滤白名单
function filterBody(req){
  return {
    title: req.body.title,
    content: req.body.content
  }
}

// 公共方法,查询当前文章
async function getArticle (req, res) {
  const {id} = req.params

  const article = await Article.findByPk(id)

  if(!article){
    throw new NotFoundError(`ID: ${id} Article not found`)
  }
  return article
}

// 查询文章列表
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

    if(query.title) {
      condition.where = {
        title: {
          [Op.like]: `%${query.title}%`
        }
      }
    }

    const {count,rows} = await Article.findAndCountAll(condition)
    // res.json({
    //   status: true,
    //   message: 'Article found successfully.',
    //   data: {
    //     articles: rows,
    //     pagination: {
    //       total: count,
    //       currentPage: currentPage,
    //       pageSize: pageSize,
    //     }
    //   }
    // })
    success(res,'列表查询ok',
      {
        articles: rows,
        pagination: {
          total: count,
          currentPage: currentPage,
          pageSize: pageSize,
        }
      }
    )
  } catch (error) {
    failure(res, error)
    // res.status(500).json({
    //   status: false,
    //   message: 'error',
    //   errors: [error.message]
    // })
  }
  // res.json({message:'123'})
})

// 查询文章详情
router.get('/:id', async (req, res) => {
  try {
    const article = await getArticle(req)
    success(res,'查询文章详情成功.',{article})
    // const { id } = req.params
    // const article = await Article.findByPk(id)
    // if (article) {
    //   res.json({
    //     status: true,
    //     message: '查询文章成功',
    //     data: article
    //   })
    // } else {
    //   res.status(404).json({
    //     status: false,
    //     message: '文章不存在'
    //   })
    // }
  } catch (error) {
    // res.status(500).json({
    //   status: false,
    //   message: '查询文章error',
    //   errors: [error.message]
    // })
    failure(res, error)

  }
  // const {id} = req.params;
  // res.json({id})
})

// 创建文章
router.post('/', async (req, res) => {
  // res.json({
  //     data: req.body
  // })
  try {
    const body = filterBody(req)
    const article = await Article.create(body)
    success(res,'创建文章成功.',{article},201)
    // res.status(201).json({
    //   status: true,
    //   message: '创建成功',
    //   data: article
    // })
  } catch (error) {
    failure(res, error)

    // res.json({error})
    // if(error.name === 'SequelizeValidationError'){
    //   const errors = error.errors.map(error => error.message)
    //   res.status(400).json({
    //     status: false,
    //     message: 'data error',
    //     errors: errors
    //   })
    // } else {
    //   res.status(500).json({
    //     status: false,
    //     message: '创建失败',
    //     errors: [error.message]
    //   })
    // }
  }
})

// 更新文章
router.put('/:id', async (req, res) => {
  try {
    const article = await getArticle(req)
    // const { id } = req.params
    // const article = await Article.findByPk(id)
    const body = filterBody(req)

    // if (article) {
    await article.update(body)
    success(res,'update文章成功.',{article},201)
    // res.json({
    //   status: true,
    //   message: 'update成功',
    //   data: article
    // })
    // } else {
    //   res.status(404).json({
    //     status: false,
    //     message: '文章不存在'
    //   })
    // }
  } catch (error) {
    // res.status(500).json({
    //   status: false,
    //   message: 'update失败',
    //   errors: [error.message]
    // })
    failure(res, error)

  }
})

// 删除文章
router.delete('/:id', async (req, res) => {
  try {
    const article = await getArticle(req)
    // const { id } = req.params
    // const article = await Article.findByPk(id)
    // if (article) {
    await article.destroy({})
    success(res,'删除文章成功.',)
      // res.json({
      //   status: true,
      //   message: '删除成功'
      // })
    // } else {
    //   res.status(404).json({
    //     status: false,
    //     message: '文章不存在'
    //   })
    // }
  } catch (error) {
    // res.status(500).json({
    //   status: false,
    //   message: '删除失败',
    //   errors: [error.message]
    // })
    failure(res, error)

  }
})

module.exports = router
