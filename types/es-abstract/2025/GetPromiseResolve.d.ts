// Types for `es-abstract/2025/GetPromiseResolve`, which `@types/es-abstract` does not yet ship.

declare function GetPromiseResolve(constructor: PromiseConstructor): <V>(this: unknown, value?: V) => Promise<Awaited<V>>;

export = GetPromiseResolve;
