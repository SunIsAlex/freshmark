import { availableParallelism } from "node:os";
import { Worker } from "node:worker_threads";

const defaultWorkerCount = Math.max(1, Math.min(4, availableParallelism() - 1));

export function configuredWorkerCount(value = process.env.FRESHMARK_WORKERS) {
  if (value === undefined || value === "") return defaultWorkerCount;
  const count = Number.parseInt(value, 10);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("FRESHMARK_WORKERS must be a positive integer");
  }
  return count;
}

export class BuildWorkerPool {
  constructor({ size = configuredWorkerCount(), workerUrl } = {}) {
    this.size = size;
    this.workerUrl = workerUrl;
    this.workers = [];
    this.queue = [];
    this.nextTaskId = 1;
    this.closed = false;

    for (let index = 0; index < size; index += 1) this.#createWorker();
  }

  #createWorker() {
    const worker = new Worker(this.workerUrl);
    const state = { worker, task: null };
    worker.on("message", (message) => {
      const task = state.task;
      state.task = null;
      if (!task || task.id !== message.id) {
        this.#fail(new Error("Build worker returned an unexpected task"));
        return;
      }
      if (message.error) {
        const error = new Error(message.error.message);
        error.stack = message.error.stack || error.stack;
        task.reject(error);
      } else {
        task.resolve(message.result);
      }
      this.#dispatch(state);
    });
    worker.on("error", (error) => {
      if (state.task) {
        state.task.reject(error);
        state.task = null;
      }
      this.#fail(error);
    });
    worker.on("exit", (code) => {
      if (!this.closed && code !== 0) this.#fail(new Error(`Build worker exited with code ${code}`));
    });
    this.workers.push(state);
  }

  #dispatch(state) {
    if (this.closed || state.task || !this.queue.length) return;
    state.task = this.queue.shift();
    state.worker.postMessage({
      id: state.task.id,
      type: state.task.type,
      payload: state.task.payload,
    });
  }

  #fail(error) {
    for (const task of this.queue.splice(0)) task.reject(error);
    for (const state of this.workers) {
      if (state.task) {
        state.task.reject(error);
        state.task = null;
      }
    }
  }

  run(type, payload) {
    if (this.closed) return Promise.reject(new Error("Build worker pool is closed"));
    return new Promise((resolve, reject) => {
      this.queue.push({ id: this.nextTaskId++, type, payload, resolve, reject });
      for (const state of this.workers) this.#dispatch(state);
    });
  }

  async close() {
    if (this.closed) return;
    this.closed = true;
    const error = new Error("Build worker pool closed before completing its queued work");
    for (const task of this.queue.splice(0)) task.reject(error);
    await Promise.all(this.workers.map(({ worker }) => worker.terminate()));
  }
}
