const express = require('express');
const router = express.Router();

const {Article} = require('../../models');

// 查询文章列表
router.get('/', async (req, res) => {
    try{
        const condition = {
            order:[['id', 'DESC']],
        }
        const articles = await Article.findAll(condition);
        res.json({
            status: true,
            message: 'Article found successfully.',
            data:{
                articles: articles
            }
        });
    }catch(error){
        res.status(500).json({
            status: false,
            message:'error',
            errors: [error.message]
        });
    }
    // res.json({message:'123'})
});

// 查询文章详情
router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const article = await Article.findByPk(id)
        if(article){
            res.json({
                status: true,
                message: '查询文章成功',
                data: article
            });
        }else{
            res.status(404).json({
                status: false,
                message:'文章不存在',
            })
        }

    }catch(error){
        res.status(500).json({
            status: false,
            message:'查询文章error',
            errors: [error.message]
        })
    }
    // const {id} = req.params;
    // res.json({id})
})

module.exports = router;