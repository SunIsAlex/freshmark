import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { parseFragment, serializeOuter } from "parse5";
import { createHfTokenizer } from "./hf-tokenizer.mjs";
import { tokenGroups } from "./token-groups.mjs";
import { encodeTokenFile } from "./token-binary.mjs";

// Keep the full tokenizer on the build machine; each article carries only its used token bytes.
const vendor = new URL("../vendor/tokenizer/", import.meta.url);
export const articleTokenizer = JSON.parse(readFileSync(new URL("source.json", vendor), "utf8"));
const json = gunzipSync(readFileSync(new URL("tokenizer.json.gz", vendor)));
const config = readFileSync(new URL("tokenizer_config.json", vendor));
for (const [name, bytes] of [["tokenizer.json", json], ["tokenizer_config.json", config]]) {
  if (createHash("sha256").update(bytes).digest("hex") !== articleTokenizer.sha256[name]) throw new Error(`Tokenizer checksum mismatch: ${name}`);
}
const engine = createHfTokenizer(JSON.parse(json), JSON.parse(config));
const excluded = new Set(["script", "style", "noscript", "template", "code", "pre", "svg", "math", "textarea"]);
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;

export function tokenizeText(text) {
  return tokenGroups(text, engine);
}

export function articleTokenStream(fragment) {
  const document = parseFragment(fragment);
  let prose;
  let metadata;
  let main;
  function find(node) {
    if (node.tagName === "article" && attr(node, "class")?.split(/\s+/).includes("prose")) prose = node;
    if (attr(node, "data-freshmark-page") !== undefined) metadata = node;
    if (node.tagName === "main") main = node;
    node.childNodes?.forEach(find);
  }
  find(document);
  if (!prose || !metadata || !main) throw new Error("Token stream requires article prose and page metadata");
  const blocks = [];
  for (const node of prose.childNodes) {
    const html = serializeOuter(node);
    if (!html.trim() && blocks.length) blocks[blocks.length - 1] += html;
    else blocks.push(html);
  }
  prose.childNodes = [];
  const page = {
    title: attr(metadata, "data-title"), description: attr(metadata, "data-description"),
    canonical: attr(metadata, "data-canonical"), alternate: attr(metadata, "data-alternate"),
    article: true, html: serializeOuter(main),
  };
  const records = [{ type: "page", tokenizer: articleTokenizer.id, tokenizerRevision: articleTokenizer.revision, page }];
  const dictionary = new Map();
  let tokens = 0;
  for (const html of blocks) {
    const replacements = [];
    function collect(node) {
      if (excluded.has(node.tagName) || attr(node, "class")?.split(/\s+/).includes("math-expression") || attr(node, "aria-hidden") === "true") return;
      if (node.nodeName === "#text" && node.value.trim()) {
        replacements.push({ text: node.value, ...node.sourceCodeLocation });
      }
      node.childNodes?.forEach(collect);
    }
    collect(parseFragment(html, { sourceCodeLocationInfo: true }));
    replacements.sort((a, b) => a.startOffset - b.startOffset);
    const ops = [];
    const entries = [];
    let cursor = 0;
    for (const { text, startOffset, endOffset } of replacements) {
      if (startOffset < cursor || endOffset > html.length) throw new Error("Invalid token text location");
      if (startOffset > cursor) ops.push({ html: html.slice(cursor, startOffset) });
      const ids = tokenizeText(text).flatMap((group) => group.ids).map((id) => {
        if (!dictionary.has(id)) {
          dictionary.set(id, dictionary.size);
          entries.push({ id, bytes: engine.bytes(id) });
        }
        tokens += 1;
        return dictionary.get(id);
      });
      ops.push({ ids, ...(engine.normalize(text) !== text ? { original: text } : {}) });
      cursor = endOffset;
    }
    if (cursor < html.length) ops.push({ html: html.slice(cursor) });
    if (entries.length) records.push({ type: "dictionary", entries });
    records.push({ type: "block", ops });
  }
  records.push({ type: "end", blocks: blocks.length, tokens, dictionarySize: dictionary.size });
  return encodeTokenFile(records);
}
