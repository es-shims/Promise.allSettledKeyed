import implementation = require('./implementation');

/**
 * Returns the native `Promise.allSettledKeyed` if it is present and compliant, otherwise the custom implementation.
 */
declare function getPolyfill(): typeof implementation;

export = getPolyfill;
