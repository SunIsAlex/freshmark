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
    "public/posts/chemistry/babychem/overview-of-stereochemistry/index.md",
    "public/posts/chemistry/babychem/overview-of-stereochemistry/image.png",
    "public/search-index.json",
    "public/rss.xml",
    "public/sitemap.xml",
    "public/assets/styles.css",
    "public/assets/app.js",
    "public/manifest.webmanifest",
    "public/icons/icon-192.png",
    "public/icons/icon-512.png",
    "public/icons/apple-touch-icon.png",
    "public/sw.js",
    "public/version.json",
  ];
  for (const file of files) {
    assert.equal((await stat(new URL(file, root))).isFile(), true, file);
  }
});

test("site is installable as a progressive web app", async () => {
  const html = await read("public/index.html");
  assert.match(html, /<link[^>]+href="\/manifest\.webmanifest"[^>]+rel="manifest"/);
  assert.match(html, /<meta[^>]+content="#19332d"[^>]+name="theme-color"/);
  assert.match(html, /<link[^>]+href="\/icons\/apple-touch-icon\.png"[^>]+rel="apple-touch-icon"/);

  const manifest = JSON.parse(await read("public/manifest.webmanifest"));
  assert.equal(manifest.name, "Freshmark");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.icons.some(({ sizes }) => sizes === "192x192"), true);
  assert.equal(manifest.icons.some(({ sizes }) => sizes === "512x512"), true);
});

test("generated HTML has no application framework runtime", async () => {
  const html = await read("public/index.html");
  assert.match(html, /Search the archive/);
  assert.doesNotMatch(html, /\b(?:_next|__next|react(?:\.production)?\.min|vinext)\b/i);
});

test("articles render math and colocated Markdown images", async () => {
  const html = await read("public/posts/physics/basic-calculus-02/index.html");
  assert.match(html, /\\\[\\int f\(x\)dx=F\(x\)\+C\\\]/);
  assert.doesNotMatch(html, /class="katex/);
  assert.match(html, /<img[^>]*src="image\.png"[^>]*>/);
  assert.match(html, /<img[^>]*alt="alt text"[^>]*>/);
  assert.doesNotMatch(html, /!\[alt text\]\(image\.png\)/);
  assert.equal((await stat(new URL("public/assets/katex.min.css", root))).isFile(), true);
  assert.equal((await stat(new URL("public/assets/katex.min.js", root))).isFile(), true);
  assert.equal((await stat(new URL("public/assets/mhchem.min.js", root))).isFile(), true);
  assert.equal((await stat(new URL("public/assets/auto-render.min.js", root))).isFile(), true);
  assert.equal((await stat(new URL("public/assets/fonts/KaTeX_Main-Regular.woff2", root))).isFile(), true);

  const titledImageHtml = await read("public/posts/chemistry/babychem/overview-of-stereochemistry/index.html");
  assert.match(titledImageHtml, /<img[^>]*src="image\.png"[^>]*title="关于电负性\/杂化的综合判断"[^>]*>/);

  const spacedImageHtml = await read("public/posts/physics/celestial-movement/index.html");
  assert.match(spacedImageHtml, /<img[^>]*src="Screenshot%20From%202026-06-17%2020-47-25\.png"/);
  assert.doesNotMatch(spacedImageHtml, /src="&lt;Screenshot/);
});

test("standalone boxed formulas become scrollable display math", async () => {
  const html = await read("public/posts/math/focal-chord-length-formula/index.html");
  assert.match(html, /\\\[\\boxed\{\\frac\{2ab\^2\}/);
  assert.doesNotMatch(html, /\\\(\\boxed\{\\frac\{2ab\^2\}/);
  assert.match(html, /<table>[\s\S]*<thead>[\s\S]*<th>字母<\/th>[\s\S]*<th>含义<\/th>[\s\S]*<tbody>/);
  assert.match(html, /<td>\\\(\\theta\\\)<\/td>[\s\S]*<td>直线的倾斜角<\/td>/);
  assert.doesNotMatch(html, /<p>\|字母\|含义\|/);

  const css = await read("public/assets/styles.css");
  assert.match(css, /\.prose \.katex-display\{[^}]*overflow-x:auto/);
  assert.match(css, /\.prose \.katex-display>\.katex\{min-width:max-content}/);
});

test("articles pass through raw HTML, render level-one headings, and use the more excerpt", async () => {
  const html = await read("public/posts/chemistry/babychem/alcohol-to-halide-conversion-and-alcohol-elimination/index.html");
  assert.match(html, /<!--more-->/);
  assert.doesNotMatch(html, /&lt;!--more--&gt;/);
  assert.match(html, /<h1 id="parti醇的取代">PartI:醇的取代<\/h1>/);
  assert.match(html, /<li>消除成烯烃\\\(\\begin\{cases\}/);
  assert.doesNotMatch(html, /<p>\\text\{立体选择性\}/);

  const index = JSON.parse(await read("public/search-index.json"));
  const post = index.find(({ url }) => url.endsWith("/alcohol-to-halide-conversion-and-alcohol-elimination/"));
  assert.equal(post.summary, "本文是【基础有机化学 L9-3 补充你的知识盲区，你真的理解醇的取代和消除反应吗？】的学习笔记");
});

test("math placeholders never leak into heading links", async () => {
  const html = await read("public/posts/physics/basic-calculus-01/index.html");
  assert.match(html, /id="例由定义推导"/);
  assert.match(html, /href="#例由定义推导"/);
  assert.doesNotMatch(html, /FRESHMARKMATH/i);
});

test("adjacent inline math delimiters do not become display math", async () => {
  const html = await read("public/posts/math/2022-labour-day/5-01-02/index.html");
  assert.match(html, /即\\\(x=2k\\pi\\\)或\\\(x=\\frac\{\\pi\}\{3\}\+2k\\pi\\\)/);
  assert.match(html, /\\\(\(k\\in\\Z\)\\\)/);
  assert.doesNotMatch(html, /\$\$\(k\\in\\Z\)/);

  const displayHtml = await read("public/posts/math/2022-labour-day/5-01-01/index.html");
  assert.match(displayHtml, /得:\\\[/);
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

test("client enhances internal links with SPA navigation", async () => {
  const app = await read("theme/app.js");
  const bundle = await read("public/assets/app.js");
  assert.ok(bundle.length > 10_000);
  assert.match(app, /history\.pushState/);
  assert.match(app, /addEventListener\("popstate"/);
  assert.match(app, /DOMParser/);
  assert.match(app, /renderMathInElement/);
  assert.match(app, /renderMath\(nextMain\)/);
  assert.match(app, /index\.md/);
  assert.match(app, /currentMain\.replaceWith\(nextMain\)/);
  assert.match(app, /rebaseMainUrls\(nextMain, url\)/);
  assert.match(app, /new URL\(value, pageUrl\)\.href/);
  assert.match(app, /location\.href = url\.href/);
  assert.match(app, /connection\?\.type !== "cellular"/);
  assert.match(app, /!connection\?\.saveData/);
  assert.match(app, /\["slow-2g", "2g", "3g"\]/);
  assert.match(app, /requestIdleCallback/);
  assert.match(app, /scheduleArticlePrefetch\(nextMain\)/);
  assert.match(app, /function scrollToHash/);
  assert.match(app, /document\.getElementById\(id\)/);
  assert.match(app, /target\.scrollIntoView/);
  assert.match(app, /=== renderedRoute/);
  assert.match(app, /function toggleToc/);
  assert.match(app, /data-toc-toggle/);
  assert.match(app, /toc-level-\$\{heading\.level\}/);
  assert.match(app, /navigator\.serviceWorker\.register/);
  assert.match(app, /updateViaCache: "none"/);
});

test("service worker versions and persists generated resources", async () => {
  const { version } = JSON.parse(await read("public/version.json"));
  const worker = await read("public/sw.js");
  assert.match(version, /^[a-f0-9]{16}$/);
  assert.match(worker, new RegExp(`const VERSION="${version}"`));
  assert.match(worker, /\.startsWith\("freshmark-"\)/);
  assert.match(worker, /\.endsWith\("\.md"\)/);
  assert.match(worker, /\.startsWith\("\/assets\/"\)/);
  assert.match(worker, /manifest\.webmanifest/);
  assert.match(worker, /icon-512\.png/);
  assert.match(worker, /"navigate"===/);
});

test("published posts retain raw Markdown for downloads and SPA navigation", async () => {
  const source = await read("content/posts/physics/basic-calculus-02/index.md");
  const published = await read("public/posts/physics/basic-calculus-02/index.md");
  assert.equal(published, source);

  await assert.rejects(stat(new URL("public/posts/physics/basic-calculus-02/page.html", root)), { code: "ENOENT" });

  const html = await read("public/posts/physics/basic-calculus-02/index.html");
  assert.match(html, /<a href="index\.md" download>Download Markdown<\/a>/);
});
