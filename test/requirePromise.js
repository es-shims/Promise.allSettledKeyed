'use strict';

var test = require('tape');

var requirePromise = require('../requirePromise');

var globals = typeof globalThis === 'undefined' ? global : globalThis;

test('requirePromise', function (t) {
	t.doesNotThrow(function () { requirePromise(); }, 'does not throw when a global `Promise` is available');

	var OriginalPromise = globals.Promise;
	try {
		globals.Promise = undefined;
		t['throws'](function () { requirePromise(); }, TypeError, 'throws a TypeError when no global `Promise` is available');
	} finally {
		globals.Promise = OriginalPromise;
	}

	t.end();
});
