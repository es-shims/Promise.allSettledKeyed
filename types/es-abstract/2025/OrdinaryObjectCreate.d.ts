// `@types/es-abstract` widens OrdinaryObjectCreate to `object`; a null-proto object's shape is
// established by the caller (as the standard library types `Object.create(null)`), so make it generic.

declare function OrdinaryObjectCreate<T extends object = object>(proto: null): T;

export = OrdinaryObjectCreate;
