'use strict';

var callBind = require('call-bind');

var getPolyfill = require('./polyfill');

var requirePromise = require('./requirePromise');

var bound = callBind(getPolyfill());

/** @type {import('.')} */
module.exports = function allSettledKeyed(promises) {
	requirePromise();

	return bound(typeof this === 'undefined' ? Promise : this, promises);
};
