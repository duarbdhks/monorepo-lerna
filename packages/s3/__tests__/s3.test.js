'use strict';

const { init } = require('..');
const assert = require('assert').strict;

(async () => {
  assert.strictEqual(await init({ duarbdhks: 333333333 }), 'Hello from s3');
  console.info("s3 tests passed");
})()
