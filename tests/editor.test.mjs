import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { parser as markdownParser, GFM } from "@lezer/markdown";
import { composePost, counterpartFile, readPost, serializeField, splitFrontmatter, suggestSlug, translationLink, validatePost } from "../lib/frontmatter.mjs";
import { createPost, createTranslation, listPosts, loadPost, resolveContentPath, saveAsset, savePost } from "../lib/editor-store.mjs";
import { parseFrontmatter } from "../lib/markdown.mjs";
import { mathSyntax, mathSource } from "../editor/math.js";

const root = new URL("../", import.meta.url);
const contentDir = new URL("content/posts/", root).pathname;
const templateFile = new URL("templates/post.md", root).pathname;

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => (entry.isDirectory() ? markdownFiles(path.join(directory, entry.name)) : entry.name.endsWith(".md") ? [path.join(directory, entry.name)] : [])))).flat();
}

async function scratch() {
  const directory = await mkdtemp(path.join(os.tmpdir?.() || "/tmp", "freshmark-editor-"));
  return { directory, cleanup: () => rm(directory, { recursive: true, force: true }) };
}

test("saving an untouched post reproduces every existing file byte for byte", async () => {
  for (const file of await markdownFiles(contentDir)) {
    const source = await readFile(file, "utf8");
    const post = readPost(source, file);
    assert.equal(composePost({ source, data: post.data, body: post.body }), source.replaceAll("\r\n", "\n"), file);
  }
});

test("edited fields are rewritten while legacy keys keep their bytes and order", () => {
  const source = '---\ntitle: Old\nsubtitle: ""\ndate: 2026-05-03T17:48:02+08:00\nkeywords: ""\ntags: [a, b]\nhiddenFromFeed: false\n---\n\nBody text.\n';
  const { data, body } = readPost(source);
  const output = composePost({ source, body, data: { ...data, title: 'He said "hi" \\o/', tags: ["a", "b", "c"], draft: true } });
  assert.deepEqual(splitFrontmatter(output).entries.map((entry) => entry.key), ["title", "subtitle", "date", "keywords", "tags", "draft", "hiddenFromFeed"]);
  assert.match(output, /^subtitle: ""$/m);
  assert.match(output, /^date: 2026-05-03T17:48:02\+08:00$/m);
  const parsed = parseFrontmatter(output).data;
  assert.equal(parsed.title, 'He said "hi" \\o/');
  assert.deepEqual(parsed.tags, ["a", "b", "c"]);
  assert.equal(parsed.draft, true);
  assert.equal(parsed.featured, undefined, "default-valued fields are not added");
});

test("auto summaries follow the site's own summary rules", () => {
  const output = composePost({ source: '---\ntitle: "T"\ndate: "2026-10-04"\n---\n', body: "First paragraph with $x^2$.\n\n## Heading\n\nMore.", data: { title: "T", date: "2026-10-04" }, autoSummary: true });
  const { data } = readPost(output);
  assert.equal(data.summary.startsWith("First paragraph with $x^2$."), true);
  assert.equal(readPost(output).autoSummary, true);
});

test("scalars and lists survive quoting edge cases", () => {
  for (const value of ['plain', 'with "double"', "with 'single'", `both "x" and 'y'`, "back\\slash", "true", "[not, a, list]"]) {
    const yaml = serializeField("summary", value).join("\n");
    assert.equal(parseFrontmatter(`---\n${yaml}\n---\nx`).data.summary, value, value);
  }
  assert.deepEqual(parseFrontmatter(`---\n${serializeField("tags", ["a b", 'q"x', "数学"]).join("\n")}\n---\nx`).data.tags, ["a b", 'q"x', "数学"]);
});

test("translation files pair the way the build expects", () => {
  assert.equal(counterpartFile("math/x/index.md", "zh"), "math/x/index.en.md");
  assert.equal(counterpartFile("math/x/index.en.md", "en"), "math/x/index.md");
  assert.equal(counterpartFile("math/x/index.md", "en"), "math/x/index.zh.md");
  assert.deepEqual(translationLink("math/x/index.md", "zh"), { locale: "en", file: "math/x/index.en.md", alternate: "/en/posts/math/x/" });
  assert.equal(suggestSlug("Cauchy–Schwarz Inequality!"), "cauchy-schwarz-inequality");
  assert.equal(suggestSlug("柯西不等式", "2026-10-04"), "note-2026-10-04");
  assert.deepEqual(validatePost({ title: "", date: "2026-02-30x" }, "").map((issue) => issue.message), ["title", "date", "emptyBody"]);
});

test("the editor store creates, saves, links and guards posts", async () => {
  const { directory, cleanup } = await scratch();
  try {
    const { file } = await createPost(directory, { subject: "math", title: "Cauchy Notes", locale: "zh", templateFile, today: "2026-10-04" });
    assert.equal(file, "math/cauchy-notes/index.md");
    const created = await loadPost(directory, file);
    assert.equal(created.data.title, "Cauchy Notes");
    assert.equal(created.data.date, "2026-10-04");
    assert.equal(created.data.draft, true);
    assert.deepEqual(created.data.categories, ["数学"]);
    assert.equal(created.data.lang, "zh");
    await assert.rejects(createPost(directory, { subject: "math", title: "Again", slug: "cauchy-notes", templateFile }), { status: 409 });

    const saved = await savePost(directory, { file, data: { ...created.data, tags: ["不等式"] }, body: "Body $a^2$", baseHash: created.hash });
    assert.deepEqual(saved.data.tags, ["不等式"]);
    await assert.rejects(savePost(directory, { file, data: created.data, body: "stale", baseHash: created.hash }), { status: 409 });

    const { file: english } = await createTranslation(directory, file);
    assert.equal(english, "math/cauchy-notes/index.en.md");
    const [zh, en] = await Promise.all([loadPost(directory, file), loadPost(directory, english)]);
    assert.equal(zh.data.translationKey, "cauchy-notes");
    assert.equal(en.data.translationKey, "cauchy-notes");
    assert.equal(zh.data.alternate, "/en/posts/math/cauchy-notes/");
    assert.equal(en.data.alternate, "/posts/math/cauchy-notes/");
    assert.deepEqual(en.data.categories, ["Mathematics"]);
    assert.equal((await listPosts(directory)).every((post) => post.translated), true);

    const asset = await saveAsset(directory, file, "My Diagram (1).PNG", Buffer.from("png"));
    assert.equal(asset.name, "my-diagram-1.png");
    assert.equal((await saveAsset(directory, file, "My Diagram (1).PNG", Buffer.from("png"))).name, "my-diagram-1-2.png");
    await assert.rejects(saveAsset(directory, file, "evil.html", Buffer.from("x")), { status: 415 });
    for (const bad of ["../package.json", "math/../../x.md", "/etc/passwd", "math\\..\\..\\x.md"]) assert.throws(() => resolveContentPath(directory, bad, { extensions: [".md"] }), { status: 400 }, bad);
  } finally {
    await cleanup();
  }
});

test("the math grammar keeps formulas out of Markdown emphasis", () => {
  const parser = markdownParser.configure([GFM, mathSyntax]);
  const names = (text) => {
    const found = [];
    parser.parse(text).iterate({ enter: (node) => { found.push(node.name); } });
    return found;
  };
  assert.deepEqual(names("$a_1*b_1*c$ and *em*").filter((name) => ["InlineMath", "Emphasis"].includes(name)), ["InlineMath", "Emphasis"]);
  assert.ok(names("$$\n\\sum_{i=1}^n *x_i*\n$$\n").includes("BlockMath"));
  assert.ok(names("\\[ x \\]\n").includes("BlockMath"));
  assert.ok(names("Text \\(x\\) here").includes("InlineMath"));
  assert.ok(names("$\\begin{aligned}\na&=1\\\\\nb&=2\n\\end{aligned}$\n").includes("BlockMath"));
  assert.ok(!names("costs \\$5 and \\$6").includes("InlineMath"));
  assert.deepEqual(mathSource("$$x$$"), { source: "x", display: true });
});
