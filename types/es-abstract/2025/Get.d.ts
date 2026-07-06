// Types for `es-abstract/2025/Get`; `@types/es-abstract` widens a known-key lookup to `unknown`.

declare function Get<O, P extends keyof O>(O: O, P: P): O[P];

export = Get;
