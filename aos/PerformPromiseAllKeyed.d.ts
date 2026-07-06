type PropertyKey = string | symbol;

type Variant = '~ALL~' | '~ALL-SETTLED~';

type SettledResult<T> = {
	status: 'fulfilled';
	value: T | undefined;
} | {
	status: 'rejected';
	reason: unknown;
};

type Entry<
	K extends PropertyKey,
	T,
	V extends Variant,
> = V extends '~ALL~' ? {
	'[[Key]]': K;
	'[[Value]]': T | undefined;
} : {
	'[[Key]]': K;
	'[[Value]]': SettledResult<T>;
};

type Result<
	V extends Variant,
	K extends PropertyKey,
	T,
> = V extends '~ALL-SETTLED~' ? { [k in K]: PromiseSettledResult<T> } : { [k in K]: T };

type PromiseExecutor<
	C extends PromiseConstructor,
> = Parameters<ConstructorParameters<C>[0]>;

type PromiseResolve<
	C extends PromiseConstructor,
> = PromiseExecutor<C>[0];
type PromiseReject<
	C extends PromiseConstructor,
> = PromiseExecutor<C>[1];

type PromiseCapability<
	C extends PromiseConstructor,
	T,
> = {
	'[[Promise]]': Promise<T>;
	'[[Resolve]]': PromiseResolve<C>;
	'[[Reject]]': PromiseReject<C>;
};

declare function PerformPromiseAllKeyed<
	V extends Variant,
	C extends PromiseConstructor,
	K extends PropertyKey,
	T,
>(
	variant: V,
	promises: { [k in K]: Promise<T> | T },
	ctor: C,
	resultCapability: PromiseCapability<C, Result<V, K, T>>,
	promiseResolve: <W>(this: C, value?: W) => Promise<Awaited<W>>,
): Promise<Result<V, K, T>>;

declare namespace PerformPromiseAllKeyed {
	export {
		Entry,
		PromiseCapability,
		PromiseExecutor,
		PromiseResolve,
		PromiseReject,
		SettledResult,
		Variant,
	};
}

export = PerformPromiseAllKeyed;
