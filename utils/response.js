// 自定义404 错误类
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';

  }
}

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
  res.status(500).json({
    status: false,
    message: '服务器发生错误',
    errors: [error.message]
  })
}

module.exports = {
  NotFoundError,
  success,
  failure
}