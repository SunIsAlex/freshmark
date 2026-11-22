import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parser as markdownParser, GFM } from "@lezer/markdown";
import { composePost, counterpartFile, readPost, serializeField, splitFrontmatter, suggestSlug, translationLink, validatePost } from "../lib/frontmatter.mjs";
import { createPost, createTranslation, listPosts, loadPost, movePost, normalizePostPath, resolveContentPath, saveAsset, savePost, vocabulary } from "../lib/editor-store.mjs";
import { gitCommit, gitStatus, parseStatus } from "../lib/editor-git.mjs";
import { execFileSync } from "node:child_process";
import { parseFrontmatter } from "../lib/markdown.mjs";
import { mathSyntax, mathSource } from "../editor/math.js";
import { svgSyntax, svgSource, isSafeSvgUrl, sanitizeSvgStyle, sanitizeSvgElement } from "../editor/svg.js";

const root = new URL("../", import.meta.url);
const contentDir = fileURLToPath(new URL("content/posts/", root));
const templateFile = fileURLToPath(new URL("templates/post.md", root));

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

test("new posts take a chosen folder, slug, file name and tags", async () => {
  const { directory, cleanup } = await scratch();
  try {
    const nested = await createPost(directory, { folder: "math/2027-plan", slug: "05-Limits", filename: "index.md", title: "极限", tags: ["数列", " 极限 ", "数列"], templateFile, today: "2026-10-05" });
    assert.equal(nested.file, "math/2027-plan/05-Limits/index.md");
    const post = await loadPost(directory, nested.file);
    assert.deepEqual(post.data.tags, ["数列", "极限"]);
    assert.deepEqual(post.data.categories, ["数学"]);
    const single = await createPost(directory, { folder: "chemistry/organic", slug: "", filename: "aldol.md", title: "Aldol", locale: "en", templateFile });
    assert.equal(single.file, "chemistry/organic/aldol.md");
    assert.deepEqual((await loadPost(directory, single.file)).data.categories, ["Chemistry"]);
    await assert.rejects(createPost(directory, { folder: "chemistry/organic", slug: "", filename: "aldol.md", title: "Again", templateFile }), { status: 409 });
    await assert.rejects(createPost(directory, { folder: "math", slug: "", filename: "index.md", title: "x", templateFile }), { status: 400 });
    for (const bad of [{ folder: "math/../..", slug: "x" }, { folder: "Math", slug: "x" }, { folder: "math", slug: ".hidden" }, { folder: "math", slug: "x", filename: "index.html" }, { folder: "math", slug: "a:b" }]) {
      await assert.rejects(createPost(directory, { title: "Bad", templateFile, ...bad }), { status: 400 }, JSON.stringify(bad));
    }
    assert.equal(normalizePostPath(" /math/x/index.md/ "), "math/x/index.md");
    assert.deepEqual((await vocabulary(directory)).folders, ["chemistry", "chemistry/organic", "math", "math/2027-plan", "math/2027-plan/05-Limits"]);
  } finally {
    await cleanup();
  }
});

test("moving a post carries its folder, images and translation and fixes links", async () => {
  const { directory, cleanup } = await scratch();
  try {
    const { file } = await createPost(directory, { folder: "math", slug: "old-name", title: "Old", templateFile });
    await createTranslation(directory, file);
    await saveAsset(directory, file, "figure.png", Buffer.from("png"));
    const moved = await movePost(directory, { file, to: "math/series/new-name/index.md" });
    assert.equal(moved.file, "math/series/new-name/index.md");
    assert.deepEqual(moved.moved.map(([, to]) => to).sort(), ["math/series/new-name/index.en.md", "math/series/new-name/index.md"]);
    assert.ok(await stat(path.join(directory, "math/series/new-name/figure.png")));
    await assert.rejects(stat(path.join(directory, "math/old-name")));
    const [zh, en] = await Promise.all([loadPost(directory, moved.file), loadPost(directory, "math/series/new-name/index.en.md")]);
    assert.equal(zh.data.alternate, "/en/posts/math/series/new-name/");
    assert.equal(en.data.alternate, "/posts/math/series/new-name/");
    assert.equal(zh.data.translationKey, "old-name", "the pairing key is kept");

    const renamed = await movePost(directory, { file: "math/series/new-name/index.en.md", to: "math/series/new-name/notes.md" });
    assert.deepEqual(renamed.moved, [["math/series/new-name/index.en.md", "math/series/new-name/notes.md"]]);

    const other = await createPost(directory, { folder: "math", slug: "other", title: "Other", templateFile });
    await assert.rejects(movePost(directory, { file: other.file, to: "math/series/new-name/index.md" }), { status: 409 }, "existing folder");
    await assert.rejects(movePost(directory, { file: other.file, to: "math/other/inner/index.md" }), { status: 400 }, "into itself");
    await assert.rejects(movePost(directory, { file: other.file, to: "../x/index.md" }), { status: 400 });
    await createPost(directory, { folder: "math/series/new-name", slug: "child", title: "Child", templateFile });
    await assert.rejects(movePost(directory, { file: moved.file, to: "math/elsewhere/index.md" }), { status: 409 }, "folder holding another post");
    assert.deepEqual(await movePost(directory, { file: other.file, to: other.file }), { file: other.file, moved: [] });
  } finally {
    await cleanup();
  }
});

test("git status lists only content changes and commit pushes the chosen files", async () => {
  const { directory, cleanup } = await scratch();
  const run = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  try {
    const remote = path.join(directory, "remote.git");
    const repo = path.join(directory, "repo");
    run(directory, "init", "--quiet", "--bare", "--initial-branch=main", remote);
    run(directory, "init", "--quiet", "--initial-branch=main", repo);
    run(repo, "config", "user.name", "Test");
    run(repo, "config", "user.email", "test@example.com");
    run(repo, "remote", "add", "origin", remote);
    const content = path.join(repo, "content", "posts");
    await mkdir(content, { recursive: true });
    await writeFile(path.join(repo, "README.md"), "x");
    run(repo, "add", "README.md");
    run(repo, "commit", "--quiet", "-m", "init");

    const { file } = await createPost(content, { folder: "math", slug: "git-post", title: "Git 文章", templateFile });
    await writeFile(path.join(content, "math", "git-post", "index.md.bak"), "backup");
    await writeFile(path.join(repo, "outside.txt"), "not content");
    const status = await gitStatus(content);
    assert.equal(status.available, true);
    assert.equal(status.branch, "main");
    assert.equal(status.upstream, null);
    assert.equal(status.remote, "origin");
    assert.deepEqual(status.changes.map((change) => [change.file, change.change]).sort(), [["math/git-post/index.md", "added"], ["math/git-post/index.md.bak", "added"]]);

    await assert.rejects(gitCommit(content, { files: ["../../outside.txt"], message: "x" }), { status: 400 });
    await assert.rejects(gitCommit(content, { files: [file], message: "  " }), { status: 400 });
    const result = await gitCommit(content, { files: [file], message: "Add a post\n\nWith a body.", push: true });
    assert.equal(result.commit.subject, "Add a post");
    assert.equal(result.pushed.ok, true, result.pushed.error);
    assert.equal(result.status.upstream, "origin/main");
    assert.deepEqual(result.status.changes.map((change) => change.file), ["math/git-post/index.md.bak"], "unselected files stay uncommitted");
    assert.match(run(remote, "log", "-1", "--format=%s%n%b", "main"), /^Add a post\nWith a body\./);
    assert.equal(run(remote, "show", "--name-only", "--format=", "main").trim(), "content/posts/math/git-post/index.md");

    await movePost(content, { file, to: "math/renamed/index.md" });
    const afterMove = await gitStatus(content);
    const paths = afterMove.changes.map((change) => change.file).filter((name) => !name.endsWith(".bak")).sort();
    assert.deepEqual(paths, ["math/git-post/index.md", "math/renamed/index.md"]);
    const committed = await gitCommit(content, { files: paths, message: "Move the post" });
    assert.equal(committed.pushed, null);
    assert.equal(committed.status.ahead, 1);
    const pushOnly = await gitCommit(content, { files: [], push: true });
    assert.equal(pushOnly.commit, null);
    assert.equal(pushOnly.pushed.ok, true);
    assert.equal(pushOnly.status.ahead, 0);
    assert.equal(run(repo, "status", "--porcelain", "--", "outside.txt").trim(), "?? outside.txt");
    assert.deepEqual(parseStatus("R  new.md\0old.md\0?? a b.md\0 D gone.md\0"), [
      { code: "R ", path: "new.md", from: "old.md", change: "renamed" }, { code: "??", path: "a b.md", change: "added" }, { code: " D", path: "gone.md", change: "deleted" },
    ]);
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

test("the svg grammar parses block, inline, nested, quoted and unclosed SVGs cleanly", async () => {
  const parser = markdownParser.configure([GFM, mathSyntax, svgSyntax]);
  const collect = (text) => {
    const nodes = [];
    parser.parse(text).iterate({ enter: (node) => { nodes.push({ name: node.name, from: node.from, to: node.to, text: text.slice(node.from, node.to) }); } });
    return nodes;
  };
  const names = (text) => collect(text).map((node) => node.name);

  // Self-contained multi-line <svg> with blank lines and comments inside
  const blankLineFixture = "## Stem\n\nText $x^2$.\n\n<svg viewBox=\"0 0 100 100\">\n  <!-- comment -->\n\n  <circle cx=\"50\" cy=\"50\" r=\"20\" />\n\n</svg>\n";
  const fixtureNodes = collect(blankLineFixture);
  assert.equal(fixtureNodes.filter((node) => node.name === "SvgBlock").length, 1);
  assert.ok(fixtureNodes.some((node) => node.name === "SvgClose"));
  assert.equal(fixtureNodes.filter((node) => node.name === "Paragraph").length, 1, "only the stem is a paragraph");
  assert.ok(!fixtureNodes.some((node) => node.name === "HTMLBlock"));
  assert.ok(!fixtureNodes.some((node) => node.name === "CommentBlock"));

  // Live angle-bisector post parses every <svg> cleanly without HTMLBlock/CommentBlock splits
  const angleBisector = await readFile(path.join(contentDir, "math", "angle-bisector", "index.md"), "utf8");
  const { body } = readPost(angleBisector);
  const postNodes = collect(body);
  assert.ok(postNodes.filter((node) => node.name === "SvgBlock").length >= 1);
  assert.equal(postNodes.filter((node) => node.name === "SvgBlock").length, postNodes.filter((node) => node.name === "SvgClose").length);
  assert.ok(!postNodes.some((node) => node.name === "HTMLBlock"));
  assert.ok(!postNodes.some((node) => node.name === "CommentBlock"));

  // Single-line and self-closing SvgBlock
  assert.deepEqual(names("<svg viewBox=\"0 0 10 10\"><circle cx=\"5\" cy=\"5\" r=\"4\"/></svg>\n").filter((n) => n !== "Document"), ["SvgBlock", "SvgClose"]);
  assert.deepEqual(names("<svg viewBox=\"0 0 10 10\" />\n").filter((n) => n !== "Document"), ["SvgBlock", "SvgClose"]);

  // Nested <svg>, comments, CDATA, and multi-line opening tag
  const complex = "<svg\n  viewBox=\"0 0 20 20\"\n  data-hint=\">\">\n  <!-- </svg> -->\n  <![CDATA[</svg>]]>\n  <svg width=\"10\" height=\"10\"><rect/></svg>\n  <svg/>\n</svg>\n\nAfter.\n";
  const complexNodes = collect(complex);
  assert.equal(complexNodes.filter((n) => n.name === "SvgBlock").length, 1);
  assert.equal(complexNodes.find((n) => n.name === "SvgBlock").text.trimEnd().endsWith("</svg>"), true);
  assert.equal(complexNodes.filter((n) => n.name === "Paragraph").length, 1);

  // Interrupts a paragraph without a blank line (endLeaf)
  const afterPara = "Diagram:\n<svg viewBox=\"0 0 10 10\">\n<circle cx=\"5\" cy=\"5\" r=\"4\"/>\n</svg>\n";
  assert.deepEqual(names(afterPara).filter((n) => ["Paragraph", "SvgBlock", "SvgClose"].includes(n)), ["Paragraph", "SvgBlock", "SvgClose"]);

  // Inline SVG mid-paragraph and at line start with trailing text
  assert.ok(names("Icon <svg width=\"12\" height=\"12\"><circle cx=\"6\" cy=\"6\" r=\"5\"/></svg> inline.").includes("InlineSvg"));
  const inlineStart = "<svg width=\"12\" height=\"12\"><circle cx=\"6\" cy=\"6\" r=\"5\"/></svg> trailing text";
  assert.deepEqual(names(inlineStart).filter((n) => ["Paragraph", "InlineSvg", "SvgBlock"].includes(n)), ["Paragraph", "InlineSvg"]);

  // Fenced code blocks and inline code stay code, never rendered as SVG
  assert.ok(!names("```svg\n<svg><circle/></svg>\n```\n").some((n) => n === "SvgBlock" || n === "InlineSvg"));
  assert.ok(!names("```html\n<svg><circle/></svg>\n```\n").some((n) => n === "SvgBlock" || n === "InlineSvg"));
  assert.ok(!names("Use `<svg><circle/></svg>` in prose.").some((n) => n === "SvgBlock" || n === "InlineSvg"));

  // Unclosed <svg> does not produce SvgClose or InlineSvg
  const unclosedBlock = names("<svg viewBox=\"0 0 10 10\">\n<circle/>\n");
  assert.ok(unclosedBlock.includes("SvgBlock"));
  assert.ok(!unclosedBlock.includes("SvgClose"));
  assert.ok(!names("Text <svg> unclosed").includes("InlineSvg"));

  // Blockquote <svg> and svgSource quote stripping
  const quoted = "> <svg viewBox=\"0 0 10 10\">\n>   <circle/>\n> </svg>\n";
  const quotedNodes = collect(quoted);
  assert.ok(quotedNodes.some((n) => n.name === "Blockquote"));
  assert.ok(quotedNodes.some((n) => n.name === "SvgBlock"));
  assert.ok(quotedNodes.some((n) => n.name === "SvgClose"));
  assert.equal(svgSource(quotedNodes.find((n) => n.name === "SvgBlock").text, true), "<svg viewBox=\"0 0 10 10\">\n  <circle/>\n</svg>");
});

test("svg URL, style and element sanitizers strip XSS vectors and preserve safe SVG", () => {
  assert.equal(isSafeSvgUrl("#axis-arrow", { fragmentOnly: true }), true);
  assert.equal(isSafeSvgUrl("https://example.com/a.svg", { fragmentOnly: true }), false);
  assert.equal(isSafeSvgUrl("javascript:alert(1)"), false);
  assert.equal(isSafeSvgUrl("  java\u0000script:alert(1)"), false);
  assert.equal(isSafeSvgUrl("vbscript:msgbox(1)"), false);
  assert.equal(isSafeSvgUrl("data:text/html,<script>alert(1)</script>", { allowImageData: true }), false);
  assert.equal(isSafeSvgUrl("data:image/svg+xml,<svg onload=alert(1)>", { allowImageData: true }), false);
  assert.equal(isSafeSvgUrl("data:image/png;base64,iVBORw0KGgo=", { allowImageData: true }), true);
  assert.equal(isSafeSvgUrl("data:image/png;base64,iVBORw0KGgo=", { allowImageData: false }), false);
  assert.equal(isSafeSvgUrl("https://example.com/a.png"), true);
  assert.equal(isSafeSvgUrl("mailto:user@example.com", { allowImageData: false }), true);
  assert.equal(isSafeSvgUrl("diagram.png"), true);

  assert.equal(
    sanitizeSvgStyle("@import url(https://evil.com); fill: url(#grad); stroke: url('https://evil.com/s'); behavior: url(#bad); color: currentColor;"),
    " fill: url(#grad); stroke: none;  color: currentColor;",
  );
  assert.equal(sanitizeSvgStyle("width: expression(alert(1)); background: javascript:alert(1)"), "width: ; background: alert(1)");

  const SVG_NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, children = [], namespaceURI = SVG_NS) => {
    const node = {
      nodeType: 1,
      localName: tag.toLowerCase(),
      tagName: tag,
      namespaceURI,
      attributes: Object.entries(attrs).map(([name, value]) => ({ name, localName: name.includes(":") ? name.split(":")[1] : name, value, namespaceURI: name.startsWith("xlink:") ? "http://www.w3.org/1999/xlink" : null })),
      childNodes: [],
      textContent: "",
      getAttribute(name) { return this.attributes.find((a) => a.name.toLowerCase() === name.toLowerCase())?.value ?? null; },
      setAttribute(name, value) {
        const existing = this.attributes.find((a) => a.name.toLowerCase() === name.toLowerCase());
        if (existing) existing.value = String(value);
        else this.attributes.push({ name, localName: name, value: String(value), namespaceURI: null });
      },
      removeAttribute(name) { this.attributes = this.attributes.filter((a) => a.name.toLowerCase() !== name.toLowerCase()); },
      removeAttributeNS(_ns, localName) { this.attributes = this.attributes.filter((a) => a.localName !== localName); },
      removeChild(child) { this.childNodes = this.childNodes.filter((c) => c !== child); },
    };
    for (const child of children) {
      if (typeof child === "string") node.textContent += child;
      else node.childNodes.push(child);
    }
    return node;
  };

  const scriptEl = el("script", {}, ["alert(1)"]);
  const foreignEl = el("foreignObject", {}, [el("div", {}, [], "http://www.w3.org/1999/xhtml")]);
  const badSet = el("set", { attributeName: "onload", to: "alert(1)" });
  const badAnimate = el("animate", { attributeName: "href", values: "javascript:alert(1)" });
  const goodAnimate = el("animate", { attributeName: "opacity", from: "0", to: "1" });
  const badUse = el("use", { "xlink:href": "https://evil.com/x.svg#id" });
  const goodUse = el("use", { href: "#shape" });
  const badImg = el("image", { href: "data:image/svg+xml,<svg/>" });
  const goodImg = el("image", { href: "data:image/png;base64,AAAA" });
  const badLink = el("a", { href: "javascript:alert(1)" });
  const styleEl = el("style", {}, ["@import 'https://evil.com'; .axis { stroke: currentColor; marker-end: url(#axis-arrow); }"]);
  const pathEl = el("path", { d: "M 0 0 L 10 10", stroke: "currentColor", "marker-end": "url(#axis-arrow)", onclick: "alert(1)" });
  const svg = el("svg", { viewBox: "0 0 100 100", onload: "alert(1)", style: "background: url(https://evil.com); color: currentColor" }, [
    scriptEl, foreignEl, badSet, badAnimate, goodAnimate, badUse, goodUse, badImg, goodImg, badLink, styleEl, pathEl,
  ]);

  sanitizeSvgElement(svg);

  assert.equal(svg.getAttribute("onload"), null);
  assert.equal(svg.getAttribute("viewBox"), "0 0 100 100");
  assert.equal(svg.getAttribute("style"), "background: none; color: currentColor");
  assert.ok(!svg.childNodes.includes(scriptEl));
  assert.ok(!svg.childNodes.includes(foreignEl));
  assert.ok(!svg.childNodes.includes(badSet));
  assert.ok(!svg.childNodes.includes(badAnimate));
  assert.ok(svg.childNodes.includes(goodAnimate));
  assert.equal(badUse.getAttribute("xlink:href"), null);
  assert.equal(goodUse.getAttribute("href"), "#shape");
  assert.equal(badImg.getAttribute("href"), null);
  assert.equal(goodImg.getAttribute("href"), "data:image/png;base64,AAAA");
  assert.equal(badLink.getAttribute("href"), null);
  assert.equal(styleEl.textContent, " .axis { stroke: currentColor; marker-end: url(#axis-arrow); }");
  assert.equal(pathEl.getAttribute("onclick"), null);
  assert.equal(pathEl.getAttribute("marker-end"), "url(#axis-arrow)");
});
