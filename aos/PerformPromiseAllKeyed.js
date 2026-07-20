'use strict';

var Call = require('es-abstract/2025/Call');
var Get = require('es-abstract/2025/Get');
var Invoke = require('es-abstract/2025/Invoke');

var $TypeError = require('es-errors/type');
var callBound = require('call-bound');
var ownKeys = require('own-keys');

var CreateKeyedPromiseCombinatorResultObject = require('./CreateKeyedPromiseCombinatorResultObject');

var $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

/** @import { Entry, Variant } from './PerformPromiseAllKeyed' */

// https://tc39.es/proposal-await-dictionary/#sec-performpromiseallkeyed

/** @type {typeof import('./PerformPromiseAllKeyed')} */
module.exports = function PerformPromiseAllKeyed(
	variant,
	promises,
	ctor,
	resultCapability,
	promiseResolve
) {
	if (variant !== '~ALL~' && variant !== '~ALL-SETTLED~') {
		throw new $TypeError('Assertion failed: `variant` must be ~ALL~ or ~ALL-SETTLED~');
	}

	/** @typedef {keyof typeof promises} K */
	/** @typedef {Awaited<(typeof promises)[K]>} T */

	var allKeys = ownKeys(promises); // step 1

	/** @type {Entry<K, T, Variant>[]} */
	var entries = []; // step 2

	var remainingElementsCount = { '[[Value]]': 1 }; // step 3

	var index = 0; // step 4

	for (var i = 0; i < allKeys.length; i += 1) { // step 5
		var key = allKeys[i];

		/* eslint no-loop-func: 0, no-inner-declarations: 0 */

		if ($isEnumerable(promises, key)) { // step 5.a, 5.b
			var propertyValue = Get(promises, key); // step 5.b.i

			entries[entries.length] = { '[[Key]]': key, '[[Value]]': void undefined }; // step 5.b.ii

			var nextPromise = Call(promiseResolve, ctor, [propertyValue]); // step 5.b.iii

			(
				/**
				 * @param {number} thisIndex
				 * @param {{ '[[Value]]': boolean }} alreadyCalled
				 * @param {Promise<T>} promise
				 */
				function (thisIndex, alreadyCalled, promise) { // step 5.b.iv
					/** @param {T} value */
					function onFulfilled(value) { // steps 5.b.v - 5.b.viii
						if (alreadyCalled['[[Value]]']) {
							return void undefined; // step 5.b.v.2
						}

						alreadyCalled['[[Value]]'] = true; // step 5.b.v.3

						if (variant === '~ALL~') { // step 5.b.v.5
							entries[thisIndex]['[[Value]]'] = value; // step 5.b.v.5.a
						} else { // step 5.b.v.6
							if (variant !== '~ALL-SETTLED~') {
								throw new $TypeError('Assertion failed: variant is not ~ALL-SETTLED~'); // step 5.b.v.6.a
							}

							entries[thisIndex]['[[Value]]'] = {
								status: 'fulfilled',
								value: value
							}; // steps 5.b.v.6.b - 5.b.v.6.e
						}

						remainingElementsCount['[[Value]]'] -= 1; // step 5.b.v.7

						if (remainingElementsCount['[[Value]]'] === 0) {
							var result = CreateKeyedPromiseCombinatorResultObject(entries); // step 5.b.v.8.a

							return Call(resultCapability['[[Resolve]]'], void undefined, [result]); // step 5.b.v.8.b
						}

						return void undefined; // step 5.b.v.9
					}

					var onRejected;
					if (variant === '~ALL~') { // step 5.b.ix
						onRejected = resultCapability['[[Reject]]']; // step 5.b.ix.1
					} else { // step 5.b.x
						if (variant !== '~ALL-SETTLED~') {
							throw new $TypeError('Assertion failed: variant is not ~ALL-SETTLED~'); // step 5.b.x.1
						}

						// eslint-disable-next-line no-shadow
						onRejected = /** @param {unknown} error */ function onRejected(error) { // steps 5.b.x.2 - 5.b.x.5
							if (alreadyCalled['[[Value]]']) {
								return void undefined; // step 5.b.x.2.b
							}

							alreadyCalled['[[Value]]'] = true; // step 5.b.x.2.c

							entries[thisIndex]['[[Value]]'] = {
								status: 'rejected',
								reason: error
							}; // step 5.b.x.2.d - 5.b.x.2.h

							remainingElementsCount['[[Value]]'] -= 1; // step 5.b.x.2.i

							if (remainingElementsCount['[[Value]]'] === 0) { // step 5.b.x.2.j
								var result = CreateKeyedPromiseCombinatorResultObject(entries); // step 5.b.x.2.j.i

								return Call(resultCapability['[[Resolve]]'], void undefined, [result]); // step 5.b.x.2.j.ii
							}

							return void undefined; // step 5.b.x.2.k
						};
					}

					remainingElementsCount['[[Value]]'] += 1; // step 5.b.xi

					Invoke(promise, 'then', [onFulfilled, onRejected]); // step 5.b.xii
				}(index, { '[[Value]]': false }, nextPromise)
			);

			index += 1; // step 5.b.xiii
		}
	}

	remainingElementsCount['[[Value]]'] -= 1; // step 6
	if (remainingElementsCount['[[Value]]'] === 0) { // step 7
		var result = CreateKeyedPromiseCombinatorResultObject(entries); // step 7.b

		Call(resultCapability['[[Resolve]]'], void undefined, [result]); // step 7.c
	}

	return resultCapability['[[Promise]]']; // step 8
};
