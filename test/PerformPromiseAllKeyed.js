'use strict';

var test = require('tape');

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

	return t.end();
});
