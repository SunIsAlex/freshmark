import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { parseFrontmatter, renderSummary, summaryFromBody } from "../lib/markdown.mjs";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");

test("build emits portable static pages", async () => {
  const files = [
    "public/index.html",
    "public/about/index.html",
    "public/posts/chemistry/babychem/overview-of-stereochemistry/index.html",
    "public/posts/chemistry/babychem/overview-of-stereochemistry/index.md",
    "public/posts/chemistry/babychem/overview-of-stereochemistry/image.png",
    "public/posts/chemistry/inorganic/manganese/index.html",
    "public/posts/chemistry/inorganic/manganese/image.png",
    "public/posts/chemistry/inorganic/manganese/2022-beijing-chlorine-manganese-apparatus.png",
    "public/en/index.html",
    "public/en/about/index.html",
    "public/en/posts/chemistry/inorganic/manganese/index.html",
    "public/en/posts/chemistry/inorganic/manganese/index.md",
    "public/en/posts/chemistry/inorganic/manganese/image.png",
    "public/en/posts/chemistry/inorganic/manganese/2022-beijing-chlorine-manganese-apparatus.png",
    "public/en/search-index.json",
    "public/en/rss.xml",
    "public/en/manifest.webmanifest",
    "public/search-index.json",
    "public/rss.xml",
    "public/sitemap.xml",
    "public/assets/styles.css",
    "public/assets/app.js",
    "public/assets/markdown.js",
    "public/assets/fonts/anthropic-sans-variable.ttf",
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
  await assert.rejects(stat(new URL("public/posts/chemistry/inorganic/manganese/index/index.html", root)), { code: "ENOENT" });
});

test("site is installable as a progressive web app", async () => {
  const html = await read("public/index.html");
  assert.match(html, /<link[^>]+href="\/manifest\.webmanifest"[^>]+rel="manifest"/);
  assert.match(html, /<meta[^>]+content="#ff4500"[^>]+name="theme-color"/);
  assert.match(html, /<link[^>]+href="\/icons\/apple-touch-icon\.png"[^>]+rel="apple-touch-icon"/);

  const manifest = JSON.parse(await read("public/manifest.webmanifest"));
  assert.equal(manifest.name, "Freshmark");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.icons.some(({ sizes }) => sizes === "192x192"), true);
  assert.equal(manifest.icons.some(({ sizes }) => sizes === "512x512"), true);

  const englishManifest = JSON.parse(await read("public/en/manifest.webmanifest"));
  assert.equal(englishManifest.lang, "en");
  assert.equal(englishManifest.start_url, "/en/");
  assert.equal(englishManifest.scope, "/en/");
  assert.match(await read("public/en/index.html"), /href="\/en\/manifest\.webmanifest" rel="manifest"/);
});

test("generated HTML has no application framework runtime", async () => {
  const html = await read("public/index.html");
  assert.match(html, /搜索文章/);
  assert.match(html, /<style data-critical>[^<]*--paper:#f6f7f8/);
  const stylesheetLinks = html.match(/<link[^>]+href="\/assets\/styles\.css\?v=[a-f0-9]{12}"[^>]*>/g);
  assert.equal(stylesheetLinks.length, 2);
  assert.match(stylesheetLinks[0], /\bas="style"/);
  assert.match(stylesheetLinks[0], /\brel="preload"/);
  assert.match(stylesheetLinks[1], /\brel="stylesheet"/);
  assert.match(html, /<script[^>]+src="\/assets\/app\.js\?v=[a-f0-9]{12}"/);
  assert.match(html, /assetVersion:"[a-f0-9]{12}"/);
  assert.match(html, /<link[^>]+href="\/assets\/fonts\/anthropic-sans-variable\.ttf"[^>]+rel="preload"/);
  assert.doesNotMatch(html, /\b(?:_next|__next|react(?:\.production)?\.min|vinext)\b/i);
});

test("localized routes provide Chinese and English navigation", async () => {
  const chineseHome = await read("public/index.html");
  const englishHome = await read("public/en/index.html");
  const chineseArticle = await read("public/posts/chemistry/inorganic/manganese/index.html");
  const englishArticle = await read("public/en/posts/chemistry/inorganic/manganese/index.html");

  assert.match(chineseHome, /<html lang="zh-CN"/);
  assert.match(chineseHome, /写给 <em>好奇的人。<\/em>/);
  assert.match(chineseHome, /href="\/en\/" class="language-switch"/);
  assert.match(englishHome, /<html lang="en"/);
  assert.match(englishHome, /Notes for <em>curious people.<\/em>/);
  assert.match(englishHome, /href="\/" class="language-switch"/);

  assert.match(chineseArticle, /href="\/en\/posts\/chemistry\/inorganic\/manganese\/" class="language-switch"/);
  assert.match(englishArticle, /href="\/posts\/chemistry\/inorganic\/manganese\/" class="language-switch"/);
  assert.match(chineseArticle, /hreflang="en"/);
  assert.match(englishArticle, /hreflang="zh-CN"/);
  assert.match(englishArticle, /Back to all writing/);
  assert.match(englishArticle, /On this page/);
  const translatedArticle = await read("public/posts/physics/basic-calculus-02/index.html");
  const englishTranslatedArticle = await read("public/en/posts/physics/basic-calculus-02/index.html");
  assert.match(translatedArticle, /rel="alternate" hreflang="en"/);
  assert.match(englishTranslatedArticle, /Introduction to Basic Calculus: Elementary Integration/);

  const englishProse = englishArticle.match(/<article class="prose">([\s\S]*?)<\/article>/)?.[1] || "";
  assert.match(englishProse, /Manganese ores occur mainly as/);
  assert.match(englishProse, /Industrial Applications of Manganese/);
  assert.match(englishProse, /Preparation, Purification, and Yield of Potassium Permanganate/);
  assert.doesNotMatch(englishProse, /Answers and analysis/);
  assert.doesNotMatch(englishProse, /\p{Script=Han}/u);

  const chineseIndex = JSON.parse(await read("public/search-index.json"));
  const englishIndex = JSON.parse(await read("public/en/search-index.json"));
  assert.equal(chineseIndex.length, 30);
  assert.equal(englishIndex.length, chineseIndex.length);
  assert.deepEqual(
    englishIndex.map(({ url }) => url.replace(/^\/en/, "")).sort(),
    chineseIndex.map(({ url }) => url).sort(),
  );
  assert.doesNotMatch(
    JSON.stringify(englishIndex.map(({ searchText, ...metadata }) => metadata)),
    /\p{Script=Han}/u,
  );
  const englishRss = await read("public/en/rss.xml");
  assert.match(englishRss, /<language>en<\/language>/);
  assert.match(englishRss, /https:\/\/next\.sunisalex\.org\/en\/posts\/chemistry\/inorganic\/manganese\//);
  assert.match(englishRss, /https:\/\/next\.sunisalex\.org\/en\/posts\/physics\/basic-calculus-02\//);
});

test("typography uses Claude's font family and size scale", async () => {
  const css = await read("public/assets/styles.css");
  assert.match(css, /@font-face\{[^}]*font-family:"Anthropic Sans"[^}]*anthropic-sans-variable\.ttf/);
  assert.match(css, /--text-xs:12px;--text-sm:14px;--text-md:16px;--text-lg:20px/);
  assert.match(css, /--heading-lg:20px;--heading-xl:24px;--heading-2xl:28px;--heading-3xl:36px/);
  assert.match(css, /body\{[^}]*font-size:var\(--text-md\)[^}]*line-height:1\.4/);
  assert.match(css, /\.prose\{[^}]*font-size:var\(--text-md\)[^}]*line-height:1\.4/);
  assert.match(css, /\.article-header h1,\.hero h1\{font-size:var\(--heading-2xl\);line-height:1\.1\}/);
  assert.match(css, /\.featured h2,\.section-head h2\{font-size:var\(--heading-xl\);line-height:1\.25\}/);
  assert.match(css, /\.prose h2\{font-size:var\(--heading-xl\);line-height:1\.25\}/);
  assert.doesNotMatch(css, /Iowan Old Style|Baskerville|Times New Roman/);
});

test("manganese color descriptions render with matching colors", async () => {
  const html = await read("public/posts/chemistry/inorganic/manganese/index.html");
  const englishHtml = await read("public/en/posts/chemistry/inorganic/manganese/index.html");
  const css = await read("public/assets/styles.css");
  assert.equal(html.match(/class="chemical-color"/g)?.length, 112);
  assert.match(html, /溶液酸碱性对 \\\(\\ce\{Mn\(II\)\}\\\) 还原性的影响/);
  assert.match(html, /高锰酸钾的制备、提纯与产率测定/);
  assert.match(html, /2022-beijing-chlorine-manganese-apparatus\.png/);
  assert.match(html, /<u class="answer-reveal">/);
  assert.match(html, /饱和/);
  assert.match(html, /5000a/);
  assert.doesNotMatch(html, /参考答案与解析/);
  assert.equal(html.match(/<u\b/g)?.length, html.match(/<u class="answer-reveal">/g)?.length);
  assert.equal(englishHtml.match(/<u\b/g)?.length, englishHtml.match(/<u class="answer-reveal">/g)?.length);
  assert.doesNotMatch(html, /\\underline/);
  assert.doesNotMatch(englishHtml, /\\underline/);
  for (const color of [
    "black", "blue-violet", "brown", "brown-black", "brown-red", "brown-yellow",
    "colorless", "dark-green", "flesh", "gray", "green", "light-green",
    "near-white", "pale-pink", "pink", "purple", "purple-black", "purple-red",
    "red", "rose", "silver-white", "white", "yellow",
  ]) assert.match(html, new RegExp(`data-color="${color}"`));
  assert.match(css, /\.chemical-color\{[^}]*color:var\(--chemical-color\)/);
  assert.match(css, /\.chemical-color\[data-color=white\]\{[^}]*background:#667078/);
  assert.match(css, /\.chemical-color\[data-color=colorless\]\{[^}]*text-decoration:underline dotted/);
  assert.match(css, /u\.answer-reveal:not\(\.is-revealed\)\{[^}]*color:transparent!important[^}]*background-color:var\(--ink\)/);
  assert.match(css, /u\.answer-reveal:focus-visible\{[^}]*outline:2px solid var\(--accent\)/);
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
  assert.match(titledImageHtml, /<figure class="prose-figure"><img[^>]*src="image\.png"[^>]*><figcaption>关于电负性\/杂化的综合判断<\/figcaption><\/figure>/);

  const spacedImageHtml = await read("public/posts/physics/celestial-movement/index.html");
  assert.match(spacedImageHtml, /<img[^>]*src="Screenshot%20From%202026-06-17%2020-47-25\.png"/);
  assert.doesNotMatch(spacedImageHtml, /src="&lt;Screenshot/);
});

test("summaries render inline Markdown and preserve LaTeX for KaTeX", async () => {
  assert.equal(
    renderSummary("Use **AM-GM** for $a_4$ and `code`."),
    "Use <strong>AM-GM</strong> for \\(a_4\\) and <code>code</code>.",
  );
  assert.equal(
    renderSummary("[Reference](https://example.com) with *emphasis*", { links: false }),
    "Reference with <em>emphasis</em>",
  );
  assert.equal(
    parseFrontmatter("---\nsummary: >\n  First line with $x$.\n  Second line.\n---\nBody").data.summary,
    "First line with $x$. Second line.",
  );
  const longFormulaSummary = summaryFromBody(`${"a".repeat(175)} $\\frac{a_1+a_2+a_3}{b_1+b_2+b_3}$ trailing text`);
  assert.equal(longFormulaSummary, `${"a".repeat(175)} $\\frac{a_1+a_2+a_3}{b_1+b_2+b_3}$`);
  assert.equal(summaryFromBody('黑<span class="chemical-color">色</span>文本'), "黑色文本");
  assert.equal(summaryFromBody("<p>First</p><p>Second</p>"), "First Second");
  assert.match(renderSummary(longFormulaSummary), /\\\(\\frac\{a_1\+a_2\+a_3\}\{b_1\+b_2\+b_3\}\\\)$/);
  assert.doesNotMatch(longFormulaSummary, /FRESHMARKMATH/);
  const html = await read("public/posts/math/max-minus-min-sequence/index.html");
  assert.match(html, /<p class="article-dek">第\(I\)问枚举 \\\(a_4\\\)/);
  const foldedHtml = await read("public/posts/physics/application-of-the-law-of-gravitation/index.html");
  assert.match(foldedHtml, /<p class="article-dek">以轨道力学为主线/);
  assert.doesNotMatch(foldedHtml, /<p class="article-dek">&gt;<\/p>/);
  const manganeseSource = await read("content/posts/chemistry/inorganic/manganese/index.md");
  const manganeseSummary = summaryFromBody(parseFrontmatter(manganeseSource).body);
  assert.match(manganeseSummary, /\$\\ce\{MnCO3\}\$$/);
  assert.doesNotMatch(manganeseSummary, /\$\(n-1\)d\^5n$/);
});

test("standalone boxed formulas become scrollable display math", async () => {
  const html = await read("public/posts/math/focal-chord-length-formula/index.html");
  assert.match(html, /\\\[\\boxed\{\\frac\{2ab\^2\}/);
  assert.doesNotMatch(html, /\\\(\\boxed\{\\frac\{2ab\^2\}/);
  assert.match(html, /<table>[\s\S]*<thead>[\s\S]*<th>字母<\/th>[\s\S]*<th>含义<\/th>[\s\S]*<tbody>/);
  assert.match(html, /<td>\\\(\\theta\\\)<\/td>[\s\S]*<td>直线的倾斜角<\/td>/);
  assert.doesNotMatch(html, /<p>\|字母\|含义\|/);

  const css = await read("public/assets/styles.css");
  assert.match(css, /\.prose \.katex-display\{[^}]*width:100%[^}]*max-width:100%[^}]*overflow-x:auto/);
  assert.match(css, /\.prose \.katex-display>\.katex\{[^}]*display:inline-block[^}]*min-width:max-content/);
  assert.doesNotMatch(css, /\.prose :not\(\.katex-display\)>\.katex/);
  assert.match(css, /\.prose \.katex-inline-overflow\{[^}]*display:inline-block[^}]*max-width:100%[^}]*overflow-x:auto/);
  assert.match(css, /\.prose \.katex-display,\.prose \.katex-inline-overflow\{[^}]*scrollbar-width:thin/);
});

test("HTML underlines match KaTeX underline metrics", async () => {
  const css = await read("public/assets/styles.css");
  assert.match(css, /\.prose u\{[^}]*padding-bottom:.12em/);
  assert.match(css, /\.prose u\{[^}]*background-image:linear-gradient\(currentColor,currentColor\)/);
  assert.match(css, /\.prose u\{[^}]*background-position:0 100%/);
  assert.match(css, /\.prose u\{[^}]*background-size:100% max\(1px,.04em\)/);
  assert.match(css, /\.prose u\{[^}]*box-decoration-break:clone/);
  assert.match(css, /\.prose u\{[^}]*text-decoration:none/);
  assert.match(css, /\.prose u \.katex \.underline-line\{border-bottom-width:0!important}/);
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
  assert.equal("summaryHtml" in post, false);
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

test("English prose separates inline math from surrounding words", async () => {
  const englishIndex = JSON.parse(await read("public/en/search-index.json"));
  for (const post of englishIndex) {
    const sourcePath = `content${post.url.replace(/^\/en/, "")}index.en.md`;
    const lines = (await read(sourcePath)).split("\n");
    let fencedCode = false;
    let displayMath = false;
    for (const [lineIndex, line] of lines.entries()) {
      if (/^\s*```/.test(line)) {
        fencedCode = !fencedCode;
        continue;
      }
      if (fencedCode) continue;
      const displayDelimiters = (line.match(/\$\$/g) || []).length;
      if (displayMath || displayDelimiters) {
        if (displayDelimiters % 2 === 1) displayMath = !displayMath;
        continue;
      }
      let inlineCode = false;
      let inlineMath = false;
      for (let index = 0; index < line.length; index += 1) {
        if (line[index] === "`") {
          inlineCode = !inlineCode;
          continue;
        }
        if (inlineCode || line[index] !== "$" || line[index + 1] === "$") continue;
        if (!inlineMath) {
          assert.doesNotMatch(line[index - 1] || "", /[A-Za-z0-9)]/, `${sourcePath}:${lineIndex + 1}`);
          inlineMath = true;
        } else {
          assert.doesNotMatch(line[index + 1] || "", /[A-Za-z0-9(]/, `${sourcePath}:${lineIndex + 1}`);
          inlineMath = false;
        }
      }

      inlineCode = false;
      for (let index = 0; index < line.length - 1; index += 1) {
        if (line[index] === "`") {
          inlineCode = !inlineCode;
          continue;
        }
        if (inlineCode) continue;
        const delimiter = line.slice(index, index + 2);
        if (delimiter === "\\(") {
          assert.doesNotMatch(line[index - 1] || "", /[A-Za-z0-9)]/, `${sourcePath}:${lineIndex + 1}`);
          index += 1;
        } else if (delimiter === "\\)") {
          assert.doesNotMatch(line[index + 2] || "", /[A-Za-z0-9(]/, `${sourcePath}:${lineIndex + 1}`);
          index += 1;
        }
      }
    }
  }
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
  const markdownBundle = await read("public/assets/markdown.js");
  assert.ok(bundle.length < markdownBundle.length);
  assert.doesNotMatch(bundle, /MarkdownIt/);
  assert.match(app, /assets\/markdown\.js/);
  assert.match(app, /searchIndexPath/);
  assert.match(app, /postsRoot/);
  assert.match(app, /data-no-spa/);
  assert.match(app, /loadMarkdownRenderer/);
  assert.match(app, /history\.pushState/);
  assert.match(app, /addEventListener\("popstate"/);
  assert.match(app, /DOMParser/);
  assert.match(app, /renderMathInElement/);
  assert.match(app, /renderMath\(nextMain\)/);
  assert.match(app, /updateInlineMathOverflow\(nextMain\)/);
  assert.match(app, /formula\.classList\.remove\("katex-inline-overflow"\)/);
  assert.match(app, /formula\.getBoundingClientRect\(\)\.width > line\.clientWidth \+ 1/);
  assert.match(app, /document\.fonts\?\.ready/);
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
  assert.match(app, /renderSummary\(summary\)/);
  assert.match(app, /window\.FRESHMARK\?\.assetVersion/);
  assert.match(app, /assets\/markdown\.js\$\{assetVersion \? `\?v=\$\{assetVersion\}` : ""\}/);
  assert.match(app, /prepareGallery\(nextMain\)/);
  assert.match(app, /prepareAnswerReveals\(nextMain\)/);
  assert.match(app, /answer\.setAttribute\("aria-expanded", String\(revealed\)\)/);
  assert.match(app, /toggleAnswerReveal\(answerReveal\)/);
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

test("article images open in a PhotoSwipe keyboard and touch-friendly gallery", async () => {
  const html = await read("public/posts/physics/basic-calculus-02/index.html");
  const app = await read("theme/app.js");
  const css = await read("public/assets/styles.css");
  assert.doesNotMatch(html, /data-image-gallery/);
  assert.match(app, /import PhotoSwipe from "photoswipe"/);
  assert.match(app, /new PhotoSwipe/);
  assert.doesNotMatch(app, /addEventListener\("dblclick"/);
  assert.match(app, /image\.addEventListener\("click"/);
  assert.match(app, /openGallery\(image\)/);
  assert.doesNotMatch(app, /Promise\.all\(images\.map\(galleryImageSize\)\)/);
  assert.match(app, /pswp\.on\("loadComplete"/);
  assert.doesNotMatch(app, /imageTouchStart|touchGenerated|suppressImageClick/);
  assert.match(app, /addFilter\("thumbEl"/);
  assert.match(app, /addFilter\("placeholderSrc"/);
  assert.match(app, /preload: \[1, 2\]/);
  assert.match(app, /showHideAnimationType: "zoom"/);
  assert.match(app, /arrowPrev: false/);
  assert.match(app, /arrowNext: false/);
  assert.doesNotMatch(app, /wheelToZoom: true/);
  assert.match(css, /\.prose img\[data-gallery-item\]\{cursor:zoom-in/);
  assert.match(css, /\.pswp\{/);
  assert.match(css, /\.pswp__freshmark-caption/);
  assert.doesNotMatch(css, /\.gallery-track/);
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
  assert.match(worker, /en\/manifest\.webmanifest/);
  assert.match(worker, /en\/search-index\.json/);
  assert.match(worker, /en\/404\.html/);
  assert.match(worker, /icon-512\.png/);
  assert.match(worker, /assets\/markdown\.js/);
  assert.match(worker, /\?v=/);
  assert.match(worker, /"navigate"===/);
});

test("published posts retain raw Markdown for downloads and SPA navigation", async () => {
  const source = await read("content/posts/physics/basic-calculus-02/index.md");
  const published = await read("public/posts/physics/basic-calculus-02/index.md");
  assert.equal(published, source);

  await assert.rejects(stat(new URL("public/posts/physics/basic-calculus-02/page.html", root)), { code: "ENOENT" });

  const html = await read("public/posts/physics/basic-calculus-02/index.html");
  assert.match(html, /<a href="index\.md" download>下载 Markdown<\/a>/);

  const englishSource = await read("content/posts/chemistry/inorganic/manganese/index.en.md");
  const englishPublished = await read("public/en/posts/chemistry/inorganic/manganese/index.md");
  assert.equal(englishPublished, englishSource);
});
