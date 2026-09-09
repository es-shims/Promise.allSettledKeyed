'use strict';

var test = require('tape');
var functionsHaveConfigurableNames = require('functions-have-names').functionsHaveConfigurableNames();

var PerformPromiseAllKeyed = require('../aos/PerformPromiseAllKeyed');

var makeCapability = function () {
	var capability = {};
	capability['[[Promise]]'] = new Promise(function (resolve, reject) {
		capability['[[Resolve]]'] = resolve;
		capability['[[Reject]]'] = reject;
	});
	return capability;
};

var promiseResolve = function (value) {
	return Promise.resolve(value);
};

test('PerformPromiseAllKeyed', function (t) {
	if (typeof Promise !== 'function') {
		t.skip('No global Promise detected');
		return t.end();
	}

	t.test('an unknown variant is an assertion failure', function (st) {
		st['throws'](
			function () { PerformPromiseAllKeyed('~INVALID~', {}, Promise, makeCapability(), promiseResolve); },
			TypeError,
			'throws a TypeError for a variant other than `all` or `all-settled`'
		);

		st.end();
	});

	t.test('the ~all~ variant resolves each value under its key', function (st) {
		st.plan(1);

		var capability = makeCapability();
		PerformPromiseAllKeyed('~ALL~', { a: Promise.resolve(1), b: 2 }, Promise, capability, promiseResolve);

		capability['[[Promise]]'].then(function (result) {
			st.deepEqual({ a: result.a, b: result.b }, { a: 1, b: 2 }, 'each value is resolved under its key');
		}, st.fail);
	});

	t.test('the ~all-settled~ variant records settlement results', function (st) {
		st.plan(1);

		var sentinel = { sentinel: true };
		var capability = makeCapability();
		PerformPromiseAllKeyed(
			'~ALL-SETTLED~',
			{ a: Promise.resolve(1), b: Promise.reject(sentinel) },
			Promise,
			capability,
			promiseResolve
		);

		capability['[[Promise]]'].then(function (result) {
			st.deepEqual(
				{ a: result.a, b: result.b },
				{ a: { status: 'fulfilled', value: 1 }, b: { status: 'rejected', reason: sentinel } },
				'fulfilled and rejected inputs are recorded as settlement results'
			);
		}, st.fail);
	});

	t.test('the settlement element functions have the shape of a built-in', function (st) {
		var capture = function (variant) {
			var captured = [];
			var thenable = function () {
				return {
					then: function (onFulfilled, onRejected) {
						captured.push({ onFulfilled: onFulfilled, onRejected: onRejected });
					}
				};
			};

			PerformPromiseAllKeyed(
				variant,
				{ a: thenable(), b: thenable() },
				Promise,
				makeCapability(),
				function (value) { return value; }
			);

			return captured;
		};

		var expectedShape = {
			configurable: functionsHaveConfigurableNames,
			enumerable: false,
			value: '',
			writable: false
		};

		var all = capture('~ALL~');
		st.deepEqual(
			Object.getOwnPropertyDescriptor(all[0].onFulfilled, 'name'),
			expectedShape,
			'~ALL~ onFulfilled has an empty `name`, per CreateBuiltinFunction(fulfilledSteps, 1, "")'
		);
		st.equal(all[0].onFulfilled.length, 1, '~ALL~ onFulfilled has a `length` of 1');
		st.notEqual(all[0].onFulfilled, all[1].onFulfilled, '~ALL~ each key gets a distinct onFulfilled');

		var allSettled = capture('~ALL-SETTLED~');
		st.deepEqual(
			Object.getOwnPropertyDescriptor(allSettled[0].onFulfilled, 'name'),
			expectedShape,
			'~ALL-SETTLED~ onFulfilled has an empty `name`'
		);
		st.deepEqual(
			Object.getOwnPropertyDescriptor(allSettled[0].onRejected, 'name'),
			expectedShape,
			'~ALL-SETTLED~ onRejected has an empty `name`'
		);
		st.equal(allSettled[0].onRejected.length, 1, '~ALL-SETTLED~ onRejected has a `length` of 1');
		st.notEqual(allSettled[0].onFulfilled, allSettled[0].onRejected, '~ALL-SETTLED~ onFulfilled and onRejected differ');
		st.notEqual(allSettled[0].onRejected, allSettled[1].onRejected, '~ALL-SETTLED~ each key gets a distinct onRejected');

		st.end();
	});

	return t.end();
});
