'use strict';

var CreateDataPropertyOrThrow = require('es-abstract/2025/CreateDataPropertyOrThrow');
var OrdinaryObjectCreate = require('es-abstract/2025/OrdinaryObjectCreate');

// https://tc39.es/proposal-await-dictionary/#sec-createkeyedpromisecombinatorresultobject

/** @type {typeof import('./CreateKeyedPromiseCombinatorResultObject')} */
module.exports = function CreateKeyedPromiseCombinatorResultObject(entries) {
	/** @typedef {(typeof entries)[number]} Entry */
	/** @typedef {Entry['[[Key]]']} K */
	/** @typedef {Entry['[[Value]]']} T */

	/** @type {{ [k in K]: T }} */
	var obj = OrdinaryObjectCreate(null); // step 1

	for (var i = 0; i < entries.length; i += 1) { // step 2
		var entry = entries[i];

		CreateDataPropertyOrThrow(obj, entry['[[Key]]'], entry['[[Value]]']); // step 2.a
	}

	return obj; // step 3
};
