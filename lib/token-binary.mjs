export const TOKEN_MAGIC = Uint8Array.of(0x46, 0x4d, 0x54, 0x4b, 2); // FMTK, version 2
export const TOKEN_MIME = "application/x-freshmark-tokens";
export const MAX_TOKEN_FRAME = 16 * 1024 * 1024;
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

export function joinBytes(parts) {
  const result = new Uint8Array(parts.reduce((size, part) => size + part.length, 0));
  let offset = 0;
  for (const part of parts) { result.set(part, offset); offset += part.length; }
  return result;
}

export class BinaryWriter {
  parts = [];
  uint(value) {
    if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) throw new Error("Invalid unsigned integer");
    const bytes = [];
    do {
      const next = value % 128;
      value = Math.floor(value / 128);
      bytes.push(next | (value ? 128 : 0));
    } while (value);
    this.parts.push(Uint8Array.from(bytes));
    return this;
  }
  bytes(value) { this.uint(value.length); this.parts.push(value); return this; }
  string(value) { return this.bytes(encoder.encode(value)); }
  finish() { return joinBytes(this.parts); }
}

export class BinaryCursor {
  offset = 0;
  constructor(data) { this.data = data; }
  get remaining() { return this.data.length - this.offset; }
  uint() {
    let result = 0;
    for (let shift = 0; shift <= 28; shift += 7) {
      if (!this.remaining) throw new Error("Truncated integer");
      const byte = this.data[this.offset++];
      if (shift === 28 && byte > 15) throw new Error("Integer overflow");
      result += (byte & 127) * 2 ** shift;
      if (!(byte & 128)) {
        if (shift && byte === 0) throw new Error("Noncanonical integer");
        return result;
      }
    }
    throw new Error("Invalid integer");
  }
  bytes() {
    const length = this.uint();
    if (length > this.remaining) throw new Error("Truncated byte string");
    const bytes = this.data.subarray(this.offset, this.offset + length);
    this.offset += length;
    return bytes;
  }
  string() { return decoder.decode(this.bytes()); }
}

export function encodeTokenRecord(record) {
  const writer = new BinaryWriter();
  let type;
  if (record.type === "page") {
    type = 1;
    for (const value of [record.tokenizer, record.tokenizerRevision, record.page.title, record.page.description,
      record.page.canonical, record.page.alternate, record.page.html]) writer.string(value || "");
  } else if (record.type === "dictionary") {
    type = 2;
    for (const { id, bytes } of record.entries) writer.uint(id).bytes(bytes);
  } else if (record.type === "block") {
    type = 3;
    for (const op of record.ops) {
      if (typeof op.html === "string") writer.uint(0).string(op.html);
      else {
        writer.uint(op.original === undefined ? 1 : 2).uint(op.ids.length);
        for (const id of op.ids) writer.uint(id);
        if (op.original !== undefined) writer.string(op.original);
      }
    }
  } else if (record.type === "end") {
    type = 4;
    writer.uint(record.blocks).uint(record.tokens).uint(record.dictionarySize);
  } else throw new Error("Unknown token record");
  const payload = writer.finish();
  if (payload.length > MAX_TOKEN_FRAME) throw new Error("Token frame too large");
  return joinBytes([Uint8Array.of(type), new BinaryWriter().uint(payload.length).finish(), payload]);
}

export function encodeTokenFile(records) {
  return joinBytes([TOKEN_MAGIC, ...records.map(encodeTokenRecord)]);
}

export function decodeTokenRecord(type, payload) {
  const cursor = new BinaryCursor(payload);
  let record;
  if (type === 1) {
    const tokenizer = cursor.string();
    const tokenizerRevision = cursor.string();
    record = { type: "page", version: 2, tokenizer, tokenizerRevision, page: {
      title: cursor.string(), description: cursor.string(), canonical: cursor.string(),
      alternate: cursor.string(), html: cursor.string(), article: true,
    } };
  } else if (type === 2) {
    const entries = [];
    while (cursor.remaining) {
      const id = cursor.uint();
      const bytes = cursor.bytes();
      if (!bytes.length) throw new Error("Empty dictionary entry");
      entries.push({ id, bytes });
    }
    record = { type: "dictionary", entries };
  } else if (type === 3) {
    const ops = [];
    while (cursor.remaining) {
      const code = cursor.uint();
      if (code === 0) ops.push({ html: cursor.string() });
      else if (code === 1 || code === 2) {
        const count = cursor.uint();
        if (!count || count > cursor.remaining) throw new Error("Invalid token run length");
        const ids = [];
        for (let index = 0; index < count; index += 1) ids.push(cursor.uint());
        ops.push({ ids, ...(code === 2 ? { original: cursor.string() } : {}) });
      } else throw new Error("Unknown token instruction");
    }
    record = { type: "block", ops };
  } else if (type === 4) record = { type: "end", blocks: cursor.uint(), tokens: cursor.uint(), dictionarySize: cursor.uint() };
  else throw new Error("Unknown token frame");
  if (cursor.remaining) throw new Error("Trailing frame data");
  return record;
}
