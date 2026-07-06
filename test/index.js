'use strict';

var index = require('../');
var test = require('tape');
var runTests = require('./tests');

test('as a function (index)', function (t) {
	t.test('bad Promise/this value', function (st) {
		// for convenience, the main export explicitly turns `undefined` into `Promise`

		// eslint-disable-next-line no-useless-call
		st['throws'](function () { index.call(null, {}); }, TypeError, 'null is not a constructor');

		st.end();
	});

	runTests(index, t);

	t.end();
});
