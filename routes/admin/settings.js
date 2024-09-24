const express = require('express')
const router = express.Router()
const { Setting } = require('../../models')
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');


/**
 * 公共方法: 白名单过滤
 * @param req
 * @returns {{name, rank: (number|*)}}
 */
function filterBody(req){
  return {
    name: req.body.name,
    icp: req.body.icp,
    copyright: req.body.copyright
  }
}

// 公共方法,查询当前设置
async function getSetting () {
  const setting = await Setting.findOne()
  if(!setting){
    throw new NotFoundError(`没有系统初始设置,请运行种子文件`)
  }
  return setting
}



// 查询详情
router.get('/', async (req, res) => {
  try {
    const setting = await getSetting()
    success(res,'查询设置成功.',{setting})
  } catch (error) {
    failure(res, error)
  }
})



// 更新
router.put('/', async (req, res) => {
  try {
    const setting = await getSetting()
    const body = filterBody(req)
    await setting.update(body)
    success(res,'update设置成功.',{setting},201)
  } catch (error) {
    failure(res, error)
  }
})


module.exports = router
