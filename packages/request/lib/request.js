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

exports.test3 = () => {
  return '3333333333333333333'
}
