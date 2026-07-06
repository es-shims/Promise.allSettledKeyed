'use strict';

var test = require('tape');
var callBind = require('call-bind');

var implementation = require('../implementation');
var runTests = require('./tests');

var bound = callBind.apply(implementation);

var rebindable = function allSettledKeyed(promises) { // eslint-disable-line no-unused-vars
	return bound(typeof this === 'undefined' ? Promise : this, arguments);
};

test('as a function', function (t) {
	t.test('bad Promise/this value', function (st) {
		// eslint-disable-next-line no-useless-call
		st['throws'](function () { implementation.call(undefined, {}); }, TypeError, 'undefined is not a constructor');

		// eslint-disable-next-line no-useless-call
		st['throws'](function () { implementation.call(null, {}); }, TypeError, 'null is not a constructor');

		st.end();
	});

	runTests(rebindable, t);

	t.end();
});
