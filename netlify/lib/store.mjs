const factorySymbol = Symbol.for("freshmark.storeFactory");

export function setStoreFactory(factory) {
  globalThis[factorySymbol] = factory;
}

export function getStore(options) {
  const factory = globalThis[factorySymbol];
  if (!factory) {
    throw new Error("Freshmark store factory has not been configured");
  }
  return factory(options);
}
