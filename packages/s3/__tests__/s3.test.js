'use strict';

const { init, S3 } = require('..');
const assert = require('assert').strict;

(async () => {
  assert.strictEqual(await init({ duarbdhks: 333333333 }), 'Hello from s3')
  console.info("s3 tests passed")

  const configTokyo = {
    key: 'aaaaaaaaaaaaaaaa',
    secret: 'bbbbbbbbbbbbbbbbb',
    region: 'ap-northeast-1',
    bucket: 'flittotk'
  }
  const s3 = new S3(configTokyo)
  const s3Path = `test/123123.png`
  // const { Body } = await s3.getObject({ s3_path: s3Path })
  // console.log(Body, 'asdfasdfads')
})()
