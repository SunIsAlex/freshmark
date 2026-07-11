import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { build as bundle } from "esbuild";
import CleanCSS from "clean-css";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify as minifyJavaScript } from "terser";
import config from "../site.config.mjs";
import { parseFrontmatter, renderMarkdown, summaryFromBody } from "../lib/markdown.mjs";

const root = path.resolve(import.meta.dirname, "..");
const contentDir = path.join(root, "content", "posts");
const themeDir = path.join(root, "theme");
const outputDir = path.join(root, "public");
const currentYear = new Date().getUTCFullYear();
const basePath = `/${String(config.basePath || "").replace(/^\/+|\/+$/g, "")}`.replace(/^\/$/, "");
const href = (value = "/") => `${basePath}${value.startsWith("/") ? value : `/${value}`}` || "/";
const absolute = (value) => new URL(href(value), config.baseUrl).href;

const escapeHtml = (text = "") => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const formatDate = (value) => new Intl.DateTimeFormat(config.language, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
const formatLongDate = (value) => new Intl.DateTimeFormat(config.language, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));

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
  return `<!doctype html><html lang="${escapeHtml(config.language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="codex-preview" content="development"><title>${fullTitle}</title><meta name="description" content="${escapeHtml(description || config.description)}"><link rel="canonical" href="${absolute(pathName)}"><link rel="icon" href="${href("/favicon.svg")}" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="${escapeHtml(config.title)} RSS" href="${href("/rss.xml")}"><link rel="stylesheet" href="${href("/assets/katex.min.css")}"><link rel="stylesheet" href="${href("/assets/styles.css")}"><script>try{document.documentElement.dataset.theme=localStorage.getItem('freshmark-theme')||''}catch(e){}</script></head><body><div class="site-shell"><div class="ambient"></div>${article ? '<div class="reading-progress" data-reading-progress></div>' : ""}${header()}${content}${footer()}${searchModal()}</div><script>window.FRESHMARK={basePath:${JSON.stringify(basePath)},title:${JSON.stringify(config.title)},language:${JSON.stringify(config.language)}};</script><script src="${href("/assets/katex.min.js")}" defer></script><script src="${href("/assets/mhchem.min.js")}" defer></script><script src="${href("/assets/auto-render.min.js")}" defer></script><script src="${href("/assets/app.js")}" defer></script></body></html>`;
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
  if (relative.endsWith(".html")) content = await minifyHtml(content, {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: false,
    removeRedundantAttributes: true,
    sortAttributes: true,
    sortClassName: true,
  });
  await fs.writeFile(target, content);
}

async function outputVersion() {
  const files = [];
  const visit = async (directory) => {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (!file.endsWith(`${path.sep}sw.js`) && !file.endsWith(`${path.sep}version.json`)) files.push(file);
    }
  };
  await visit(outputDir);
  const hash = createHash("sha256");
  for (const file of files.sort()) {
    hash.update(path.relative(outputDir, file));
    hash.update("\0");
    hash.update(await fs.readFile(file));
    hash.update("\0");
  }
  return hash.digest("hex").slice(0, 16);
}

function serviceWorker(version) {
  return `const VERSION=${JSON.stringify(version)};
const CACHE_NAME="freshmark-"+VERSION;
const BASE_PATH=${JSON.stringify(basePath)};
const at=(path)=>BASE_PATH+path;
const PRECACHE=["/","/404.html","/about/","/page.html","/about/page.html","/search-index.json","/assets/styles.css","/assets/app.js","/assets/katex.min.css","/assets/katex.min.js","/assets/mhchem.min.js","/assets/auto-render.min.js"].map(at);
self.addEventListener("install",(event)=>event.waitUntil(caches.open(CACHE_NAME).then((cache)=>cache.addAll(PRECACHE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",(event)=>event.waitUntil(caches.keys().then((names)=>Promise.all(names.filter((name)=>name.startsWith("freshmark-")&&name!==CACHE_NAME).map((name)=>caches.delete(name)))).then(()=>self.clients.claim())));
const cacheResponse=async(request,response)=>{if(response&&response.ok){const cache=await caches.open(CACHE_NAME);await cache.put(request,response.clone())}return response};
const cacheFirst=async(request)=>(await caches.match(request))||cacheResponse(request,await fetch(request));
const networkFirst=async(request)=>{try{return await cacheResponse(request,await fetch(request))}catch{return (await caches.match(request))||(request.mode==="navigate"?caches.match(at("/404.html")):Response.error())}};
const staleWhileRevalidate=async(request)=>{const cached=await caches.match(request);const fresh=fetch(request).then((response)=>cacheResponse(request,response)).catch(()=>null);return cached||await fresh||Response.error()};
self.addEventListener("fetch",(event)=>{const request=event.request;if(request.method!=="GET")return;const url=new URL(request.url);if(url.origin!==self.location.origin||!url.pathname.startsWith(BASE_PATH||"/"))return;const path=url.pathname.slice(BASE_PATH.length);if(request.mode==="navigate"||path.endsWith(".html")||["/search-index.json","/rss.xml","/sitemap.xml"].includes(path))event.respondWith(networkFirst(request));else if(path.endsWith(".md"))event.respondWith(staleWhileRevalidate(request));else if(path.startsWith("/assets/")||/\.(?:png|jpe?g|gif|webp|svg|avif)$/i.test(path))event.respondWith(cacheFirst(request));});
`;
}

const posts = await loadPosts();
if (!posts.length) throw new Error("No publishable Markdown posts found.");
await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(path.join(outputDir, "assets"), { recursive: true });
const styles = new CleanCSS({ level: 2 }).minify(await fs.readFile(path.join(themeDir, "styles.css"), "utf8"));
if (styles.errors.length) throw new Error(`CSS minification failed: ${styles.errors.join(", ")}`);
await Promise.all([
  fs.writeFile(path.join(outputDir, "assets", "styles.css"), styles.styles),
  fs.copyFile(path.join(themeDir, "favicon.svg"), path.join(outputDir, "favicon.svg")),
  fs.copyFile(path.join(root, "node_modules", "katex", "dist", "katex.min.css"), path.join(outputDir, "assets", "katex.min.css")),
  fs.copyFile(path.join(root, "node_modules", "katex", "dist", "katex.min.js"), path.join(outputDir, "assets", "katex.min.js")),
  fs.copyFile(path.join(root, "node_modules", "katex", "dist", "contrib", "mhchem.min.js"), path.join(outputDir, "assets", "mhchem.min.js")),
  fs.copyFile(path.join(root, "node_modules", "katex", "dist", "contrib", "auto-render.min.js"), path.join(outputDir, "assets", "auto-render.min.js")),
  fs.cp(path.join(root, "node_modules", "katex", "dist", "fonts"), path.join(outputDir, "assets", "fonts"), { recursive: true }),
]);
const bundled = await bundle({ entryPoints: [path.join(themeDir, "app.js")], bundle: true, format: "iife", platform: "browser", write: false });
const minifiedApp = await minifyJavaScript(bundled.outputFiles[0].text, { compress: true, mangle: true });
if (!minifiedApp.code) throw new Error("JavaScript minification produced no output");
await fs.writeFile(path.join(outputDir, "assets", "app.js"), minifiedApp.code);
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
  await fs.copyFile(path.join(contentDir, post.sourceFile), path.join(outputDir, directory, "index.md"));
}

const searchIndex = posts.map(({ slug, title, summary, tags, categories, readingTime, searchText }) => ({ title, summary, tags, categories, readingTime, searchText, url: href(`/posts/${slug}/`) }));
await write("search-index.json", JSON.stringify(searchIndex));
const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeHtml(config.title)}</title><link>${escapeHtml(config.baseUrl)}</link><description>${escapeHtml(config.description)}</description>${posts.map((post) => `<item><title>${escapeHtml(post.title)}</title><link>${absolute(`/posts/${post.slug}/`)}</link><guid>${absolute(`/posts/${post.slug}/`)}</guid><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate><description>${escapeHtml(post.summary)}</description></item>`).join("")}</channel></rss>`;
await write("rss.xml", rss);
await write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${absolute("/")}</loc></url><url><loc>${absolute("/about/")}</loc></url>${posts.map((post) => `<url><loc>${absolute(`/posts/${post.slug}/`)}</loc><lastmod>${post.date}</lastmod></url>`).join("")}</urlset>`);
await write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${absolute("/sitemap.xml")}\n`);
const version = await outputVersion();
await write("version.json", JSON.stringify({ version }));
const minifiedWorker = await minifyJavaScript(serviceWorker(version), { compress: true, mangle: true });
if (!minifiedWorker.code) throw new Error("Service worker minification produced no output");
await write("sw.js", minifiedWorker.code);
console.log(`Freshmark built ${posts.length} posts to public/`);
