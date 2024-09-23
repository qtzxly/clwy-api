const express = require('express')
const router = express.Router()

const { Chapter, Course } = require('../../models')
const {Op} = require('sequelize')
const {
  NotFoundError,
  success,
  failure
} = require('../../utils/response')

/**
 * 公共方法：关联课程数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
  return {
    attributes: { exclude: ['CourseId'] },
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name']
      }
    ]
  }
}

/**
 * 公共方法: 白名单过滤
 * @param req
 * @returns {{name, rank: (number|*)}}
 */
function filterBody(req){
  return {
    courseId: req.body.courseId,
    title: req.body.title,
    content: req.body.content,
    video: req.body.video,
    rank: req.body.rank
  }
}

// 公共方法,查询当前章节
async function getChapter (req, res) {
  const {id} = req.params
  const condition = getCondition()
  const chapter = await Chapter.findByPk(id,condition)
  if(!chapter){
    throw new NotFoundError(`ID: ${id} Chapter not found`)
  }
  return chapter
}

// 查询章节列表
router.get('/', async (req, res) => {
  try {
    const query = req.query
    // 分页
    // 第几页
    const currentPage = Math.abs(Number(query.currentPage) || 1)
    // 每页多少条数据
    const pageSize = Math.abs(Number(query.pageSize)||10)
    const offset = (currentPage - 1) * pageSize
    if (!query.courseId) {
      throw new Error('获取章节列表失败，课程ID不能为空。');
    }

    const condition = {
      ...getCondition(),
      order: [['rank', 'ASC'], ['id', 'ASC']],
      limit: pageSize,
      offset: offset
    };

    condition.where = {
      courseId: {
        [Op.eq]: query.courseId
      }
    };

    if (query.title) {
      condition.where = {
        title: {
          [Op.like]: `%${ query.title }%`
        }
      };
    }

    const {count,rows} = await Chapter.findAndCountAll(condition)
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

// 查询章节详情
router.get('/:id', async (req, res) => {
  try {
    const chapter = await getChapter(req)
    success(res,'查询章节详情成功.',{chapter})
  } catch (error) {
    failure(res, error)
  }
})

// 创建章节
router.post('/', async (req, res) => {
  try {
    const body = filterBody(req)
    const chapter = await Chapter.create(body)
    success(res,'创建章节成功.',{chapter},201)
  } catch (error) {
    failure(res, error)
  }
})

// 更新章节
router.put('/:id', async (req, res) => {
  try {
    const chapter = await getChapter(req)
    const body = filterBody(req)
    await chapter.update(body)
    success(res,'update章节成功.',{chapter},201)
  } catch (error) {
    failure(res, error)
  }
})
// 删除章节
router.delete('/:id', async (req, res) => {
  try {


    const chapter = await getChapter(req)
    await chapter.destroy({})
    success(res,'删除章节成功.',)
  } catch (error) {
    failure(res, error)
  }
})

module.exports = router
