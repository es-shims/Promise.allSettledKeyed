'use strict';

var $TypeError = require('es-errors/type');

/** @type {typeof import('./requirePromise')} */
module.exports = function requirePromise() {
	if (typeof Promise !== 'function') {
		throw new $TypeError('`Promise.allSettledKeyed` requires a global `Promise` be available.');
	}
};
