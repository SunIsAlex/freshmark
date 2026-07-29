import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const safeName = (value) => {
  const name = String(value || "");
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/i.test(name)) throw new Error(`Invalid store name: ${name}`);
  return name;
};

class FileStore {
  constructor(root, name) {
    this.directory = path.join(root, safeName(name));
    this.ready = mkdir(this.directory, { recursive: true, mode: 0o700 });
    this.locks = new Map();
  }

  file(key) {
    const digest = createHash("sha256").update(String(key)).digest("base64url");
    return path.join(this.directory, `${digest}.json`);
  }

  async read(key) {
    await this.ready;
    try {
      const record = JSON.parse(await readFile(this.file(key), "utf8"));
      return record?.key === key && typeof record.etag === "string" ? record : null;
    } catch (error) {
      if (error?.code === "ENOENT") return null;
      throw error;
    }
  }

  async locked(key, operation) {
    const previous = this.locks.get(key) || Promise.resolve();
    const current = previous.catch(() => {}).then(operation);
    this.locks.set(key, current);
    try {
      return await current;
    } finally {
      if (this.locks.get(key) === current) this.locks.delete(key);
    }
  }

  async get(key) {
    return (await this.read(String(key)))?.data ?? null;
  }

  async getWithMetadata(key) {
    const record = await this.read(String(key));
    return record ? { data: record.data, etag: record.etag } : null;
  }

  async setJSON(keyValue, data, options = {}) {
    const key = String(keyValue);
    return await this.locked(key, async () => {
      const current = await this.read(key);
      if (options.onlyIfNew && current) return { modified: false };
      if (options.onlyIfMatch && current?.etag !== options.onlyIfMatch) return { modified: false };
      const etag = `"${randomUUID()}"`;
      const target = this.file(key);
      const temporary = `${target}.${randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify({ key, etag, data }), { mode: 0o600 });
      await rename(temporary, target);
      return { modified: true, etag };
    });
  }

  async delete(keyValue) {
    const key = String(keyValue);
    return await this.locked(key, async () => {
      try {
        await unlink(this.file(key));
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
    });
  }
}

export function createFileStoreFactory(root) {
  const stores = new Map();
  return ({ name }) => {
    if (!stores.has(name)) stores.set(name, new FileStore(root, name));
    return stores.get(name);
  };
}
