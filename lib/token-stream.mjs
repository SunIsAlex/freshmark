import { TOKEN_MAGIC, MAX_TOKEN_FRAME, BinaryCursor, decodeTokenRecord, joinBytes } from "./token-binary.mjs";
import { groupTokenBytes } from "./token-groups.mjs";

// Frame lengths and payloads can straddle any HTTP chunk boundary. Copy each
// payload once instead of repeatedly concatenating a growing incomplete frame.
export async function* readTokenRecords(response, signal) {
  if (!response.ok || !response.body) throw new Error("Token stream unavailable");
  const reader = response.body.getReader();
  let chunk = new Uint8Array();
  let offset = 0;
  const abort = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener("abort", abort, { once: true });
  async function exact(length, allowEnd = false) {
    const result = new Uint8Array(length);
    let written = 0;
    while (written < length) {
      signal?.throwIfAborted();
      if (offset === chunk.length) {
        const next = await reader.read();
        signal?.throwIfAborted();
        if (next.done) {
          if (allowEnd && !written) return null;
          throw new Error("Truncated token frame");
        }
        chunk = next.value;
        offset = 0;
      }
      const count = Math.min(length - written, chunk.length - offset);
      result.set(chunk.subarray(offset, offset + count), written);
      written += count;
      offset += count;
    }
    return result;
  }
  try {
    const magic = await exact(TOKEN_MAGIC.length);
    if (magic.some((byte, index) => byte !== TOKEN_MAGIC[index])) throw new Error("Unsupported token format");
    while (true) {
      const type = await exact(1, true);
      if (!type) break;
      const lengthBytes = [];
      do {
        if (lengthBytes.length === 5) throw new Error("Invalid frame length");
        lengthBytes.push((await exact(1))[0]);
      } while (lengthBytes[lengthBytes.length - 1] & 128);
      const length = new BinaryCursor(Uint8Array.from(lengthBytes)).uint();
      if (length > MAX_TOKEN_FRAME) throw new Error("Token frame too large");
      yield decodeTokenRecord(type[0], await exact(length));
    }
  } finally {
    signal?.removeEventListener("abort", abort);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
const escape = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export async function openTokenStream(response, signal) {
  const records = readTokenRecords(response, signal);
  try {
    const { value: header } = await records.next();
    if (header?.type !== "page" || header.tokenizer !== "qwen3.5" || !/^[a-f0-9]{40}$/.test(header.tokenizerRevision)) throw new Error("Unsupported token stream");
    return {
      page: header.page,
      tokenizer: header.tokenizer,
      close: () => records.return(),
      async consume(append) {
        const dictionary = [];
        const byId = new Map();
        let blocks = 0;
        let tokens = 0;
        let visible = 0;
        let ended = false;
        for await (const record of records) {
          signal?.throwIfAborted();
          if (ended) throw new Error("Unexpected data after token stream end");
          if (record.type === "dictionary") {
            for (const entry of record.entries) {
              if (byId.has(entry.id) || dictionary.length >= 1_000_000) throw new Error("Invalid token dictionary");
              dictionary.push(entry);
              byId.set(entry.id, entry.bytes);
            }
          } else if (record.type === "block") {
            const html = record.ops.map((op) => {
              if (op.html !== undefined) return op.html;
              const entries = op.ids.map((id) => {
                if (!dictionary[id]) throw new Error("Unknown local token ID");
                return dictionary[id];
              });
              const normalized = decoder.decode(joinBytes(entries.map((entry) => entry.bytes)));
              const original = op.original ?? normalized;
              if (original.normalize("NFC") !== normalized) throw new Error("Invalid Unicode correction");
              return groupTokenBytes(original, entries.map((entry) => entry.id), (id) => byId.get(id), (text) => text.normalize("NFC"))
                .map((group) => {
                  const index = tokens;
                  tokens += group.ids.length;
                  return `<span data-ai-token="${group.ids.join(",")}" data-ai-tone="${visible++ % 3}" title="Token ${index + 1}: ${group.ids.join(", ")}">${escape(group.text)}</span>`;
                }).join("");
            }).join("");
            await append(html);
            blocks += 1;
          } else if (record.type === "end" && record.blocks === blocks && record.tokens === tokens && record.dictionarySize === dictionary.length) ended = true;
          else throw new Error("Invalid token stream record");
        }
        if (!ended) throw new Error("Truncated token stream");
      },
    };
  } catch (error) {
    await records.return();
    throw error;
  }
}
