'use strict';

var Call = require('es-abstract/2025/Call');
var GetPromiseResolve = require('es-abstract/2025/GetPromiseResolve');
var NewPromiseCapability = require('es-abstract/2025/NewPromiseCapability');

var isObject = require('es-abstract/helpers/isObject');

var $TypeError = require('es-errors/type');

var PerformPromiseAllKeyed = require('./aos/PerformPromiseAllKeyed');

/** @import { PromiseCapability } from './aos/PerformPromiseAllKeyed' */

// https://tc39.es/proposal-await-dictionary/#sec-promise.allsettledkeyed
/** @type {import('./implementation')} */
module.exports = function allSettledKeyed(promises) {
	var ctor = this; // step 1

	/** @typedef {typeof this} C */
	/** @typedef {keyof typeof promises} K */
	/** @template {K} Key @typedef {Awaited<(typeof promises)[Key]>} V */

	/** @type {PromiseCapability<C, { [k in K]: PromiseSettledResult<V<k>> }>} */
	var promiseCapability = NewPromiseCapability(ctor); // step 2

	try {
		var promiseResolve = GetPromiseResolve(ctor); // step 3

		if (!isObject(promises)) { // step 5
			throw new $TypeError('`promises` must be an object');
		}

		PerformPromiseAllKeyed(
			'~ALL-SETTLED~',
			promises,
			ctor,
			promiseCapability,
			promiseResolve
		); // step 6
	} catch (error) { // steps 4, 7 (IfAbruptRejectPromise)
		Call(promiseCapability['[[Reject]]'], void undefined, [error]);
	}

	return promiseCapability['[[Promise]]']; // step 8
};
