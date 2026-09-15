import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { Tokenizer } from "@huggingface/tokenizers";
import { parseFragment } from "parse5";
import { articleTokenStream, articleTokenizer, tokenizeText } from "../lib/article-tokens.mjs";
import { openTokenStream, readTokenRecords } from "../lib/token-stream.mjs";
import { TOKEN_MAGIC, BinaryWriter, BinaryCursor, encodeTokenFile, encodeTokenRecord, joinBytes } from "../lib/token-binary.mjs";

const fragment = '<meta data-freshmark-page data-title="测试 — Freshmark" data-canonical="https://example.com/sub/posts/test/" data-alternate="https://example.com/sub/en/posts/test/"><main><header><h1>测试</h1></header><article class="prose"><h2 id="heading">你好 world &amp; &lt;x&gt;</h2>\n<p>中文 <a href="../other/">link words</a> <strong>strong</strong> 👨‍👩‍👧‍👦 𠮷</p>\n<pre><code>const x = 1;</code></pre><p><span class="math-expression" data-math-source="x^2">x²</span><u class="answer-reveal">答案</u></p><table><tbody><tr><td>表格</td></tr></tbody></table><img src="image.webp"></article></main>';
const data = articleTokenStream(fragment);
const records = [];
for await (const record of readTokenRecords(new Response(data))) records.push(record);
const decodedBlocks = [];
const decodedStream = await openTokenStream(new Response(data));
await decodedStream.consume((html) => decodedBlocks.push(html));
const reference = new Tokenizer(
  JSON.parse(gunzipSync(readFileSync(new URL("../vendor/tokenizer/tokenizer.json.gz", import.meta.url)))),
  JSON.parse(readFileSync(new URL("../vendor/tokenizer/tokenizer_config.json", import.meta.url))),
);
const textContent = (node) => node.value || (node.childNodes || []).map(textContent).join("");
function find(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.childNodes || []) {
    const result = find(child, predicate);
    if (result) return result;
  }
}

test("model IDs and Unicode text round-trip, including special-token literals", () => {
  for (const source of ["", "中文与 English words.\n下一行", "𠮷👨‍👩‍👧‍👦 e\u0301 ❤️", "<|endoftext|> & <script>", " \t\n"]) {
    const groups = tokenizeText(source);
    assert.equal(groups.map((group) => group.text).join(""), source);
    const ids = groups.flatMap((group) => group.ids);
    assert.deepEqual(ids, reference.encode(source, { add_special_tokens: false }).ids);
    assert.equal(ids.length ? reference.decode(ids, { skip_special_tokens: false, clean_up_tokenization_spaces: false }) : "", source.normalize("NFC"));
    assert.ok(groups.every((group) => !group.text.includes("\ufffd")));
  }
  assert.equal(tokenizeText("👨‍👩‍👧‍👦").length, 1, "Joined emoji must not be split visually");
  assert.ok(tokenizeText("𠮷")[0].ids.length > 1);
});

test("selected Qwen3.5 preserves more idioms and exposes genuine vocabulary IDs", () => {
  assert.deepEqual(tokenizeText("有的放矢"), [{ text: "有的", ids: [97332] }, { text: "放矢", ids: [144318] }]);
  assert.deepEqual(tokenizeText("循序渐进"), [{ text: "循序渐进", ids: [123974] }]);
  assert.deepEqual(tokenizeText("举一反三"), [{ text: "举一反三", ids: [133813] }]);
  assert.deepEqual(tokenizeText("e\u0301"), [{ text: "e\u0301", ids: [933] }], "NFC encoding must preserve original decomposed text in the DOM");
});

test("binary stream keeps metadata, markup and exact prose text while excluding code and math", () => {
  assert.equal(records[0].page.title, "测试 — Freshmark");
  assert.equal(records[0].page.canonical, "https://example.com/sub/posts/test/");
  assert.equal(records[0].tokenizer, "qwen3.5");
  assert.equal(records[0].tokenizerRevision, articleTokenizer.revision);
  assert.match(records[0].page.html, /<article class="prose"><\/article>/);
  const html = decodedBlocks.join("");
  const tree = parseFragment(html);
  const original = find(parseFragment(fragment), (node) => node.tagName === "article");
  assert.equal(textContent(tree), textContent(original));
  assert.match(html, /<h2 id="heading">/);
  assert.match(html, /href="\.\.\/other\/"/);
  assert.match(html, /<pre><code>const x = 1;<\/code><\/pre>/);
  assert.match(html, /data-math-source="x\^2">x²<\/span>/);
  assert.match(html, /<u class="answer-reveal"><span data-ai-token=/);
  assert.match(html, /<td><span data-ai-token=/);
  assert.match(html, /<img src="image.webp">/);
  assert.ok(records.at(-1).tokens > 0);
  assert.equal(records.at(-1).blocks, decodedBlocks.length);
  assert.equal(records[0].version, 2);
  assert.deepEqual(data.slice(0, 5), TOKEN_MAGIC);
  assert.ok(records.some((record) => record.type === "dictionary"));
  assert.doesNotMatch(new TextDecoder().decode(data), /data-ai-token/);
  assert.ok(data.length < Buffer.byteLength(html), "Binary file should avoid repeated span markup");
});

test("binary framing handles every byte split, including variable integers and UTF-8", async () => {
  const bytes = data;
  let cursor = 0;
  const response = new Response(new ReadableStream({
    pull(controller) {
      if (cursor < bytes.length) controller.enqueue(bytes.slice(cursor, ++cursor));
      else controller.close();
    },
  }));
  const actual = [];
  for await (const record of readTokenRecords(response)) actual.push(record);
  assert.deepEqual(actual, records);
});

test("renders the first block before the response finishes", async () => {
  let controller;
  const body = new ReadableStream({ start(value) { controller = value; } });
  const enqueue = (record) => controller.enqueue(encodeTokenRecord(record));
  controller.enqueue(TOKEN_MAGIC);
  enqueue(records[0]);
  const stream = await openTokenStream(new Response(body));
  let first;
  const appeared = new Promise((resolve) => { first = resolve; });
  const consumed = stream.consume(first);
  const firstBlock = records.findIndex((record) => record.type === "block");
  for (const record of records.slice(1, firstBlock + 1)) enqueue(record);
  assert.equal(await appeared, decodedBlocks[0]);
  enqueue({ type: "end", blocks: 1,
    tokens: records[firstBlock].ops.reduce((sum, op) => sum + (op.ids?.length || 0), 0),
    dictionarySize: records.slice(1, firstBlock).reduce((sum, record) => sum + record.entries.length, 0),
  });
  controller.close();
  await consumed;
});

test("old text format, unknown tokenizer identities and HTTP errors reject", async () => {
  const unknown = structuredClone(records);
  unknown[0].tokenizer = "unknown";
  const unsupported = data.slice();
  unsupported[4] = 99;
  for (const response of [new Response("missing", { status: 404 }), new Response("<html>"),
    new Response('{"type":"page","version":1}\n'), new Response(unsupported), new Response(encodeTokenFile(unknown))]) {
    await assert.rejects(openTokenStream(response));
  }
});

test("truncation, mismatched counters and trailing frames reject", async () => {
  const invalid = [data.slice(0, -1), encodeTokenFile(records.slice(0, -1)),
    encodeTokenFile([...records, { type: "dictionary", entries: [] }])];
  for (const field of ["blocks", "tokens", "dictionarySize"]) {
    const copy = structuredClone(records);
    copy.at(-1)[field] += 1;
    invalid.push(encodeTokenFile(copy));
  }
  for (const bytes of invalid) {
    const stream = await openTokenStream(new Response(bytes));
    await assert.rejects(stream.consume(() => {}));
  }
});

test("local IDs reuse dictionary entries while retaining model IDs", async () => {
  const repeated = articleTokenStream('<meta data-freshmark-page><main><article class="prose"><p>有的放矢</p><p>有的放矢</p></article></main>');
  const actual = [];
  for await (const record of readTokenRecords(new Response(repeated))) actual.push(record);
  assert.deepEqual(actual.filter((record) => record.type === "dictionary").flatMap((record) => record.entries).map((entry) => entry.id), [97332, 144318]);
  const blocks = actual.filter((record) => record.type === "block");
  assert.deepEqual(blocks[0].ops, blocks[1].ops);
  assert.equal(actual.at(-1).tokens, 4);
});

test("invalid dictionary references and Unicode corrections reject before appending a block", async () => {
  const firstBlock = records.findIndex((record) => record.type === "block");
  for (const mutate of [
    (copy) => { copy[firstBlock].ops.find((op) => op.ids).ids[0] = 999999; },
    (copy) => { copy[firstBlock].ops.find((op) => op.ids).original = "wrong text"; },
    (copy) => { copy[1].entries.push(copy[1].entries[0]); },
  ]) {
    const copy = structuredClone(records);
    mutate(copy);
    const stream = await openTokenStream(new Response(encodeTokenFile(copy)));
    let appended = false;
    await assert.rejects(stream.consume(() => { appended = true; }));
    assert.equal(appended, false);
  }
});

test("unsigned variable-length integers have bounded canonical encodings", () => {
  for (const number of [0, 127, 128, 16383, 16384, 248044, 0xffffffff]) {
    const bytes = new BinaryWriter().uint(number).finish();
    assert.equal(new BinaryCursor(bytes).uint(), number);
    assert.ok(bytes.length <= 5);
  }
  for (const bytes of [[128], [128, 0], [255, 255, 255, 255, 16]]) assert.throws(() => new BinaryCursor(Uint8Array.from(bytes)).uint());
  assert.throws(() => new BinaryWriter().uint(-1));
  assert.throws(() => new BinaryWriter().uint(2 ** 32));
});

test("oversized frames and malformed lengths are rejected before allocating payloads", async () => {
  for (const prefix of [new BinaryWriter().uint(17 * 1024 * 1024).finish(), Uint8Array.of(128, 0)]) {
    const bytes = joinBytes([TOKEN_MAGIC, Uint8Array.of(1), prefix]);
    await assert.rejects(openTokenStream(new Response(bytes)));
  }
});

test("aborting a pending read cancels the underlying download", async () => {
  const abort = new AbortController();
  let cancelled = false;
  const response = new Response(new ReadableStream({ cancel() { cancelled = true; } }));
  const opening = openTokenStream(response, abort.signal);
  abort.abort();
  await assert.rejects(opening, { name: "AbortError" });
  assert.equal(cancelled, true);
});

test("abort between blocks prevents a stale article from appending more content", async () => {
  const abort = new AbortController();
  const stream = await openTokenStream(new Response(data), abort.signal);
  let appended = 0;
  await assert.rejects(stream.consume(() => { appended += 1; abort.abort(); }), { name: "AbortError" });
  assert.equal(appended, 1);
});
