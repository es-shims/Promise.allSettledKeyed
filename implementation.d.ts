/**
 * An implementation of `Promise.allSettledKeyed` following the await-dictionary proposal specification.
 *
 * Awaits every enumerable own property value of `promises`, and fulfills with a null-prototype
 * object of the same keys mapped to each input's settlement result (`{ status, value }` or
 * `{ status, reason }`). It never rejects on account of an input rejecting.
 *
 * @param promises - A dictionary whose enumerable own property values are awaited.
 * @returns A promise for an object of the same keys mapped to their settlement results.
 */
declare function allSettledKeyed<
	K extends string | symbol,
	T,
	C extends PromiseConstructor,
>(
	this: C,
	promises: { [k in K]: Promise<T> | T },
): Promise<{ [k in K]: PromiseSettledResult<T> }>;

export = allSettledKeyed;
