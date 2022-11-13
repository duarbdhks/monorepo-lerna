'use strict';
const { test, retryAPI } = require('@duarbdhks/request')

exports.init = async (config) => {
  console.log(config, 'duarbdhks 111111111')
  const content = 'Hello from request'
  const result = await retryAPI({ url: `https://www.flitto.com/api/1.2/util/detect/text?content=${content}`, method: 'GET' })
  console.log(result, 'duarbdhks 2222222')
  return "Hello from s3";
}
