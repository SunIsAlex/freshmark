import { parseFrontmatter, renderMarkdown, summaryFromBody } from "../lib/markdown.mjs";

(() => {
  const root = document.documentElement;
  const basePath = window.FRESHMARK?.basePath || "";
  const modal = document.querySelector("[data-search-modal]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const shell = document.querySelector(".site-shell");
  const pageCache = new Map();
  const prefetchQueue = [];
  const queuedPrefetches = new Set();
  let prefetching = false;
  let index;

  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
  const setTheme = (theme) => { root.dataset.theme = theme; try { localStorage.setItem("freshmark-theme", theme); } catch {} };

  async function loadIndex() {
    if (!index) index = await fetch(`${basePath}/search-index.json`).then((response) => response.json());
    return index;
  }

  function draw(items) {
    if (!items.length) { results.innerHTML = '<p class="search-hint">No matching notes. Try a broader word.</p>'; return; }
    results.innerHTML = items.slice(0, 8).map((post) => `<a class="search-result" href="${escape(post.url)}"><strong>${escape(post.title)}</strong><span>${escape([...(post.categories || []), ...post.tags].join(" · "))} · ${post.readingTime} min read</span></a>`).join("");
  }

  async function openSearch() {
    modal.hidden = false; document.body.style.overflow = "hidden"; input.focus();
    try { draw(await loadIndex()); } catch { results.innerHTML = '<p class="search-hint">Search index could not be loaded.</p>'; }
  }
  function closeSearch() { modal.hidden = true; document.body.style.overflow = ""; input.value = ""; }

  document.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);
  modal?.addEventListener("click", (event) => { if (event.target === modal) closeSearch(); });
  input?.addEventListener("input", async () => {
    const needle = input.value.toLowerCase().trim(); const posts = await loadIndex();
    draw(!needle ? posts : posts.filter((post) => `${post.title} ${post.summary} ${(post.categories || []).join(" ")} ${post.tags.join(" ")} ${post.searchText}`.toLowerCase().includes(needle)));
  });
  addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(event.target.tagName)) { event.preventDefault(); openSearch(); }
    if (event.key === "Escape" && !modal?.hidden) closeSearch();
  });

  function applyFilter(button) {
    const filters = document.querySelectorAll("[data-tag]");
    const cards = document.querySelectorAll("[data-post-card]");
    filters.forEach((item) => item.classList.toggle("active", item === button));
    let shown = 0;
    cards.forEach((card) => {
      const visible = button.dataset.tag === "All" || card.dataset.tags.split("|").includes(button.dataset.tag);
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    const empty = document.querySelector("[data-filter-empty]");
    if (empty) empty.hidden = shown !== 0;
  }

  function updateProgress() {
    const progress = document.querySelector("[data-reading-progress]");
    if (!progress) return;
    const total = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${total > 0 ? Math.min(100, scrollY / total * 100) : 0}%`;
  }

  function renderMath(scope = document) {
    if (typeof renderMathInElement !== "function") return;
    renderMathInElement(scope, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
      strict: "ignore",
    });
  }

  function isSpaRoute(url) {
    const base = `${basePath}/`.replace(/\/+/g, "/");
    return url.origin === location.origin
      && (url.pathname === basePath || url.pathname.startsWith(base))
      && (url.pathname.endsWith("/") || url.pathname.endsWith(".html"));
  }

  function updateMetadata(page) {
    document.title = page.title;
    document.head.querySelector('meta[name="description"]')?.setAttribute("content", page.description);
    document.head.querySelector('link[rel="canonical"]')?.setAttribute("href", page.canonical);
  }

  async function getPage(url) {
    const key = `${url.pathname}${url.search}`;
    if (!pageCache.has(key)) {
      let page;
      const postsBase = `${basePath}/posts/`.replace(/\/+/g, "/");
      if (url.pathname.startsWith(postsBase) && url.pathname.endsWith("/")) {
        const markdownUrl = new URL("index.md", url);
        const response = await fetch(`${markdownUrl.pathname}${markdownUrl.search}`, { headers: { "X-Freshmark-Navigation": "spa" } });
        if (response.ok) page = articlePage(await response.text(), url);
      } else if (url.pathname.endsWith("/")) {
        const fragmentUrl = new URL("page.html", url);
        const response = await fetch(`${fragmentUrl.pathname}${fragmentUrl.search}`, { headers: { "X-Freshmark-Navigation": "spa" } });
        if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
          const fragmentDocument = new DOMParser().parseFromString(await response.text(), "text/html");
          const metadata = fragmentDocument.querySelector("[data-freshmark-page]");
          page = {
            title: metadata?.dataset.title || "",
            description: metadata?.dataset.description || "",
            canonical: metadata?.dataset.canonical || url.href,
            article: metadata?.dataset.article === "true",
            html: fragmentDocument.querySelector("main")?.outerHTML,
          };
        }
      }
      if (!page) {
        const response = await fetch(key, { headers: { "X-Freshmark-Navigation": "spa" } });
        if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) throw new Error(`Could not load ${key}`);
        const nextDocument = new DOMParser().parseFromString(await response.text(), "text/html");
        page = {
          title: nextDocument.title,
          description: nextDocument.head.querySelector('meta[name="description"]')?.content || "",
          canonical: nextDocument.head.querySelector('link[rel="canonical"]')?.href || url.href,
          article: Boolean(nextDocument.querySelector("[data-reading-progress]")),
          html: nextDocument.querySelector("main")?.outerHTML,
        };
      }
      if (!page.html) throw new Error(`Page has no main content: ${key}`);
      pageCache.set(key, page);
    }
    return pageCache.get(key);
  }

  function articlePage(source, url) {
    const { data, body } = parseFrontmatter(source, url.pathname);
    const { html, headings } = renderMarkdown(body);
    const date = String(data.date).slice(0, 10);
    const summary = data.summary || data.description || summaryFromBody(body);
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const words = body.replace(/[#*`>\[\]()_-]/g, " ").split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 220));
    const formattedDate = new Intl.DateTimeFormat(window.FRESHMARK.language, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
    const toc = headings.map((heading) => `<a href="#${escape(heading.id)}">${escape(heading.text)}</a>`).join("");
    const tagText = tags.map(escape).join(" · ");
    const main = `<main><header class="container article-header"><a class="back-link" href="${basePath || "/"}">← Back to all writing</a><h1>${escape(data.title)}</h1><p class="article-dek">${escape(summary)}</p><div class="article-meta"><time datetime="${date}">${formattedDate}</time><span>${readingTime} min read</span>${tagText ? `<span>${tagText}</span>` : ""}<a href="index.md" download>Download Markdown</a></div></header><div class="article-wrap"><aside class="toc"><p>On this page</p>${toc}</aside><article class="prose">${html}</article></div></main>`;
    return {
      title: `${data.title} — ${window.FRESHMARK.title}`,
      description: summary,
      canonical: url.href,
      article: true,
      html: main,
    };
  }

  function canPrefetch() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return navigator.onLine !== false
      && !connection?.saveData
      && connection?.type !== "cellular"
      && !["slow-2g", "2g", "3g"].includes(connection?.effectiveType);
  }

  function idle(callback) {
    if (typeof requestIdleCallback === "function") requestIdleCallback(callback, { timeout: 2000 });
    else setTimeout(callback, 800);
  }

  function drainPrefetchQueue() {
    if (prefetching || !prefetchQueue.length || !canPrefetch()) return;
    prefetching = true;
    idle(async () => {
      if (canPrefetch()) {
        const url = prefetchQueue.shift();
        try { await getPage(url); } catch {}
      }
      prefetching = false;
      drainPrefetchQueue();
    });
  }

  function scheduleArticlePrefetch(scope = document) {
    const postsBase = `${basePath}/posts/`.replace(/\/+/g, "/");
    for (const anchor of scope.querySelectorAll("a[href]")) {
      const url = new URL(anchor.href, location.href);
      const key = `${url.pathname}${url.search}`;
      if (url.origin !== location.origin || !url.pathname.startsWith(postsBase) || !url.pathname.endsWith("/") || pageCache.has(key) || queuedPrefetches.has(key)) continue;
      queuedPrefetches.add(key);
      prefetchQueue.push(url);
    }
    drainPrefetchQueue();
  }

  function rebaseMainUrls(main, pageUrl) {
    for (const element of main.querySelectorAll("[src], a[href]")) {
      const attribute = element.hasAttribute("src") ? "src" : "href";
      const value = element.getAttribute(attribute);
      if (!value || value.startsWith("#") || /^(?:data:|mailto:|tel:|javascript:)/i.test(value)) continue;
      element.setAttribute(attribute, new URL(value, pageUrl).href);
    }
    for (const element of main.querySelectorAll("[srcset]")) {
      const rebased = element.getAttribute("srcset").split(",").map((candidate) => {
        const [source, ...descriptor] = candidate.trim().split(/\s+/);
        return `${new URL(source, pageUrl).href}${descriptor.length ? ` ${descriptor.join(" ")}` : ""}`;
      }).join(", ");
      element.setAttribute("srcset", rebased);
    }
    for (const element of main.querySelectorAll("[poster]")) {
      element.setAttribute("poster", new URL(element.getAttribute("poster"), pageUrl).href);
    }
  }

  async function navigate(url, { push = true, restoreScroll = null } = {}) {
    shell.setAttribute("aria-busy", "true");
    try {
      const nextPage = await getPage(url);
      const nextDocument = new DOMParser().parseFromString(nextPage.html, "text/html");
      const nextMain = nextDocument.querySelector("main");
      const currentMain = document.querySelector("main");
      if (!nextMain || !currentMain) throw new Error("Page has no main content");
      rebaseMainUrls(nextMain, url);

      const swap = () => {
        currentMain.replaceWith(nextMain);
        renderMath(nextMain);
        scheduleArticlePrefetch(nextMain);
        document.querySelector("[data-reading-progress]")?.remove();
        if (nextPage.article) {
          const progress = document.createElement("div");
          progress.className = "reading-progress";
          progress.dataset.readingProgress = "";
          document.querySelector(".header")?.before(progress);
        }
        updateMetadata(nextPage);
      };
      if (document.startViewTransition) await document.startViewTransition(swap).finished;
      else swap();

      if (push) {
        history.replaceState({ ...(history.state || {}), scrollY }, "", location.href);
        history.pushState({ spa: true, scrollY: 0 }, "", url);
      }
      closeSearch();
      if (restoreScroll !== null) scrollTo(0, restoreScroll);
      else if (url.hash) document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
      else scrollTo(0, 0);
      updateProgress();
      const main = document.querySelector("main");
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
      main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
    } catch {
      location.href = url.href;
    } finally {
      shell.removeAttribute("aria-busy");
    }
  }

  document.addEventListener("click", (event) => {
    const command = event.target.closest("[data-search-open], [data-theme-toggle], [data-tag]");
    if (command?.matches("[data-search-open]")) { event.preventDefault(); openSearch(); return; }
    if (command?.matches("[data-theme-toggle]")) { event.preventDefault(); setTheme(root.dataset.theme === "dark" ? "light" : "dark"); return; }
    if (command?.matches("[data-tag]")) { event.preventDefault(); applyFilter(command); return; }

    const anchor = event.target.closest("a[href]");
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target || anchor.hasAttribute("download")) return;
    const url = new URL(anchor.href, location.href);
    if (!isSpaRoute(url) || (url.pathname === location.pathname && url.search === location.search)) return;
    event.preventDefault();
    navigate(url);
  });

  history.replaceState({ ...(history.state || {}), spa: true, scrollY }, "", location.href);
  addEventListener("popstate", (event) => navigate(new URL(location.href), { push: false, restoreScroll: event.state?.scrollY || 0 }));
  addEventListener("scroll", updateProgress, { passive: true });
  (navigator.connection || navigator.mozConnection || navigator.webkitConnection)?.addEventListener("change", drainPrefetchQueue);
  renderMath();
  updateProgress();
  scheduleArticlePrefetch();
})();
