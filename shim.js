'use strict';

var requirePromise = require('./requirePromise');

var getPolyfill = require('./polyfill');
var define = require('define-properties');

/** @type {typeof import('./shim')} */
module.exports = function shimAllSettledKeyed() {
	requirePromise();

	var polyfill = getPolyfill();
	define(Promise, { allSettledKeyed: polyfill }, {
		allSettledKeyed: function testAllSettledKeyed() {
			return Promise.allSettledKeyed !== polyfill;
		}
	});
	return polyfill;
};
