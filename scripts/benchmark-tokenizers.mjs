import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { parseFragment } from "parse5";
import { encode } from "gpt-tokenizer/encoding/o200k_base";
import { createHfTokenizer } from "../lib/hf-tokenizer.mjs";
import { tokenGroups } from "../lib/token-groups.mjs";

const candidates = [
  { id: "qwen3", model: "Qwen/Qwen3-8B", revision: "b968826d9c46dd6066d109eabc6255188de91218" },
  { id: "qwen35", model: "Qwen/Qwen3.5-9B", revision: "c202236235762e1c871ad0ccb60c8ee5ba337b9a" },
  { id: "deepseek", model: "deepseek-ai/DeepSeek-V3.2", revision: "a7e62ac04ecb2c0a54d736dc46601c5606cf10a6" },
  { id: "glm", model: "zai-org/GLM-4.5", revision: "cbb2c7cfb52fa128a9660cb1a7a78e017899e115" },
];
const root = new URL("../", import.meta.url);
const directory = new URL(".freshmark-cache/tokenizer-benchmark/", root);
await mkdir(directory, { recursive: true });
const hash = (value) => createHash("sha256").update(value).digest("hex");
async function asset(candidate, name) {
  const file = new URL(`${candidate.id}-${name}`, directory);
  let data;
  try { data = await readFile(file); } catch {
    const response = await fetch(`https://huggingface.co/${candidate.model}/resolve/${candidate.revision}/${name}`, { signal: AbortSignal.timeout(120000) });
    if (!response.ok) throw new Error(`${candidate.model}/${name}: ${response.status}`);
    data = Buffer.from(await response.arrayBuffer());
    JSON.parse(data);
    await writeFile(file, data);
  }
  return { data: JSON.parse(data), sha256: hash(data) };
}

const corpus = [];
const files = (await readdir(new URL("public/", root), { recursive: true })).filter((file) => /(?:^|\/)posts\/.+\/page\.html$/.test(file)).sort();
if (!files.length) throw new Error("Run npm run build before benchmarking");
const excluded = new Set(["script", "style", "noscript", "template", "code", "pre", "svg", "math", "textarea"]);
for (const file of files) {
  const doc = parseFragment(await readFile(new URL(`public/${file}`, root), "utf8"));
  function walk(node, inProse = false) {
    const attr = (name) => node.attrs?.find((item) => item.name === name)?.value;
    if (excluded.has(node.tagName) || attr("class")?.split(/\s+/).includes("math-expression") || attr("aria-hidden") === "true") return;
    inProse ||= node.tagName === "article" && attr("class") === "prose";
    if (inProse && node.nodeName === "#text" && node.value.trim()) corpus.push({ file, text: node.value, locale: file.startsWith("en/") ? "en" : "zh" });
    node.childNodes?.forEach((child) => walk(child, inProse));
  }
  walk(doc);
}
const fixtureBytes = await readFile(new URL("tests/fixtures/tokenizer-evaluation.json", root));
const fixtures = JSON.parse(fixtureBytes);
const samples = Object.entries(fixtures).filter(([key]) => key !== "stress").flatMap(([category, words]) => words.map((word) => {
  const found = corpus.find((entry) => entry.locale === "zh" && entry.text.includes(word));
  return { category, word, text: found?.text || `这里提到${word}，请结合上下文理解。`, source: found?.file || "synthetic-context" };
}));
const vocabulary = new Map((await readFile(new URL(import.meta.resolve("gpt-tokenizer/data/o200k_base.tiktoken")), "utf8")).trim().split("\n").map((line) => {
  const [bytes, id] = line.split(" "); return [Number(id), Buffer.from(bytes, "base64")];
}));
const results = [];
for (const candidate of [{ id: "o200k_base", model: "gpt-tokenizer/o200k_base", revision: "4.0.0" }, ...candidates]) {
  console.log(`Evaluating ${candidate.model}...`);
  const start = performance.now();
  let engine;
  const checksums = {};
  if (candidate.id === "o200k_base") engine = { encode: (text) => encode(text, { disallowedSpecial: new Set() }), bytes: (id) => vocabulary.get(id) };
  else {
    const json = await asset(candidate, "tokenizer.json");
    const config = await asset(candidate, "tokenizer_config.json");
    checksums.tokenizer = json.sha256;
    checksums.config = config.sha256;
    engine = createHfTokenizer(json.data, config.data);
  }
  const loadMs = performance.now() - start;
  function evaluate(text) {
    const ids = engine.encode(text);
    const bytes = ids.map((id) => engine.bytes(id));
    const reconstructed = Buffer.concat(bytes).toString("utf8");
    if (reconstructed !== text && reconstructed !== text.normalize("NFC")) throw new Error(`${candidate.id} cannot reconstruct original text: ${JSON.stringify(text.slice(0, 100))}`);
    return { ids, bytes, reconstructed };
  }
  const details = samples.map((sample) => {
    const { bytes, reconstructed } = evaluate(sample.text);
    const at = reconstructed.indexOf(sample.word);
    const left = Buffer.byteLength(reconstructed.slice(0, at));
    const right = left + Buffer.byteLength(sample.word);
    let offset = 0;
    const pieces = [];
    for (const part of bytes) {
      if (offset < right && offset + part.length > left) {
        // Do not put replacement characters into the report for a valid token
        // that contains only part of a UTF-8 character.
        const decoded = part.toString("utf8");
        pieces.push(Buffer.from(decoded).equals(part) ? decoded : `[bytes:${part.toString("hex")}]`);
      }
      offset += part.length;
    }
    const from = sample.text.indexOf(sample.word);
    let characterOffset = 0;
    const displayPieces = tokenGroups(sample.text, engine).filter((group) => {
      const overlaps = characterOffset < from + sample.word.length && characterOffset + group.text.length > from;
      characterOffset += group.text.length;
      return overlaps;
    });
    return { ...sample, whole: pieces.length === 1 && pieces[0] === sample.word, standaloneWhole: evaluate(sample.word).ids.length === 1, pieces, displayPieces };
  });
  for (const text of fixtures.stress) {
    evaluate(text);
    if (tokenGroups(text, engine).map((group) => group.text).join("") !== text) throw new Error(`${candidate.id} changed displayed Unicode text`);
  }
  const totals = { zh: { tokens: 0, characters: 0, nodes: 0 }, en: { tokens: 0, characters: 0, nodes: 0 } };
  const corpusStart = performance.now();
  for (const entry of corpus) {
    const { ids } = evaluate(entry.text);
    const total = totals[entry.locale];
    total.tokens += ids.length;
    total.characters += [...entry.text].length;
    total.nodes += 1;
  }
  const result = { ...candidate, checksums, loadMs, corpusMs: performance.now() - corpusStart, totals,
    wholeIdioms: details.filter((sample) => sample.category === "idioms" && sample.whole).length,
    wholeTerms: details.filter((sample) => sample.category === "terms" && sample.whole).length,
    standaloneIdioms: details.filter((sample) => sample.category === "idioms" && sample.standaloneWhole).length,
    standaloneTerms: details.filter((sample) => sample.category === "terms" && sample.standaloneWhole).length,
    pieces: details.reduce((sum, sample) => sum + sample.pieces.length, 0), details };
  results.push(result);
  console.log(JSON.stringify({ model: result.model, idioms: result.wholeIdioms, terms: result.wholeTerms, standalone: result.standaloneIdioms + result.standaloneTerms, pieces: result.pieces, corpusMs: Math.round(result.corpusMs), chineseTokens: totals.zh.tokens, example: details.find((sample) => sample.word === "有的放矢").displayPieces.map((group) => group.text) }));
  await writeFile(new URL("results.json", directory), JSON.stringify({ fixtureSha256: hash(fixtureBytes), corpusSha256: hash(JSON.stringify(corpus)), articles: files.length, contextualSamples: samples.filter((sample) => sample.source !== "synthetic-context").length, results }, null, 2) + "\n");
}
results.sort((a, b) => (b.wholeIdioms + b.wholeTerms) - (a.wholeIdioms + a.wholeTerms) || b.wholeIdioms - a.wholeIdioms || a.pieces - b.pieces || a.totals.zh.tokens - b.totals.zh.tokens);
console.log(`Selected: ${results[0].model}; criterion: most intact words in 60 idioms + 60 terms, then intact idioms, then fewer splits.`);
