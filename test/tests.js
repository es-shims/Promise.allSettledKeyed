'use strict';

var forEach = require('for-each');
var inspect = require('object-inspect');

var getProto = Object.getPrototypeOf;
var hasOwn = Object.prototype.hasOwnProperty;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

var makeClass = function (source) {
	try {
		// eslint-disable-next-line no-new-func
		return Function('return (' + source + ');')();
	} catch (e) {
		return false;
	}
};

var fulfilled = function (value) {
	return { status: 'fulfilled', value: value };
};
var rejected = function (reason) {
	return { status: 'rejected', reason: reason };
};

module.exports = function runTests(allSettledKeyed, t) {
	if (typeof Promise !== 'function') {
		return t.skip('No global Promise detected');
	}

	t.test('non-object input rejects with a TypeError', function (st) {
		var cases = [undefined, null, true, false, 42, 'foo'];
		st.plan(cases.length);

		forEach(cases, function (nonObject) {
			allSettledKeyed(nonObject).then(function () {
				st.fail(inspect(nonObject) + ': should not fulfill');
			}, function (e) {
				st.equal(e instanceof TypeError, true, inspect(nonObject) + ': rejects with a TypeError');
			});
		});
	});

	t.test('settles a dictionary of values and promises', function (st) {
		st.plan(4);

		allSettledKeyed({
			a: 1,
			b: Promise.resolve(2),
			c: 'three'
		}).then(function (result) {
			st.deepEqual(
				{ a: result.a, b: result.b, c: result.c },
				{ a: fulfilled(1), b: fulfilled(2), c: fulfilled('three') },
				'each value is settled as fulfilled under its key'
			);
			st.equal(getProto(result), null, 'result object has a null prototype');
			st.deepEqual(Object.keys(result), ['a', 'b', 'c'], 'result has the same own keys, in order');
			st.equal(hasOwn.call(result, 'a'), true, 'keys are own data properties');
		}, st.fail);
	});

	t.test('does not reject when inputs reject; records settlement results', function (st) {
		st.plan(1);

		var sentinel = { sentinel: true };

		allSettledKeyed({
			a: Promise.resolve(1),
			b: Promise.reject(sentinel),
			c: 2
		}).then(function (result) {
			st.deepEqual(
				{ a: result.a, b: result.b, c: result.c },
				{ a: fulfilled(1), b: rejected(sentinel), c: fulfilled(2) },
				'fulfilled and rejected inputs are recorded as settlement results'
			);
		}, st.fail);
	});

	t.test('result key order follows the input keys, not settlement timing', function (st) {
		st.plan(2);

		var deferredFirst = Promise.resolve().then(function () {}).then(function () {}).then(function () { return 'first'; });

		allSettledKeyed({ a: deferredFirst, b: Promise.resolve('b'), c: 'c' }).then(function (result) {
			st.deepEqual(Object.keys(result), ['a', 'b', 'c'], 'keys stay in input order even though `a` settles last');
			st.deepEqual(result.a, fulfilled('first'), 'the late-settling value is still placed under its key');
		}, st.fail);
	});

	t.test('an empty dictionary settles to an empty null-proto object', function (st) {
		st.plan(2);

		allSettledKeyed({}).then(function (result) {
			st.equal(getProto(result), null, 'result object has a null prototype');
			st.deepEqual(Object.keys(result), [], 'result has no own keys');
		}, st.fail);
	});

	t.test('only enumerable own properties are awaited', function (st) {
		st.plan(1);

		var obj = { visible: Promise.resolve('yes') };
		Object.defineProperty(obj, 'hidden', { enumerable: false, value: Promise.resolve('no') });

		var withInherited = Object.create({ inherited: Promise.resolve('nope') });
		withInherited.own = Promise.resolve('own');

		Promise.all([allSettledKeyed(obj), allSettledKeyed(withInherited)]).then(function (results) {
			st.deepEqual(
				[Object.keys(results[0]), Object.keys(results[1])],
				[['visible'], ['own']],
				'non-enumerable and inherited keys are excluded'
			);
		}, st.fail);
	});

	t.test('symbol keys are awaited', { skip: !hasSymbols }, function (st) {
		st.plan(3);

		var sym = Symbol('sym');
		var obj = {};
		obj[sym] = Promise.resolve('symbol value');
		obj.str = Promise.reject('string reason');

		allSettledKeyed(obj).then(function (result) {
			st.deepEqual(result[sym], fulfilled('symbol value'), 'symbol-keyed value is settled');
			st.deepEqual(result.str, rejected('string reason'), 'string-keyed value is settled');
			st.equal(getProto(result), null, 'result object has a null prototype');
		}, st.fail);
	});

	t.test('rejects if reading a property value throws', function (st) {
		st.plan(1);

		var err = new Error('getter threw');
		var obj = {};
		Object.defineProperty(obj, 'bad', { enumerable: true, get: function () { throw err; } });

		allSettledKeyed(obj).then(st.fail, function (e) {
			st.equal(e, err, 'rejects with the thrown error');
		});
	});

	t.test('a value with a poisoned `then` is settled as rejected', function (st) {
		st.plan(1);

		var err = new Error('poisoned then');
		var thenable = {};
		Object.defineProperty(thenable, 'then', { get: function () { throw err; } });

		allSettledKeyed({ a: thenable }).then(function (result) {
			st.deepEqual(result.a, rejected(err), 'the poisoned thenable settles as rejected rather than rejecting the whole');
		}, st.fail);
	});

	var Subclass = makeClass('class Subclass extends Promise {}');

	t.test('preserves the subclass', { skip: !Subclass }, function (st) {
		st.plan(2);

		var promise = allSettledKeyed.call(Subclass, { a: Subclass.resolve(1) });
		st.equal(promise instanceof Subclass, true, 'result promise is an instance of the subclass');

		promise.then(function (result) {
			st.deepEqual(result.a, fulfilled(1), 'the subclass-wrapped value is settled');
		}, st.fail);
	});

	var BadResolve = makeClass('class BadResolve extends Promise { static get resolve() { return undefined; } }');

	t.test('rejects if the constructor `resolve` is not callable', { skip: !BadResolve }, function (st) {
		st.plan(1);

		allSettledKeyed.call(BadResolve, {}).then(st.fail, function (e) {
			st.equal(e instanceof TypeError, true, 'rejects with a TypeError');
		});
	});

	var DoubleSettle = makeClass('class DoubleSettle extends Promise { static resolve(v) { return { then: function (onFulfilled, onRejected) { onFulfilled(v); onRejected("ignored"); } }; } }');

	t.test('a settle element is only honored once', { skip: !DoubleSettle }, function (st) {
		st.plan(2);

		allSettledKeyed.call(DoubleSettle, { a: 1 }).then(function (result) {
			st.deepEqual(result.a, fulfilled(1), 'only the first settlement is used');
			st.equal(getProto(result), null, 'result object has a null prototype');
		}, st.fail);
	});

	return t.comment('tests completed');
};
