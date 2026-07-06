// Types for `es-abstract/2025/NewPromiseCapability`, which `@types/es-abstract` does not yet ship.

declare function NewPromiseCapability<
	C extends PromiseConstructor,
	R,
>(C: C): {
	'[[Promise]]': Promise<R>;
	'[[Resolve]]': (value?: unknown) => void;
	'[[Reject]]': (reason?: unknown) => void;
};

export = NewPromiseCapability;
