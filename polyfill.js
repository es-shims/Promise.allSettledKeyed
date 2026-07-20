'use strict';

var requirePromise = require('./requirePromise');

var implementation = require('./implementation');

/** @type {typeof import('./polyfill')} */
module.exports = function getPolyfill() {
	requirePromise();
	return typeof Promise.allSettledKeyed === 'function' ? Promise.allSettledKeyed : implementation;
};
