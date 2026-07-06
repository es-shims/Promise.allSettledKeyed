/**
 * An ES-spec-compliant `Promise.allSettledKeyed` shim, based on the await-dictionary proposal.
 *
 * Awaits every enumerable own property value of `promises`, and fulfills with a null-prototype
 * object of the same keys mapped to each input's settlement result (`{ status, value }` or
 * `{ status, reason }`). It never rejects on account of an input rejecting.
 *
 * @param promises - A dictionary whose enumerable own property values are awaited.
 * @returns A promise for an object of the same keys mapped to their settlement results.
 */
declare function allSettledKeyed<
	C extends PromiseConstructor,
	K extends string | symbol,
	T,
>(
	this: C,
	promises: { [k in K]: Promise<T> | T },
): Promise<{ [k in K]: PromiseSettledResult<T> }>;

export = allSettledKeyed;
