const express = require('express');
const router = express.Router();
const { Course,Like,User } = require('../models');
const { success, failure } = require('../utils/responses');
const { NotFoundError } = require('../utils/errors');

/**
 *  点赞,取消赞
 * post /likes
 */
router.post('/', async function (req, res, next) {
  try {
    const userId = req.userId
    const { courseId }= req.body;
    const course = await Course.findByPk(courseId)

    if(!course){
      throw new NotFoundError('课程不存在')
    }

    const like = await Like.findOne({
      where:{
        courseId:courseId,
        userId:userId
      }
    })

    //  如果没有点赞,那就新增, 并且课程 likesCount + 1
    if(!like){
      await Like.create({courseId:courseId, userId:userId})
      await course.increment('likesCount')
      success(res, '点赞成功。');
    } else {
      // 点赞过, 删除, likesCount - 1
      await like.destroy()
      await course.decrement('likesCount')
      success(res, '取消点赞成功。');
    }
  } catch (error) {
    failure(res, error);
  }
});

// 查询用户点赞课程
router.get('/', async function (req, res, next) {
  try{
    // const course = await Course.findByPk(1,{
    //   include: {
    //     model: User,
    //     as: 'likeUsers'
    //   }
    // })
    // success(res,'查询当前课程点赞用户成功', course);

    // const user = await User.findByPk(req.userId,{
    //   include: {
    //     model: Course,
    //     as: 'likeCourses',
    //     // limit:'' // 加上分页参数会报错
    //   }
    // })
    // success(res,'查询用户点赞课程成功', user);

    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize
    // 查询当前用户
    const user = await User.findByPk(req.userId)
    // 查询用户点赞课程 , getLikeCourses 来自模型中定义的as:likeCourses, 详情见官方文档
    const courses = await user.getLikeCourses({
      joinTableAttributes:[], // 不查询关联表
      attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: offset
    })
    // 用户点赞的课程总数
    const count  = await user.countLikeCourses()
    success(res, '查询用户点赞课程成功', {
      courses,
      pagination: {
        total: count,
        currentPage,
        pageSize,
      }
    })
  }catch(error){
    failure(res, error);
  }
})

module.exports = router;
