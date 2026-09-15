import { Tokenizer } from "@huggingface/tokenizers";

// ByteLevel vocabularies store bytes as printable Unicode characters (GPT-2's
// reversible alphabet). Recover bytes before decoding individual BPE tokens.
const printable = [];
for (let byte = 0; byte < 256; byte += 1) {
  if ((byte >= 33 && byte <= 126) || (byte >= 161 && byte <= 172) || byte >= 174) printable.push(byte);
}
const alphabet = new Map(printable.map((byte) => [String.fromCodePoint(byte), byte]));
let extra = 256;
for (let byte = 0; byte < 256; byte += 1) {
  if (!printable.includes(byte)) alphabet.set(String.fromCodePoint(extra++), byte);
}

export function createHfTokenizer(json, config) {
  if (json.model.type !== "BPE" || json.decoder.type !== "ByteLevel") throw new Error("Expected a ByteLevel BPE tokenizer");
  const nfc = json.normalizer?.type === "NFC";
  if (json.normalizer && !nfc && !(json.normalizer.type === "Sequence" && json.normalizer.normalizers.length === 0)) throw new Error("Unsupported tokenizer normalization");
  const tokenizer = new Tokenizer(json, config);
  const added = new Map((json.added_tokens || []).map((token) => [token.id, token.content]));
  const cache = new Map();
  return {
    normalize: (text) => nfc ? text.normalize("NFC") : text,
    encode: (text) => tokenizer.encode(text, { add_special_tokens: false }).ids,
    bytes(id) {
      if (!cache.has(id)) {
        const token = tokenizer.id_to_token(id);
        if (token === undefined) throw new Error(`Unknown token ID: ${id}`);
        const bytes = added.has(id) ? Buffer.from(added.get(id)) : Buffer.from([...token].map((character) => {
          const byte = alphabet.get(character);
          if (byte === undefined) throw new Error("Invalid ByteLevel vocabulary character");
          return byte;
        }));
        cache.set(id, bytes);
      }
      return cache.get(id);
    },
  };
}
