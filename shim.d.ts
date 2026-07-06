import implementation = require('./implementation');

/**
 * Installs the `Promise.allSettledKeyed` polyfill onto the global `Promise` if needed, and returns the resulting implementation.
 */
declare function shimAllSettledKeyed(): typeof implementation;

export = shimAllSettledKeyed;
