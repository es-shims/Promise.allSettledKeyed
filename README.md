# promise.allsettledkeyed <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

ES Proposal spec-compliant shim for `Promise.allSettledKeyed`. Invoke its "shim" method to shim `Promise.allSettledKeyed` if it is unavailable or noncompliant. **Note**: a global `Promise` must already exist: the [es6-shim](https://github.com/es-shims/es6-shim) is recommended.

This package implements the [es-shim API](https://github.com/es-shims/api) interface. It works in an ES3-supported environment that has `Promise` available globally, and complies with the [proposed spec](https://tc39.es/proposal-await-dictionary/).

`Promise.allSettledKeyed` is like `Promise.allSettled`, but for a dictionary (a plain object) rather than an iterable: it awaits every enumerable own property value, and fulfills with a `null`-prototype object of the same keys, each mapped to a settlement result (`{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }`). As with `Promise.allSettled`, it never rejects on account of an input rejecting.

Most common usage:
```js
var assert = require('assert');
var allSettledKeyed = require('promise.allsettledkeyed');

allSettledKeyed({
	shape: Promise.resolve('square'),
	color: Promise.reject('no color'),
	mass: 42
}).then(function (results) {
	assert.deepEqual(results.shape, { status: 'fulfilled', value: 'square' });
	assert.deepEqual(results.color, { status: 'rejected', reason: 'no color' });
	assert.deepEqual(results.mass, { status: 'fulfilled', value: 42 });
});

require('promise.allsettledkeyed/shim')(); // will be a no-op if not needed

Promise.allSettledKeyed({
	a: Promise.resolve(1),
	b: Promise.reject(2)
}).then(function (results) {
	assert.equal(results.a.status, 'fulfilled');
	assert.equal(results.a.value, 1);
	assert.equal(results.b.status, 'rejected');
	assert.equal(results.b.reason, 2);
});
```

The `polyfill`, `implementation`, and `shim` methods are available as separate entry points, per the [es-shim API](https://github.com/es-shims/api):
```js
var getPolyfill = require('promise.allsettledkeyed/polyfill');
var implementation = require('promise.allsettledkeyed/implementation');
var shim = require('promise.allsettledkeyed/shim');
```

## Tests
Simply clone the repo, `npm install`, and run `npm test`

[package-url]: https://npmjs.com/package/promise.allsettledkeyed
[npm-version-svg]: https://versionbadg.es/es-shims/Promise.allSettledKeyed.svg
[deps-svg]: https://david-dm.org/es-shims/Promise.allSettledKeyed.svg
[deps-url]: https://david-dm.org/es-shims/Promise.allSettledKeyed
[dev-deps-svg]: https://david-dm.org/es-shims/Promise.allSettledKeyed/dev-status.svg
[dev-deps-url]: https://david-dm.org/es-shims/Promise.allSettledKeyed#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/promise.allsettledkeyed.png?downloads=true&stars=true
[license-image]: https://img.shields.io/npm/l/promise.allsettledkeyed.svg
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/promise.allsettledkeyed.svg
[downloads-url]: https://npm-stat.com/charts.html?package=promise.allsettledkeyed
[codecov-image]: https://codecov.io/gh/es-shims/Promise.allSettledKeyed/branch/main/graphs/badge.svg
[codecov-url]: https://app.codecov.io/gh/es-shims/Promise.allSettledKeyed/
[actions-image]: https://img.shields.io/github/check-runs/es-shims/Promise.allSettledKeyed/main
[actions-url]: https://github.com/es-shims/Promise.allSettledKeyed/actions
