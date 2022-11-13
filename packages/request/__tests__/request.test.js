'use strict';

const { test } = require('..');
const assert = require('assert').strict;

assert.strictEqual(test(), 'Hello from request');
console.info("request tests passed");
