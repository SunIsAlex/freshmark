import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { build as bundle } from "esbuild";
import CleanCSS from "clean-css";
import { minify as minifyJavaScript } from "terser";
import config from "../site.config.mjs";
import { BuildWorkerPool } from "../lib/build-worker-pool.mjs";
import { defaultLocale, interpolate, locales, localizedPath } from "../lib/i18n.mjs";
import { parseFrontmatter, renderSummary, searchTextFromMarkdown, summaryFromBody } from "../lib/markdown.mjs";
import { enhanceResponsiveImages } from "../lib/responsive-images.mjs";
import { resolveBaseUrl } from "../lib/site-config.mjs";

const root = path.resolve(import.meta.dirname, "..");
const contentDir = path.join(root, "content", "posts");
const themeDir = path.join(root, "theme");
const outputDir = path.join(root, "public");
let buildWorkers;
const currentYear = new Date().getUTCFullYear();
const basePath = `/${String(config.basePath || "").replace(/^\/+|\/+$/g, "")}`.replace(/^\/$/, "");
const baseUrl = resolveBaseUrl(config.baseUrl);
let assetVersion = "";
let browserAssets = [];
const href = (value = "/") => `${basePath}${value.startsWith("/") ? value : `/${value}`}` || "/";
const assetHref = (value) => `${href(value)}${assetVersion ? `?v=${assetVersion}` : ""}`;
const absolute = (value) => new URL(href(value), baseUrl).href;
const localeHref = (locale, value = "/") => href(localizedPath(locale, value));
const localeAbsolute = (locale, value = "/") => absolute(localizedPath(locale, value));
const criticalResult = new CleanCSS({ level: 2 }).minify(await fs.readFile(path.join(themeDir, "critical.css"), "utf8"));
if (criticalResult.errors.length) throw new Error(`Critical CSS minification failed: ${criticalResult.errors.join(", ")}`);
const criticalCss = criticalResult.styles.replace("__FRESHMARK_ANTHROPIC_FONT__", href("/assets/fonts/anthropic-sans-variable.woff2"));
const brandIcon = (await fs.readFile(path.join(themeDir, "favicon.svg"), "utf8"))
  .replace("<svg ", '<svg class="brand-mark" width="28" height="28" aria-hidden="true" focusable="false" ');

const escapeHtml = (text = "") => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const formatDate = (locale, value) => new Intl.DateTimeFormat(locales[locale].language, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
const formatLongDate = (locale, value) => new Intl.DateTimeFormat(locales[locale].language, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));

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
  const loadedPosts = await Promise.all(files.map(async (file) => {
    const sourceFile = file.split(path.sep).join("/");
    const source = await fs.readFile(path.join(contentDir, sourceFile), "utf8");
    const { data, body } = parseFrontmatter(source, sourceFile);
    if (data.draft === true && process.env.FRESHMARK_DRAFTS !== "true") return null;
    for (const key of ["title", "date"]) if (!data[key]) throw new Error(`${sourceFile}: missing ${key} in frontmatter`);
    const localizedFile = sourceFile.match(/\.([a-z]{2})\.md$/);
    const requestedLocale = String(data.lang || localizedFile?.[1] || defaultLocale).split("-")[0];
    const locale = locales[requestedLocale] ? requestedLocale : defaultLocale;
    const suffix = localizedFile && locales[localizedFile[1]] ? `.${localizedFile[1]}.md` : ".md";
    const date = String(data.date).slice(0, 10);
    const { html, headings, spaHtml, spaHeadings } = await buildWorkers.run("render-markdown", { body, sourceFile });
    const words = body.replace(/[#*`>\[\]()_-]/g, " ").split(/\s+/).filter(Boolean).length;
    const relativeSlug = sourceFile.slice(0, -suffix.length).replace(/(^|\/)index$/, "");
    const summary = data.summary || data.description || summaryFromBody(body);
    return {
      slug: relativeSlug, sourceFile, locale, translationKey: data.translationKey || relativeSlug, alternate: data.alternate || "", title: data.title, date, summary,
      tags: Array.isArray(data.tags) ? data.tags : [], categories: Array.isArray(data.categories) ? data.categories : [], featured: data.featured === true,
      readingTime: Math.max(1, Math.ceil(words / 220)), html, headings, spaHtml, spaHeadings,
      searchText: searchTextFromMarkdown(body),
    };
  }));
  const posts = loadedPosts.filter(Boolean);
  const groups = new Map();
  for (const post of posts) {
    if (!groups.has(post.translationKey)) groups.set(post.translationKey, new Map());
    groups.get(post.translationKey).set(post.locale, post);
  }
  for (const post of posts) {
    post.translations = groups.get(post.translationKey);
    const alternateLocale = locales[post.locale].alternate;
    const alternatePost = post.translations.get(alternateLocale);
    post.hasTranslation = Boolean(alternatePost);
    post.alternatePath = alternatePost ? localizedPath(alternateLocale, `/posts/${alternatePost.slug}/`) : localizedPath(alternateLocale, "/");
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

const searchIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const moonIcon = '<svg data-theme-icon width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 15.1A8.5 8.5 0 0 1 8.9 4a8.5 8.5 0 1 0 11.1 11.1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';

function header(locale, alternatePath = localizedPath(locales[locale].alternate, "/")) {
  const messages = locales[locale];
  const alternate = locales[messages.alternate];
  return `<header class="container header"><a class="brand" href="${localeHref(locale, "/")}" aria-label="${escapeHtml(config.title)}">${brandIcon}${escapeHtml(config.title)}</a><nav class="nav" aria-label="${escapeHtml(messages.mainNavigation)}"><a href="${localeHref(locale, "/#writing")}">${escapeHtml(messages.writing)}</a><a href="${localeHref(locale, "/about/")}">${escapeHtml(messages.about)}</a><a href="${localeHref(locale, "/rss.xml")}">RSS</a><a class="language-switch" href="${href(alternatePath)}" hreflang="${alternate.language}" lang="${alternate.language}" data-no-spa>${escapeHtml(messages.switchLabel)}</a><button class="icon-btn" type="button" data-search-open aria-label="${escapeHtml(messages.openSearch)}">${searchIcon}</button><button class="icon-btn" type="button" data-theme-toggle aria-label="${escapeHtml(messages.switchTheme)}">${moonIcon}</button></nav></header>`;
}

function footer(locale) {
  const messages = locales[locale];
  return `<footer class="container footer"><span>© ${currentYear} ${escapeHtml(config.title)}. ${escapeHtml(messages.footerNote)}</span><div class="footer-links"><a href="${localeHref(locale, "/about/")}">${escapeHtml(messages.about)}</a><a href="${localeHref(locale, "/rss.xml")}">RSS</a><a href="#">${escapeHtml(messages.top)}</a></div></footer>`;
}

function searchModal(locale) {
  const messages = locales[locale];
  return `<div class="search-modal" data-search-modal role="dialog" aria-modal="true" aria-label="${escapeHtml(messages.searchArticles)}" hidden><div class="search-panel"><div class="search-field">${searchIcon}<input data-search-input placeholder="${escapeHtml(messages.searchPlaceholder)}" aria-label="${escapeHtml(messages.searchArticles)}" autocomplete="off"><button type="button" data-search-close aria-label="${escapeHtml(messages.closeSearch)}">Esc</button></div><div class="search-results" data-search-results></div></div></div>`;
}

function page({ locale = defaultLocale, title, description, content, article = false, pathName = "/", alternatePath = localizedPath(locales[locale].alternate, "/"), hasAlternate = true }) {
  const messages = locales[locale];
  const alternateLocale = messages.alternate;
  const alternate = locales[alternateLocale];
  const pageDescription = description || messages.siteDescription;
  const fullTitle = title ? `${escapeHtml(title)} — ${escapeHtml(config.title)}` : `${escapeHtml(config.title)} — ${escapeHtml(messages.siteDescription)}`;
  const stylesUrl = assetHref("/assets/styles.css");
  const deferredStyles = `<link rel="preload" href="${stylesUrl}" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${stylesUrl}"></noscript>`;
  const mathStyles = content.includes('class="katex"') ? `<link rel="stylesheet" href="${assetHref("/assets/katex.min.css")}" data-katex-styles>` : "";
  const defaultPath = locale === defaultLocale ? pathName : alternatePath;
  const alternateLink = hasAlternate ? `<link rel="alternate" hreflang="${alternate.language}" href="${absolute(alternatePath)}">` : "";
  return `<!doctype html><html lang="${escapeHtml(messages.language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="${escapeHtml(config.themeColor)}"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="${escapeHtml(config.title)}"><meta name="codex-preview" content="development"><title>${fullTitle}</title><meta name="description" content="${escapeHtml(pageDescription)}"><link rel="canonical" href="${absolute(pathName)}"><link rel="alternate" hreflang="${messages.language}" href="${absolute(pathName)}">${alternateLink}<link rel="alternate" hreflang="x-default" href="${absolute(defaultPath)}"><link rel="manifest" href="${localeHref(locale, "/manifest.webmanifest")}"><link rel="icon" href="${href("/favicon.svg")}" type="image/svg+xml"><link rel="apple-touch-icon" href="${href("/icons/apple-touch-icon.png")}"><link rel="alternate" type="application/rss+xml" title="${escapeHtml(config.title)} RSS" href="${localeHref(locale, "/rss.xml")}"><script>try{document.documentElement.dataset.theme=localStorage.getItem('freshmark-theme')||''}catch(e){}</script><style data-critical>${criticalCss}</style>${mathStyles}${deferredStyles}</head><body><div class="site-shell"><div class="ambient"></div>${article ? '<div class="reading-progress" data-reading-progress></div>' : ""}${header(locale, alternatePath)}${content}${footer(locale)}${searchModal(locale)}</div><script>window.FRESHMARK={basePath:${JSON.stringify(basePath)},title:${JSON.stringify(config.title)},locale:${JSON.stringify(locale)},language:${JSON.stringify(messages.language)},messages:${JSON.stringify(messages)},localeRoot:${JSON.stringify(localeHref(locale, "/"))},alternateRoot:${JSON.stringify(localeHref(alternateLocale, "/"))},postsRoot:${JSON.stringify(localeHref(locale, "/posts/"))},searchIndexPath:${JSON.stringify(localeHref(locale, "/search-index.json"))},assetVersion:${JSON.stringify(assetVersion)}};</script><script type="module" src="${assetHref("/assets/app.js")}"></script></body></html>`;
}

function webManifest(locale = defaultLocale) {
  const messages = locales[locale];
  return JSON.stringify({
    id: localeHref(locale, "/"),
    name: config.title,
    short_name: config.title,
    description: messages.siteDescription,
    lang: messages.language,
    start_url: localeHref(locale, "/"),
    scope: localeHref(locale, "/"),
    display: "standalone",
    background_color: config.backgroundColor,
    theme_color: config.themeColor,
    icons: [
      { src: href("/icons/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: href("/icons/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  });
}

function pageFragment(html, { locale = defaultLocale, title, description, pathName = "/", article = false, alternatePath = localizedPath(locales[locale].alternate, "/") }) {
  const content = html.match(/<main[\s\S]*<\/main>/)?.[0];
  if (!content) throw new Error(`Could not extract main content for ${pathName}`);
  const pageTitle = title ? `${title} — ${config.title}` : `${config.title} — ${locales[locale].siteDescription}`;
  return `<meta data-freshmark-page data-title="${escapeHtml(pageTitle)}" data-description="${escapeHtml(description || locales[locale].siteDescription)}" data-canonical="${absolute(pathName)}" data-alternate="${absolute(alternatePath)}" data-article="${article}">${content}`;
}

async function homePage(locale, posts, { mathOutput = "html", fragment = false } = {}) {
  const messages = locales[locale];
  const featured = posts.find((post) => post.featured) || posts[0];
  const categories = [...new Set(posts.flatMap((post) => post.categories))];
  const cards = (await Promise.all(posts.filter((post) => post !== featured).map(async (post) => `<a class="post-card" href="${localeHref(locale, `/posts/${post.slug}/`)}" data-post-card data-tags="${escapeHtml(post.categories.join("|"))}"><time class="post-date" datetime="${post.date}">${formatDate(locale, post.date)}</time><div><h3>${escapeHtml(post.title)}</h3><p>${await renderSummary(post.summary, { links: false, mathOutput })}</p></div><span class="post-arrow" aria-hidden="true">↗</span></a>`))).join("");
  const featuredSummary = await renderSummary(featured.summary, { mathOutput });
  const content = `<main><section class="container hero"><div><p class="eyebrow">${escapeHtml(messages.tagline)}</p><h1>${escapeHtml(messages.heroLead)} <em>${escapeHtml(messages.heroEmphasis)}</em></h1></div><div class="hero-side"><p>${escapeHtml(messages.intro)}</p><button class="search-trigger" type="button" data-search-open>${searchIcon}<span>${escapeHtml(messages.searchArchive)}</span><kbd>⌘ K</kbd></button></div></section><section class="container featured" aria-label="${escapeHtml(messages.featuredArticle)}"><div class="featured-art" aria-hidden="true"><span class="art-line"></span><span class="art-dot"></span></div><div class="featured-copy"><span class="meta">${escapeHtml(messages.featured)} · ${escapeHtml(interpolate(messages.minuteRead, { minutes: featured.readingTime }))}</span><h2>${escapeHtml(featured.title)}</h2><p>${featuredSummary}</p><a class="read-link" href="${localeHref(locale, `/posts/${featured.slug}/`)}">${escapeHtml(messages.readEssay)} <span aria-hidden="true">→</span></a></div></section><section class="container post-section" id="writing"><div class="section-head"><div><p class="eyebrow">${escapeHtml(messages.archive)}</p><h2>${escapeHtml(messages.recentWriting)}</h2></div><div class="tag-row" aria-label="${escapeHtml(messages.filterByCategory)}"><button class="tag-filter active" type="button" data-tag="__all__">${escapeHtml(messages.all)}</button>${categories.map((category) => `<button class="tag-filter" type="button" data-tag="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}</div></div><div class="post-list" data-post-list>${cards}<p class="empty" data-filter-empty hidden>${escapeHtml(messages.emptyCategory)}</p></div></section></main>`;
  if (fragment) return content;
  const pathName = localizedPath(locale, "/");
  return page({ locale, content, pathName, alternatePath: localizedPath(messages.alternate, "/") });
}

async function postPage(post, { mathOutput = "html", fragment = false } = {}) {
  const messages = locales[post.locale];
  const headings = mathOutput === "source" ? post.spaHeadings : post.headings;
  const articleHtml = mathOutput === "source" ? post.spaHtml : post.html;
  const toc = headings.map((heading) => `<a class="toc-level-${heading.level}" href="#${heading.id}">${heading.html || escapeHtml(heading.text)}</a>`).join("");
  const tags = post.tags.map(escapeHtml).join(" · ");
  const content = `<main><header class="container article-header"><a class="back-link" href="${localeHref(post.locale, "/")}">${escapeHtml(messages.backToWriting)}</a><h1>${escapeHtml(post.title)}</h1><p class="article-dek">${await renderSummary(post.summary, { mathOutput })}</p><div class="article-meta"><time datetime="${post.date}">${formatLongDate(post.locale, post.date)}</time><span>${escapeHtml(interpolate(messages.minuteRead, { minutes: post.readingTime }))}</span>${tags ? `<span>${tags}</span>` : ""}<a href="index.md" download>${escapeHtml(messages.downloadMarkdown)}</a></div></header><div class="article-wrap"><aside class="toc"><div class="toc-head"><p>${escapeHtml(messages.onThisPage)}</p><button class="toc-toggle" type="button" data-toc-toggle aria-expanded="false" aria-label="${escapeHtml(messages.toggleToc)}"><span class="toc-toggle-label">${escapeHtml(messages.tableOfContents)}</span><span class="toc-toggle-icon" aria-hidden="true"></span></button></div><nav class="toc-links" data-toc-links aria-label="${escapeHtml(messages.tableOfContents)}">${toc}</nav></aside><article class="prose">${articleHtml}</article></div></main>`;
  if (fragment) return content;
  const pathName = localizedPath(post.locale, `/posts/${post.slug}/`);
  return page({ locale: post.locale, title: post.title, description: post.summary, content, article: true, pathName, alternatePath: post.alternatePath, hasAlternate: post.hasTranslation });
}

function aboutPage(locale) {
  const messages = locales[locale];
  const content = `<main><header class="container article-header"><p class="eyebrow">${escapeHtml(messages.aboutEyebrow)}</p><h1>${escapeHtml(messages.aboutTitle)}</h1><p class="article-dek">${escapeHtml(messages.aboutDek)}</p></header><div class="article-wrap"><aside class="toc"><p>${escapeHtml(messages.aboutIdea)}</p><a href="#principles">${escapeHtml(messages.principles)}</a><a href="#contact">${escapeHtml(messages.sayHello)}</a></aside><article class="prose"><p>${escapeHtml(messages.aboutBody)}</p><h2 id="principles">${escapeHtml(messages.principles)}</h2><ul>${messages.principleItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><h2 id="contact">${escapeHtml(messages.sayHello)}</h2><p>${escapeHtml(messages.contactBody)}</p></article></div></main>`;
  const pathName = localizedPath(locale, "/about/");
  return page({ locale, title: messages.about, description: messages.aboutDek, content, pathName, alternatePath: localizedPath(messages.alternate, "/about/") });
}

async function write(relative, content) {
  const target = path.join(outputDir, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  if (relative.endsWith(".html")) content = await buildWorkers.run("minify-html", { html: content });
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
  const localizedPrecache = Object.keys(locales).flatMap((locale) => [
    localizedPath(locale, "/"),
    localizedPath(locale, "/404.html"),
    localizedPath(locale, "/about/"),
    localizedPath(locale, "/page.html"),
    localizedPath(locale, "/about/page.html"),
    localizedPath(locale, "/search-index.json"),
    localizedPath(locale, "/rss.xml"),
    localizedPath(locale, "/manifest.webmanifest"),
  ]);
  return `const VERSION=${JSON.stringify(version)};
const CACHE_NAME="freshmark-"+VERSION;
const BASE_PATH=${JSON.stringify(basePath)};
const ASSET_VERSION=${JSON.stringify(assetVersion)};
const LOCALIZED_NOT_FOUND=${JSON.stringify(Object.keys(locales).filter((locale) => locale !== defaultLocale).map((locale) => [`/${locale}/`, localizedPath(locale, "/404.html")]))};
const at=(path)=>BASE_PATH+path;
const versioned=(path)=>at(path)+"?v="+ASSET_VERSION;
  const PRECACHE=${JSON.stringify([...localizedPrecache, "/favicon.svg", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png", "/assets/fonts/anthropic-sans-variable.woff2"])}.map(at).concat([versioned("/assets/styles.css"),versioned("/assets/app.js")],${JSON.stringify(browserAssets.filter((file) => file !== "app.js").map((file) => `/assets/${file}`))}.map(at));
self.addEventListener("install",(event)=>event.waitUntil(caches.open(CACHE_NAME).then((cache)=>cache.addAll(PRECACHE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",(event)=>event.waitUntil(caches.keys().then((names)=>Promise.all(names.filter((name)=>name.startsWith("freshmark-")&&name!==CACHE_NAME).map((name)=>caches.delete(name)))).then(()=>self.clients.claim())));
const cacheResponse=async(request,response)=>{if(response&&response.ok){const cache=await caches.open(CACHE_NAME);await cache.put(request,response.clone())}return response};
const cacheFirst=async(request)=>(await caches.match(request))||cacheResponse(request,await fetch(request));
const networkFirst=async(request)=>{try{return await cacheResponse(request,await fetch(request))}catch{const path=new URL(request.url).pathname.slice(BASE_PATH.length);const fallback=LOCALIZED_NOT_FOUND.find(([prefix])=>path.startsWith(prefix))?.[1]||"/404.html";return (await caches.match(request))||(request.mode==="navigate"?caches.match(at(fallback)):Response.error())}};
const staleWhileRevalidate=async(request)=>{const cached=await caches.match(request);const fresh=fetch(request).then((response)=>cacheResponse(request,response)).catch(()=>null);return cached||await fresh||Response.error()};
const navigationResponse=(request,event)=>{const cached=caches.match(request);const network=fetch(request);const cacheUpdate=network.then((response)=>response.ok?caches.open(CACHE_NAME).then((cache)=>cache.put(request,response.clone())):undefined).catch(()=>undefined);event.waitUntil(cacheUpdate);return cached.then(async(response)=>{if(response)return response;try{return await network}catch{const path=new URL(request.url).pathname.slice(BASE_PATH.length);const fallback=LOCALIZED_NOT_FOUND.find(([prefix])=>path.startsWith(prefix))?.[1]||"/404.html";return caches.match(at(fallback))}})};
self.addEventListener("fetch",(event)=>{const request=event.request;if(request.method!=="GET")return;const url=new URL(request.url);if(url.origin!==self.location.origin||!url.pathname.startsWith(BASE_PATH||"/"))return;const path=url.pathname.slice(BASE_PATH.length);if(request.mode==="navigate")event.respondWith(navigationResponse(request,event));else if(path.endsWith(".html")||path.endsWith("/search-index.json")||path.endsWith("/rss.xml")||path==="/sitemap.xml")event.respondWith(networkFirst(request));else if(path.endsWith(".md"))event.respondWith(staleWhileRevalidate(request));else if(path.startsWith("/assets/")||/\.(?:png|jpe?g|gif|webp|svg|avif|ttf|woff2?)$/i.test(path))event.respondWith(cacheFirst(request));});
`;
}

buildWorkers = new BuildWorkerPool({
  workerUrl: new URL("./build-worker.mjs", import.meta.url),
});
try {
const posts = await loadPosts();
if (!posts.length) throw new Error("No publishable Markdown posts found.");
await fs.mkdir(outputDir, { recursive: true });
await Promise.all((await fs.readdir(outputDir)).map((entry) => fs.rm(path.join(outputDir, entry), { recursive: true, force: true })));
await fs.mkdir(path.join(outputDir, "assets", "fonts"), { recursive: true });
const styles = new CleanCSS({ level: 2 }).minify([
  await fs.readFile(path.join(root, "node_modules", "photoswipe", "dist", "photoswipe.css"), "utf8"),
  await fs.readFile(path.join(themeDir, "styles.css"), "utf8"),
].join("\n"));
const katexStyles = await fs.readFile(path.join(root, "node_modules", "katex", "dist", "katex.min.css"));
const katexFontDirectory = path.join(root, "node_modules", "katex", "dist", "fonts");
const katexFonts = (await fs.readdir(katexFontDirectory)).filter((file) => file.endsWith(".woff2"));
if (styles.errors.length) throw new Error(`CSS minification failed: ${styles.errors.join(", ")}`);
await Promise.all([
  fs.writeFile(path.join(outputDir, "assets", "styles.css"), styles.styles),
  fs.writeFile(path.join(outputDir, "assets", "katex.min.css"), katexStyles),
  fs.copyFile(path.join(themeDir, "favicon.svg"), path.join(outputDir, "favicon.svg")),
  fs.cp(path.join(themeDir, "icons"), path.join(outputDir, "icons"), { recursive: true }),
  fs.copyFile(path.join(themeDir, "fonts", "anthropic-sans-variable.woff2"), path.join(outputDir, "assets", "fonts", "anthropic-sans-variable.woff2")),
  ...katexFonts.map((file) => fs.copyFile(path.join(katexFontDirectory, file), path.join(outputDir, "assets", "fonts", file))),
]);
const bundled = await bundle({
  entryPoints: [path.join(themeDir, "app.js")],
  bundle: true,
  chunkNames: "chunks/[name]-[hash]",
  entryNames: "[name]",
  format: "esm",
  minify: true,
  outdir: path.join(outputDir, "assets"),
  platform: "browser",
  splitting: true,
  target: ["es2020"],
  write: false,
});
const browserBundles = bundled.outputFiles.map((file) => ({
  file: path.relative(path.join(outputDir, "assets"), file.path).split(path.sep).join("/"),
  code: file.contents,
}));
browserAssets = browserBundles.map(({ file }) => file);
const assetHash = createHash("sha256").update(styles.styles).update(katexStyles);
for (const { file, code } of browserBundles) assetHash.update(file).update("\0").update(code).update("\0");
assetVersion = assetHash.digest("hex").slice(0, 12);
await Promise.all(browserBundles.map(async ({ file, code }) => {
  const target = path.join(outputDir, "assets", file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, code);
}));
await fs.cp(contentDir, path.join(outputDir, "posts"), {
  recursive: true,
  filter: (source) => !source.endsWith(".md") && !source.endsWith(".md.bak"),
});
const localeOutput = (locale, relative) => `${locale === defaultLocale ? "" : `${locale}/`}${relative}`;
await enhanceResponsiveImages(posts, {
  contentDirectory: contentDir,
  outputDirectory: outputDir,
  cacheDirectory: path.join(root, ".freshmark-cache", "images"),
  articleOutputDirectory: (post) => path.join(outputDir, localeOutput(post.locale, `posts/${post.slug}`)),
});
const postsByLocale = Object.fromEntries(Object.keys(locales).map((locale) => [locale, posts.filter((post) => post.locale === locale)]));
await Promise.all(Object.keys(locales).map(async (locale) => {
  const messages = locales[locale];
  const localePosts = postsByLocale[locale];
  if (!localePosts.length) throw new Error(`No publishable Markdown posts found for locale ${locale}.`);
  const homeHtml = await homePage(locale, localePosts);
  const homeSpaHtml = await homePage(locale, localePosts, { mathOutput: "source", fragment: true });
  const aboutHtml = aboutPage(locale);
  const homePath = localizedPath(locale, "/");
  const aboutPath = localizedPath(locale, "/about/");
  const notFoundPath = localizedPath(locale, "/404.html");
  const notFound = `<main class="container article-header"><p class="eyebrow">404</p><h1>${escapeHtml(messages.notFoundTitle)}</h1><p class="article-dek"><a class="read-link" href="${localeHref(locale, "/")}">${escapeHtml(messages.returnToWriting)}</a></p></main>`;
  const searchIndex = localePosts.map(({ slug, title, summary, tags, categories, readingTime, searchText }) => ({
    title,
    summary: searchTextFromMarkdown(summary),
    tags,
    categories,
    readingTime,
    searchText,
    url: localeHref(locale, `/posts/${slug}/`),
  }));
  const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeHtml(config.title)}</title><link>${localeAbsolute(locale, "/")}</link><description>${escapeHtml(messages.siteDescription)}</description><language>${escapeHtml(messages.language)}</language>${localePosts.map((post) => `<item><title>${escapeHtml(post.title)}</title><link>${localeAbsolute(locale, `/posts/${post.slug}/`)}</link><guid>${localeAbsolute(locale, `/posts/${post.slug}/`)}</guid><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate><description>${escapeHtml(post.summary)}</description></item>`).join("")}</channel></rss>`;
  await Promise.all([
    write(localeOutput(locale, "index.html"), homeHtml),
    write(localeOutput(locale, "page.html"), pageFragment(homeSpaHtml, { locale, pathName: homePath, alternatePath: localizedPath(messages.alternate, "/") })),
    write(localeOutput(locale, "about/index.html"), aboutHtml),
    write(localeOutput(locale, "about/page.html"), pageFragment(aboutHtml, { locale, title: messages.about, description: messages.aboutDek, pathName: aboutPath, alternatePath: localizedPath(messages.alternate, "/about/") })),
    write(localeOutput(locale, "404.html"), page({ locale, title: "404", description: messages.notFoundDescription, content: notFound, pathName: notFoundPath, alternatePath: localizedPath(messages.alternate, "/404.html") })),
    write(localeOutput(locale, "search-index.json"), JSON.stringify(searchIndex)),
    write(localeOutput(locale, "manifest.webmanifest"), webManifest(locale)),
    write(localeOutput(locale, "rss.xml"), rss),
  ]);
}));

await Promise.all(posts.map(async (post) => {
  const html = await postPage(post);
  const spaHtml = await postPage(post, { mathOutput: "source", fragment: true });
  const directory = localeOutput(post.locale, `posts/${post.slug}`);
  await fs.mkdir(path.join(outputDir, directory), { recursive: true });
  const writes = [
    write(`${directory}/index.html`, html),
    write(`${directory}/page.html`, pageFragment(spaHtml, {
      locale: post.locale,
      title: post.title,
      description: post.summary,
      pathName: localizedPath(post.locale, `/posts/${post.slug}/`),
      article: true,
      alternatePath: post.alternatePath,
    })),
    fs.copyFile(path.join(contentDir, post.sourceFile), path.join(outputDir, directory, "index.md")),
  ];
  if (post.locale !== defaultLocale) {
    const sourceDirectory = path.dirname(path.join(contentDir, post.sourceFile));
    writes.push(fs.cp(sourceDirectory, path.join(outputDir, directory), {
      recursive: true,
      filter: (source) => source === sourceDirectory || (!source.endsWith(".md") && !source.endsWith(".md.bak")),
    }));
  }
  await Promise.all(writes);
}));

const sitemapPages = Object.keys(locales).flatMap((locale) => [localizedPath(locale, "/"), localizedPath(locale, "/about/")]);
await write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapPages.map((pathName) => `<url><loc>${absolute(pathName)}</loc></url>`).join("")}${posts.map((post) => `<url><loc>${localeAbsolute(post.locale, `/posts/${post.slug}/`)}</loc><lastmod>${post.date}</lastmod></url>`).join("")}</urlset>`);
await write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${absolute("/sitemap.xml")}\n`);
const version = await outputVersion();
await write("version.json", JSON.stringify({ version }));
const minifiedWorker = await minifyJavaScript(serviceWorker(version), { compress: true, mangle: true });
if (!minifiedWorker.code) throw new Error("Service worker minification produced no output");
await write("sw.js", minifiedWorker.code);
console.log(`Freshmark built ${posts.length} posts to public/`);
} finally {
  await buildWorkers.close();
}
