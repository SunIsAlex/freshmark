import { getStore as getNetlifyStore } from "@netlify/blobs";

const factorySymbol = Symbol.for("freshmark.storeFactory");

export function setStoreFactory(factory) {
  globalThis[factorySymbol] = factory;
}

export function getStore(options) {
  const factory = globalThis[factorySymbol];
  return factory ? factory(options) : getNetlifyStore(options);
}
