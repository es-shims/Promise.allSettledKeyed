import type { Entry } from './PerformPromiseAllKeyed';

declare function CreateKeyedPromiseCombinatorResultObject<
	K extends string | symbol,
	T,
>(entries: Entry<K, T, '~ALL~' | '~ALL-SETTLED~'>[]): {
	[k in K]: (typeof entries)[number]['[[Value]]']
};

export = CreateKeyedPromiseCombinatorResultObject;
