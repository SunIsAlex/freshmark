import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");

test("build emits portable static pages", async () => {
  const files = [
    "public/index.html",
    "public/about/index.html",
    "public/posts/chemistry/babychem/overview-of-stereochemistry/index.html",
    "public/posts/chemistry/babychem/overview-of-stereochemistry/image.png",
    "public/search-index.json",
    "public/rss.xml",
    "public/sitemap.xml",
    "public/assets/styles.css",
    "public/assets/app.js",
  ];
  for (const file of files) {
    assert.equal((await stat(new URL(file, root))).isFile(), true, file);
  }
});

test("generated HTML has no application framework runtime", async () => {
  const html = await read("public/index.html");
  assert.match(html, /Search the archive/);
  assert.doesNotMatch(html, /\b(?:_next|__next|react(?:\.production)?\.min|vinext)\b/i);
});

test("articles render math and colocated Markdown images", async () => {
  const html = await read("public/posts/physics/basic-calculus-02/index.html");
  assert.match(html, /class="katex/);
  assert.match(html, /<img src="image\.png" alt="alt text"/);
  assert.doesNotMatch(html, /!\[alt text\]\(image\.png\)/);
  assert.equal((await stat(new URL("public/assets/katex.min.css", root))).isFile(), true);
  assert.equal((await stat(new URL("public/assets/fonts/KaTeX_Main-Regular.woff2", root))).isFile(), true);
});

test("articles pass through raw HTML, render level-one headings, and use the more excerpt", async () => {
  const html = await read("public/posts/chemistry/babychem/alcohol-to-halide-conversion-and-alcohol-elimination/index.html");
  assert.match(html, /<!--more-->/);
  assert.doesNotMatch(html, /&lt;!--more--&gt;/);
  assert.match(html, /<h1 id="parti">PartI:醇的取代<\/h1>/);
  assert.match(html, /<li>消除成烯烃<span class="katex">/);
  assert.doesNotMatch(html, /<p>\\text\{立体选择性\}/);

  const index = JSON.parse(await read("public/search-index.json"));
  const post = index.find(({ url }) => url.endsWith("/alcohol-to-halide-conversion-and-alcohol-elimination/"));
  assert.equal(post.summary, "本文是【基础有机化学 L9-3 补充你的知识盲区，你真的理解醇的取代和消除反应吗？】的学习笔记");
});

test("adjacent inline math delimiters do not become display math", async () => {
  const html = await read("public/posts/math/2022-labour-day/5-01-02/index.html");
  assert.doesNotMatch(html, /<p>[^<]*\\frac\{\\pi\}\{3\}/);
  assert.match(html, /annotation encoding="application\/x-tex">\(k\\in\\Z\)<\/annotation>/);
  assert.doesNotMatch(html, /<p>\(k\\in\\Z\)\$/);

  const displayHtml = await read("public/posts/math/2022-labour-day/5-01-01/index.html");
  assert.match(displayHtml, /得:<span class="katex-display">/);
});

test("frontmatter categories and tags are indexed and displayed", async () => {
  const index = JSON.parse(await read("public/search-index.json"));
  const post = index.find(({ url }) => url.endsWith("/physics/basic-calculus-02/"));
  assert.deepEqual(post.categories, ["物理"]);
  assert.deepEqual(post.tags, ["物理竞赛", "微积分"]);

  const html = await read("public/posts/physics/basic-calculus-02/index.html");
  assert.match(html, /<span>物理竞赛 · 微积分<\/span>/);
  assert.doesNotMatch(html, /<span>物理 · 物理竞赛/);

  const home = await read("public/index.html");
  assert.match(home, /data-tag="物理"/);
  assert.doesNotMatch(home, /data-tag="微积分"/);
});
