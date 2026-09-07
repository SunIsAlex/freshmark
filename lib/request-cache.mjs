// Share in-flight requests; retain only a bounded number of successful results.
export function createRequestCache(limit = 12) {
  const ready = new Map();
  const pending = new Map();
  return {
    has: (key) => ready.has(key) || pending.has(key),
    get(key, load) {
      if (ready.has(key)) {
        const value = ready.get(key);
        ready.delete(key);
        ready.set(key, value);
        return Promise.resolve(value);
      }
      if (pending.has(key)) return pending.get(key);
      const request = Promise.resolve().then(load).then((value) => {
        ready.set(key, value);
        while (ready.size > limit) ready.delete(ready.keys().next().value);
        return value;
      }).finally(() => pending.delete(key));
      pending.set(key, request);
      return request;
    },
  };
}
