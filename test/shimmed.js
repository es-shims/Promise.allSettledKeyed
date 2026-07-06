'use strict';

require('../auto');

var test = require('tape');
var defineProperties = require('define-properties');

var getPolyfill = require('../polyfill');
var shim = require('../shim');

var runTests = require('./builtin');

test('shimmed', function (t) {
	t.equal(getPolyfill(), Promise.allSettledKeyed, 'getPolyfill() returns the shimmed method once it is present');

	t.test('idempotent shim', { skip: !defineProperties.supportsDescriptors }, function (st) {
		st.equal(shim(), Promise.allSettledKeyed, 'shimming again is a no-op that returns the same method');

		st.end();
	});

	runTests(t);

	t.end();
});
