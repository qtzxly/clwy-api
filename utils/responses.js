

// 请求成功
function success(res, message, data= {}, code=200) {
  res.status(code).json({
    status:true,
    message,
    data
  })
}

// 请求失败
function failure(res, error) {
  if(error.name === 'SequelizeValidationError'){
    const errors = error.errors.map(e => e.message)
    return res.status(400).json({
      status: false,
      message: '参数错误',
      errors
    })
  }
  if(error.name === 'NotFoundError') {
    return res.status(400).json({
      status: false,
      message: '资源不存在',
      errors: [error.message]
    })
  }

  if (error.name === 'BadRequestError') {
    return res.status(400).json({
      status: false,
      message: '请求参数错误',
      errors: [error.message]
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: false,
      message: '认证失败',
      errors: [error.message]
    });
  }

  res.status(500).json({
    status: false,
    message: '服务器发生错误',
    errors: [error.message]
  })
}

module.exports = {
  success,
  failure
}