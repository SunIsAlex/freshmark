import assert from "node:assert/strict";
import test from "node:test";
import { BuildWorkerPool, configuredWorkerCount } from "../lib/build-worker-pool.mjs";

const workerUrl = (source) => new URL(`data:text/javascript,${encodeURIComponent(source)}`);

test("worker count rejects fractional and partially numeric values", () => {
  for (const value of ["1.5", "2workers", "0", "-1", "Infinity"]) {
    assert.throws(() => configuredWorkerCount(value), /positive integer/);
  }
  assert.equal(configuredWorkerCount("2"), 2);
});

for (const [name, source, expected] of [
  ["clean exit", "process.exit(0)", /exited unexpectedly/],
  ["crash", "throw new Error('worker crashed')", /worker crashed/],
  ["invalid reply", "import { parentPort } from 'node:worker_threads'; parentPort.on('message', () => parentPort.postMessage({ id: -1 }));", /unexpected task/],
]) {
  test(`worker ${name} rejects running, queued, and future tasks`, { timeout: 5000 }, async (context) => {
    const pool = new BuildWorkerPool({ size: 1, workerUrl: workerUrl(source) });
    context.after(() => pool.close());
    await Promise.all([
      assert.rejects(pool.run("first", {}), expected),
      assert.rejects(pool.run("queued", {}), expected),
    ]);
    await assert.rejects(pool.run("later", {}), expected);
  });
}

test("closing a pool settles its running and queued tasks", { timeout: 5000 }, async () => {
  const pool = new BuildWorkerPool({ size: 1, workerUrl: workerUrl("setInterval(() => {}, 1000)") });
  const pending = [
    assert.rejects(pool.run("running", {}), /closed/),
    assert.rejects(pool.run("queued", {}), /closed/),
  ];
  await pool.close();
  await Promise.all(pending);
});

test("uncloneable tasks do not leave queued promises pending", { timeout: 5000 }, async () => {
  const pool = new BuildWorkerPool({ size: 1, workerUrl: workerUrl("setInterval(() => {}, 1000)") });
  await assert.rejects(pool.run("bad", () => {}), { name: "DataCloneError" });
  await assert.rejects(pool.run("later", {}), { name: "DataCloneError" });
  await pool.close();
});
