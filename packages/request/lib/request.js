'use strict'
const { request } = require('undici')

exports.retryAPI = async (options) => {
  const { url, ...opt } = options
  return request(url, opt)
}

exports.test = () => {
  return 'Hello from request hip hop good'
}

exports.test2 = () => {
  return '22222222222222222222'
}

exports.test6 = () => {
  return '666666666666666'
}
