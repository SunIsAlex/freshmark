import { promises as fs } from "node:fs";
import path from "node:path";
import config from "../site.config.mjs";

const root = path.resolve(import.meta.dirname, "..");
const contentDir = path.join(root, "content", "posts");
const themeDir = path.join(root, "theme");
const outputDir = path.join(root, "public");
const currentYear = new Date().getUTCFullYear();
const basePath = `/${String(config.basePath || "").replace(/^\/+|\/+$/g, "")}`.replace(/^\/$/, "");
const href = (value = "/") => `${basePath}${value.startsWith("/") ? value : `/${value}`}` || "/";
const absolute = (value) => new URL(href(value), config.baseUrl).href;

const escapeHtml = (text = "") => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const slugify = (text) => String(text).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
const formatDate = (value) => new Intl.DateTimeFormat(config.language, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
const formatLongDate = (value) => new Intl.DateTimeFormat(config.language, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));

function inline(text) {
  const fragments = [];
  const preserve = (html) => `FRESHMARKFRAGMENT${fragments.push(html) - 1}END`;
  const renderMath = (source, displayMode) => preserve(`${displayMode ? "\\[" : "\\("}${escapeHtml(source)}${displayMode ? "\\]" : "\\)"}`);
  const rendered = String(text)
    .replace(/`([^`]+)`/g, (_, code) => preserve(`<code>${escapeHtml(code)}</code>`))
    .replace(/!\[([^\]]*)\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["']([^"']*)["'])?\s*\)/g, (match, alt, bracketedSource, source, title) => {
      const imageSource = bracketedSource || source;
      if (/^javascript:/i.test(imageSource)) return match;
      const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
      return preserve(`<img src="${escapeHtml(imageSource)}" alt="${escapeHtml(alt)}"${titleAttribute} loading="lazy" decoding="async">`);
    })
    .replace(/<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>/g, (html) => preserve(html))
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => renderMath(math.trim(), true))
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => renderMath(math.trim(), true))
    .replace(/\\\((.+?)\\\)/g, (_, math) => renderMath(math.trim(), false))
    .replace(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, (_, math) => renderMath(math.trim(), false));

  return escapeHtml(rendered)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/!\[([^\]]*)\]\((?!javascript:)([^\s)]+)\)/gi, '<img src="$2" alt="$1" loading="lazy" decoding="async">')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|\.\/|\.\.\/|#|mailto:)[^\s)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/FRESHMARKFRAGMENT(\d+)END/g, (_, index) => fragments[Number(index)]);
}

function parseFrontmatter(source, file) {
  const match = source.replaceAll("\r\n", "\n").match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: expected frontmatter between --- lines`);
  const data = {};
  let listKey = null;
  for (const line of match[1].split("\n")) {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && listKey) {
      data[listKey].push(listItem[1].trim().replace(/^['"]|['"]$/g, ""));
      continue;
    }
    const property = line.match(/^([^\s#:][^:]*):\s*(.*)$/);
    if (!property) continue;
    const [, key, rawValue] = property;
    let value = rawValue.trim();
    if (value.startsWith("[") && value.endsWith("]")) value = value.slice(1, -1).split(",").map((item) => item.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
    else if (value === "true" || value === "false") value = value === "true";
    else value = value.replace(/^['"]|['"]$/g, "");
    if (value === "" && ["tags", "categories"].includes(key)) {
      data[key] = [];
      listKey = key;
    } else {
      data[key] = value;
      listKey = null;
    }
  }
  return { data, body: match[2].trim() };
}

async function findMarkdownFiles(directory, relative = "") {
  const entries = await fs.readdir(path.join(directory, relative), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await findMarkdownFiles(directory, entryPath));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(entryPath);
  }
  return files;
}

function renderMarkdown(markdown) {
  markdown = markdown.replace(/(\$[^$\n]+)\$\$(?=\S)/g, "$1$ $");
  markdown = markdown.replace(/\$(\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\})\$/g, (_, math) => `$${math.replace(/\s*\n\s*/g, " ")}$`);
  markdown = markdown.replace(/^\s*\$([^$\n]+)\$\s*$/gm, (_, math) => `$$${math}$$`);
  const html = [];
  const headings = [];
  let paragraph = [];
  let list = null;
  let code = false;
  let codeLines = [];
  let displayMathLines = null;
  const flushParagraph = () => { if (paragraph.length) { html.push(`<p>${inline(paragraph.join(" "))}</p>`); paragraph = []; } };
  const flushList = () => { if (list) { html.push(`<${list.type}>${list.items.map((item) => `<li>${inline(item)}</li>`).join("")}</${list.type}>`); list = null; } };

  for (const line of markdown.split("\n")) {
    if (line.startsWith("```")) {
      flushParagraph(); flushList();
      if (code) { html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`); codeLines = []; }
      code = !code; continue;
    }
    if (code) { codeLines.push(line); continue; }
    if (displayMathLines) {
      const end = line.indexOf("$$");
      if (end < 0) { displayMathLines.push(line); continue; }
      displayMathLines.push(line.slice(0, end));
      html.push(inline(`$$${displayMathLines.join("\n")}$$`));
      displayMathLines = null;
      if (line.slice(end + 2).trim()) paragraph.push(line.slice(end + 2).trim());
      continue;
    }
    const displayStart = line.indexOf("$$");
    if (displayStart >= 0 && line.indexOf("$$", displayStart + 2) < 0) {
      flushParagraph(); flushList();
      if (line.slice(0, displayStart).trim()) html.push(`<p>${inline(line.slice(0, displayStart).trim())}</p>`);
      displayMathLines = [line.slice(displayStart + 2)];
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      const level = heading[1].length; const text = heading[2]; const id = slugify(text);
      headings.push({ id, text, level }); html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`); continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)$/); const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (bullet || ordered) { flushParagraph(); const type = bullet ? "ul" : "ol"; if (list && list.type !== type) flushList(); list ||= { type, items: [] }; list.items.push((bullet || ordered)[1]); continue; }
    if (line.startsWith("> ")) { flushParagraph(); flushList(); html.push(`<blockquote><p>${inline(line.slice(2))}</p></blockquote>`); continue; }
    if (/^\s*(?:<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>)\s*$/.test(line)) { flushParagraph(); flushList(); html.push(inline(line)); continue; }
    if (!line.trim()) { flushParagraph(); flushList(); continue; }
    paragraph.push(line.trim());
  }
  if (code) throw new Error("Unclosed fenced code block");
  if (displayMathLines) throw new Error("Unclosed $$ math block");
  flushParagraph(); flushList();
  return { html: html.join("\n"), headings };
}

function summaryFromBody(body) {
  const marker = body.indexOf("<!--more-->");
  const excerpt = marker >= 0 ? body.slice(0, marker) : body;
  return excerpt
    .replace(/<!--[\s\S]*?-->|<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[#*`>_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

async function loadPosts() {
  const files = (await findMarkdownFiles(contentDir)).sort();
  const posts = [];
  for (const file of files) {
    const source = await fs.readFile(path.join(contentDir, file), "utf8");
    const { data, body } = parseFrontmatter(source, file);
    if (data.draft === true && process.env.FRESHMARK_DRAFTS !== "true") continue;
    for (const key of ["title", "date"]) if (!data[key]) throw new Error(`${file}: missing ${key} in frontmatter`);
    const date = String(data.date).slice(0, 10);
    const { html, headings } = renderMarkdown(body);
    const words = body.replace(/[#*`>\[\]()_-]/g, " ").split(/\s+/).filter(Boolean).length;
    const relativeSlug = file.replace(/\.md$/, "").replace(/(^|\/)index$/, "");
    const summary = data.summary || data.description || summaryFromBody(body);
    posts.push({
      slug: relativeSlug, sourceFile: file, title: data.title, date, summary,
      tags: Array.isArray(data.tags) ? data.tags : [], categories: Array.isArray(data.categories) ? data.categories : [], featured: data.featured === true,
      readingTime: Math.max(1, Math.ceil(words / 220)), html, headings,
      searchText: body.replace(/[#*`>\[\]()_-]/g, " ").replace(/\s+/g, " ").trim(),
    });
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

const searchIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const moonIcon = '<svg data-theme-icon width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 15.1A8.5 8.5 0 0 1 8.9 4a8.5 8.5 0 1 0 11.1 11.1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';

function header() {
  return `<header class="container header"><a class="brand" href="${href("/")}" aria-label="${escapeHtml(config.title)} home"><span class="brand-mark"><span>✦</span></span>${escapeHtml(config.title)}</a><nav class="nav" aria-label="Main navigation"><a href="${href("/#writing")}">Writing</a><a href="${href("/about/")}">About</a><a href="${href("/rss.xml")}">RSS</a><button class="icon-btn" type="button" data-search-open aria-label="Open search">${searchIcon}</button><button class="icon-btn" type="button" data-theme-toggle aria-label="Switch color theme">${moonIcon}</button></nav></header>`;
}

function footer() {
  return `<footer class="container footer"><span>© ${currentYear} ${escapeHtml(config.title)}. Made for unhurried reading.</span><div class="footer-links"><a href="${href("/about/")}">About</a><a href="${href("/rss.xml")}">RSS</a><a href="#">Top ↑</a></div></footer>`;
}

function searchModal() {
  return `<div class="search-modal" data-search-modal role="dialog" aria-modal="true" aria-label="Search articles" hidden><div class="search-panel"><div class="search-field">${searchIcon}<input data-search-input placeholder="Search titles, topics, or ideas…" aria-label="Search articles" autocomplete="off"><button type="button" data-search-close aria-label="Close search">Esc</button></div><div class="search-results" data-search-results></div></div></div>`;
}

function page({ title, description, content, article = false, pathName = "/" }) {
  const fullTitle = title ? `${escapeHtml(title)} — ${escapeHtml(config.title)}` : `${escapeHtml(config.title)} — ${escapeHtml(config.description)}`;
  return `<!doctype html><html lang="${escapeHtml(config.language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="codex-preview" content="development"><title>${fullTitle}</title><meta name="description" content="${escapeHtml(description || config.description)}"><link rel="canonical" href="${absolute(pathName)}"><link rel="icon" href="${href("/favicon.svg")}" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="${escapeHtml(config.title)} RSS" href="${href("/rss.xml")}"><link rel="stylesheet" href="${href("/assets/katex.min.css")}"><link rel="stylesheet" href="${href("/assets/styles.css")}"><script>try{document.documentElement.dataset.theme=localStorage.getItem('freshmark-theme')||''}catch(e){}</script></head><body><div class="site-shell"><div class="ambient"></div>${article ? '<div class="reading-progress" data-reading-progress></div>' : ""}${header()}${content}${footer()}${searchModal()}</div><script>window.FRESHMARK={basePath:${JSON.stringify(basePath)}};</script><script src="${href("/assets/katex.min.js")}" defer></script><script src="${href("/assets/mhchem.min.js")}" defer></script><script src="${href("/assets/auto-render.min.js")}" defer></script><script src="${href("/assets/app.js")}" defer></script></body></html>`;
}

function pageFragment(html, { title, description, pathName = "/", article = false }) {
  const content = html.match(/<main[\s\S]*<\/main>/)?.[0];
  if (!content) throw new Error(`Could not extract main content for ${pathName}`);
  const pageTitle = title ? `${title} — ${config.title}` : `${config.title} — ${config.description}`;
  return `<meta data-freshmark-page data-title="${escapeHtml(pageTitle)}" data-description="${escapeHtml(description || config.description)}" data-canonical="${absolute(pathName)}" data-article="${article}">${content}`;
}

function homePage(posts) {
  const featured = posts.find((post) => post.featured) || posts[0];
  const categories = [...new Set(posts.flatMap((post) => post.categories))];
  const cards = posts.filter((post) => post !== featured).map((post) => `<a class="post-card" href="${href(`/posts/${post.slug}/`)}" data-post-card data-tags="${escapeHtml(post.categories.join("|"))}"><time class="post-date" datetime="${post.date}">${formatDate(post.date)}</time><div><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.summary)}</p></div><span class="post-arrow" aria-hidden="true">↗</span></a>`).join("");
  const content = `<main><section class="container hero"><div><p class="eyebrow">${escapeHtml(config.tagline)}</p><h1>Notes for <em>curious</em> people.</h1></div><div class="hero-side"><p>${escapeHtml(config.intro)}</p><button class="search-trigger" type="button" data-search-open>${searchIcon}<span>Search the archive</span><kbd>⌘ K</kbd></button></div></section><section class="container featured" aria-label="Featured article"><div class="featured-art" aria-hidden="true"><span class="art-line"></span><span class="art-dot"></span></div><div class="featured-copy"><span class="meta">Featured · ${featured.readingTime} min read</span><h2>${escapeHtml(featured.title)}</h2><p>${escapeHtml(featured.summary)}</p><a class="read-link" href="${href(`/posts/${featured.slug}/`)}">Read the essay <span aria-hidden="true">→</span></a></div></section><section class="container post-section" id="writing"><div class="section-head"><div><p class="eyebrow">The archive</p><h2>Recent writing</h2></div><div class="tag-row" aria-label="Filter posts by category"><button class="tag-filter active" type="button" data-tag="All">All</button>${categories.map((category) => `<button class="tag-filter" type="button" data-tag="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}</div></div><div class="post-list" data-post-list>${cards}<p class="empty" data-filter-empty hidden>No posts in this category yet.</p></div></section></main>`;
  return page({ content, pathName: "/" });
}

function postPage(post) {
  const toc = post.headings.map((heading) => `<a href="#${heading.id}">${escapeHtml(heading.text)}</a>`).join("");
  const tags = post.tags.map(escapeHtml).join(" · ");
  const content = `<main><header class="container article-header"><a class="back-link" href="${href("/")}">← Back to all writing</a><h1>${escapeHtml(post.title)}</h1><p class="article-dek">${escapeHtml(post.summary)}</p><div class="article-meta"><time datetime="${post.date}">${formatLongDate(post.date)}</time><span>${post.readingTime} min read</span>${tags ? `<span>${tags}</span>` : ""}<a href="index.md" download>Download Markdown</a></div></header><div class="article-wrap"><aside class="toc"><p>On this page</p>${toc}</aside><article class="prose">${post.html}</article></div></main>`;
  return page({ title: post.title, description: post.summary, content, article: true, pathName: `/posts/${post.slug}/` });
}

function aboutPage() {
  const content = `<main><header class="container article-header"><p class="eyebrow">About this place</p><h1>A blog that respects your attention.</h1><p class="article-dek">${escapeHtml(config.title)} is a small collection of essays and field notes about design, technology, craft, and living with curiosity.</p></header><div class="article-wrap"><aside class="toc"><p>The idea</p><a href="#principles">Principles</a><a href="#contact">Say hello</a></aside><article class="prose"><p>This starter is built around a simple belief: reading on the web should feel clear, warm, and unhurried. There are no trackers, pop-ups, databases, or application servers—just static files.</p><h2 id="principles">Principles</h2><ul><li>Typography carries the design.</li><li>Every feature should earn its place.</li><li>Good defaults make publishing easy.</li><li>The site should remain pleasant on any screen.</li></ul><h2 id="contact">Say hello</h2><p>Replace this paragraph in <code>scripts/build.mjs</code> with a short introduction and your contact link.</p></article></div></main>`;
  return page({ title: "About", description: `About ${config.title}`, content, pathName: "/about/" });
}

async function write(relative, content) {
  const target = path.join(outputDir, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
}

const posts = await loadPosts();
if (!posts.length) throw new Error("No publishable Markdown posts found.");
await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(path.join(outputDir, "assets"), { recursive: true });
await Promise.all([
  fs.copyFile(path.join(themeDir, "styles.css"), path.join(outputDir, "assets", "styles.css")),
  fs.copyFile(path.join(themeDir, "app.js"), path.join(outputDir, "assets", "app.js")),
  fs.copyFile(path.join(themeDir, "favicon.svg"), path.join(outputDir, "favicon.svg")),
  fs.copyFile(path.join(root, "node_modules", "katex", "dist", "katex.min.css"), path.join(outputDir, "assets", "katex.min.css")),
  fs.copyFile(path.join(root, "node_modules", "katex", "dist", "katex.min.js"), path.join(outputDir, "assets", "katex.min.js")),
  fs.copyFile(path.join(root, "node_modules", "katex", "dist", "contrib", "mhchem.min.js"), path.join(outputDir, "assets", "mhchem.min.js")),
  fs.copyFile(path.join(root, "node_modules", "katex", "dist", "contrib", "auto-render.min.js"), path.join(outputDir, "assets", "auto-render.min.js")),
  fs.cp(path.join(root, "node_modules", "katex", "dist", "fonts"), path.join(outputDir, "assets", "fonts"), { recursive: true }),
]);
await fs.cp(contentDir, path.join(outputDir, "posts"), {
  recursive: true,
  filter: (source) => !source.endsWith(".md") && !source.endsWith(".md.bak"),
});
const homeHtml = homePage(posts);
const aboutHtml = aboutPage();
await write("index.html", homeHtml);
await write("page.html", pageFragment(homeHtml, {}));
await write("about/index.html", aboutHtml);
await write("about/page.html", pageFragment(aboutHtml, { title: "About", description: `About ${config.title}`, pathName: "/about/" }));
await write("404.html", page({ title: "Not found", description: "Page not found", content: `<main class="container article-header"><p class="eyebrow">404</p><h1>This page wandered off.</h1><p class="article-dek"><a class="read-link" href="${href("/")}">Return to the writing →</a></p></main>`, pathName: "/404.html" }));
for (const post of posts) {
  const html = postPage(post);
  const directory = `posts/${post.slug}`;
  await write(`${directory}/index.html`, html);
  await write(`${directory}/page.html`, pageFragment(html, { title: post.title, description: post.summary, pathName: `/posts/${post.slug}/`, article: true }));
  await fs.copyFile(path.join(contentDir, post.sourceFile), path.join(outputDir, directory, "index.md"));
}

const searchIndex = posts.map(({ slug, title, summary, tags, categories, readingTime, searchText }) => ({ title, summary, tags, categories, readingTime, searchText, url: href(`/posts/${slug}/`) }));
await write("search-index.json", JSON.stringify(searchIndex));
const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeHtml(config.title)}</title><link>${escapeHtml(config.baseUrl)}</link><description>${escapeHtml(config.description)}</description>${posts.map((post) => `<item><title>${escapeHtml(post.title)}</title><link>${absolute(`/posts/${post.slug}/`)}</link><guid>${absolute(`/posts/${post.slug}/`)}</guid><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate><description>${escapeHtml(post.summary)}</description></item>`).join("")}</channel></rss>`;
await write("rss.xml", rss);
await write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${absolute("/")}</loc></url><url><loc>${absolute("/about/")}</loc></url>${posts.map((post) => `<url><loc>${absolute(`/posts/${post.slug}/`)}</loc><lastmod>${post.date}</lastmod></url>`).join("")}</urlset>`);
await write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${absolute("/sitemap.xml")}\n`);
console.log(`Freshmark built ${posts.length} posts to public/`);
