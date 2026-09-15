const graphemes = new Intl.Segmenter("und", { granularity: "grapheme" });
const encoder = new TextEncoder();

// Retain the author's exact Unicode text even when the model normalizes it to
// NFC, or token boundaries fall inside a character / joined emoji.
export function tokenGroups(text, engine) {
  return groupTokenBytes(text, engine.encode(text), (id) => engine.bytes(id), (value) => engine.normalize?.(value) ?? value);
}

export function groupTokenBytes(text, ids, getBytes, normalize = (value) => value) {
  const source = encoder.encode(normalize(text));
  const boundaries = new Map();
  let byteEnd = 0;
  let originalEnd = 0;
  for (const { segment } of graphemes.segment(text)) {
    byteEnd += encoder.encode(normalize(segment)).length;
    originalEnd += segment.length;
    boundaries.set(byteEnd, originalEnd);
  }
  const groups = [];
  let originalStart = 0;
  let end = 0;
  let pending = [];
  for (const id of ids) {
    const bytes = getBytes(id);
    if (!bytes || end + bytes.length > source.length || bytes.some((byte, index) => byte !== source[end + index])) throw new Error("Token bytes do not match article text");
    end += bytes.length;
    pending.push(id);
    if (boundaries.has(end)) {
      const to = boundaries.get(end);
      groups.push({ text: text.slice(originalStart, to), ids: pending });
      pending = [];
      originalStart = to;
    }
  }
  if (end !== source.length || pending.length || originalStart !== text.length) throw new Error("Incomplete article tokens");
  return groups;
}
