'use strict'
const { request } = require('undici')

exports.retryAPI = async (options) => {
  const { url, ...opt } = options
  return request(url, opt)
}

exports.test = () => {
  return 'Hello from request hip hop good'
}
