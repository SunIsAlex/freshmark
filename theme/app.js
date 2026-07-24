(() => {
  const root = document.documentElement;
  const basePath = window.FRESHMARK?.basePath || "";
  const modal = document.querySelector("[data-search-modal]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const shell = document.querySelector(".site-shell");
  const gallery = document.querySelector("[data-image-gallery]");
  const galleryImage = gallery?.querySelector("[data-gallery-image]");
  const galleryCaption = gallery?.querySelector("[data-gallery-caption]");
  const galleryCount = gallery?.querySelector("[data-gallery-count]");
  const galleryPrevious = gallery?.querySelector("[data-gallery-prev]");
  const galleryNext = gallery?.querySelector("[data-gallery-next]");
  const galleryClose = gallery?.querySelector("[data-gallery-close]");
  const pageCache = new Map();
  const prefetchQueue = [];
  const queuedPrefetches = new Set();
  let prefetching = false;
  let renderedRoute = `${location.pathname}${location.search}`;
  let index;
  let markdownRenderer;
  let galleryItems = [];
  let galleryIndex = 0;
  let galleryReturnFocus;
  let bodyOverflow = "";
  let swipeStart;
  let lastImageTap = { image: null, time: 0 };

  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
  const setTheme = (theme) => { root.dataset.theme = theme; try { localStorage.setItem("freshmark-theme", theme); } catch {} };

  function loadMarkdownRenderer() {
    if (!markdownRenderer) markdownRenderer = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-markdown-renderer]");
      const script = existing || Object.assign(document.createElement("script"), {
        src: `${basePath}/assets/markdown.js`,
        async: true,
      });
      script.dataset.markdownRenderer = "";
      const ready = () => window.FRESHMARK_MARKDOWN ? resolve(window.FRESHMARK_MARKDOWN) : reject(new Error("Markdown renderer did not initialize"));
      if (window.FRESHMARK_MARKDOWN) ready();
      else {
        script.addEventListener("load", ready, { once: true });
        script.addEventListener("error", () => reject(new Error("Could not load Markdown renderer")), { once: true });
        if (!existing) document.head.append(script);
      }
    });
    return markdownRenderer;
  }

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

  function prepareGallery(scope = document) {
    for (const image of scope.querySelectorAll(".prose img")) {
      image.dataset.galleryItem = "";
      image.tabIndex = 0;
      image.setAttribute("aria-haspopup", "dialog");
      image.setAttribute("aria-label", `${image.alt || image.title || "Article image"}. Open image gallery`);
    }
  }

  function gallerySource(image) {
    return image.currentSrc || image.src;
  }

  function showGalleryImage(nextIndex) {
    if (!galleryItems.length) return;
    galleryIndex = (nextIndex + galleryItems.length) % galleryItems.length;
    const source = galleryItems[galleryIndex];
    const figureCaption = source.closest("figure")?.querySelector("figcaption")?.textContent.trim();
    const caption = source.title || figureCaption || source.alt || "";
    galleryImage.src = gallerySource(source);
    galleryImage.alt = source.alt || caption;
    galleryCaption.textContent = caption;
    galleryCaption.hidden = !caption;
    galleryCount.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
    galleryPrevious.hidden = galleryItems.length < 2;
    galleryNext.hidden = galleryItems.length < 2;
    if (galleryItems.length > 1) {
      for (const offset of [-1, 1]) {
        const preload = new Image();
        preload.src = gallerySource(galleryItems[(galleryIndex + offset + galleryItems.length) % galleryItems.length]);
      }
    }
  }

  function openGallery(image) {
    galleryItems = [...document.querySelectorAll("main .prose img")];
    const nextIndex = galleryItems.indexOf(image);
    if (!gallery || nextIndex < 0) return;
    galleryReturnFocus = image;
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    gallery.hidden = false;
    showGalleryImage(nextIndex);
    galleryClose.focus({ preventScroll: true });
  }

  function closeGallery({ restoreFocus = true } = {}) {
    if (!gallery || gallery.hidden) return;
    gallery.hidden = true;
    galleryImage.removeAttribute("src");
    document.body.style.overflow = bodyOverflow;
    if (restoreFocus && galleryReturnFocus?.isConnected) galleryReturnFocus.focus({ preventScroll: true });
    galleryItems = [];
    swipeStart = undefined;
  }

  function moveGallery(direction) {
    if (galleryItems.length > 1) showGalleryImage(galleryIndex + direction);
  }

  document.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);
  modal?.addEventListener("click", (event) => { if (event.target === modal) closeSearch(); });
  galleryClose?.addEventListener("click", () => closeGallery());
  galleryPrevious?.addEventListener("click", () => moveGallery(-1));
  galleryNext?.addEventListener("click", () => moveGallery(1));
  gallery?.addEventListener("click", (event) => {
    if (event.target === gallery || event.target === gallery.querySelector(".gallery-figure")) closeGallery();
  });
  galleryImage?.addEventListener("pointerdown", (event) => {
    swipeStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    galleryImage.setPointerCapture?.(event.pointerId);
  });
  galleryImage?.addEventListener("pointerup", (event) => {
    if (!swipeStart || event.pointerId !== swipeStart.pointerId) return;
    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    swipeStart = undefined;
    if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY)) moveGallery(deltaX < 0 ? 1 : -1);
  });
  galleryImage?.addEventListener("pointercancel", () => { swipeStart = undefined; });
  input?.addEventListener("input", async () => {
    const needle = input.value.toLowerCase().trim(); const posts = await loadIndex();
    draw(!needle ? posts : posts.filter((post) => `${post.title} ${post.summary} ${(post.categories || []).join(" ")} ${post.tags.join(" ")} ${post.searchText}`.toLowerCase().includes(needle)));
  });
  addEventListener("keydown", (event) => {
    if (gallery && !gallery.hidden) {
      if (event.key === "Escape") { event.preventDefault(); closeGallery(); return; }
      if (event.key === "ArrowLeft") { event.preventDefault(); moveGallery(-1); return; }
      if (event.key === "ArrowRight") { event.preventDefault(); moveGallery(1); return; }
      if (event.key === "Home") { event.preventDefault(); showGalleryImage(0); return; }
      if (event.key === "End") { event.preventDefault(); showGalleryImage(galleryItems.length - 1); return; }
      if (event.key === "Tab") {
        const controls = [...gallery.querySelectorAll("button:not([hidden])")];
        const edge = event.shiftKey ? controls[0] : controls.at(-1);
        if (event.target === edge) {
          event.preventDefault();
          controls[event.shiftKey ? controls.length - 1 : 0]?.focus();
        }
        return;
      }
    }
    const galleryTrigger = event.target.closest?.(".prose img[data-gallery-item]");
    if (galleryTrigger && ["Enter", " "].includes(event.key)) { event.preventDefault(); openGallery(galleryTrigger); return; }
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

  function toggleToc(button, expanded = button.getAttribute("aria-expanded") !== "true") {
    button.setAttribute("aria-expanded", String(expanded));
    button.closest(".toc")?.classList.toggle("toc-open", expanded);
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
        if (response.ok) page = await articlePage(await response.text(), url);
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

  async function articlePage(source, url) {
    const { parseFrontmatter, renderMarkdown, summaryFromBody } = await loadMarkdownRenderer();
    const { data, body } = parseFrontmatter(source, url.pathname);
    const { html, headings } = renderMarkdown(body);
    const date = String(data.date).slice(0, 10);
    const summary = data.summary || data.description || summaryFromBody(body);
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const words = body.replace(/[#*`>\[\]()_-]/g, " ").split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 220));
    const formattedDate = new Intl.DateTimeFormat(window.FRESHMARK.language, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
    const toc = headings.map((heading) => `<a class="toc-level-${heading.level}" href="#${escape(heading.id)}">${escape(heading.text)}</a>`).join("");
    const tagText = tags.map(escape).join(" · ");
    const main = `<main><header class="container article-header"><a class="back-link" href="${basePath || "/"}">← Back to all writing</a><h1>${escape(data.title)}</h1><p class="article-dek">${escape(summary)}</p><div class="article-meta"><time datetime="${date}">${formattedDate}</time><span>${readingTime} min read</span>${tagText ? `<span>${tagText}</span>` : ""}<a href="index.md" download>Download Markdown</a></div></header><div class="article-wrap"><aside class="toc"><div class="toc-head"><p>On this page</p><button class="toc-toggle" type="button" data-toc-toggle aria-expanded="false" aria-label="Toggle table of contents"><span class="toc-toggle-label">Table of contents</span><span class="toc-toggle-icon" aria-hidden="true"></span></button></div><nav class="toc-links" data-toc-links aria-label="Table of contents">${toc}</nav></aside><article class="prose">${html}</article></div></main>`;
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

  function scrollToHash(url, { push = true } = {}) {
    const id = decodeURIComponent(url.hash.slice(1));
    const target = id ? document.getElementById(id) : document.documentElement;
    if (!target) return false;
    if (push) {
      history.replaceState({ ...(history.state || {}), scrollY }, "", location.href);
      history.pushState({ spa: true, scrollY: 0 }, "", url);
    }
    if (id) target.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    else scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }

  async function navigate(url, { push = true, restoreScroll = null } = {}) {
    closeGallery({ restoreFocus: false });
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
        prepareGallery(nextMain);
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
      renderedRoute = `${url.pathname}${url.search}`;
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
    const command = event.target.closest("[data-search-open], [data-theme-toggle], [data-tag], [data-toc-toggle]");
    if (command?.matches("[data-search-open]")) { event.preventDefault(); openSearch(); return; }
    if (command?.matches("[data-theme-toggle]")) { event.preventDefault(); setTheme(root.dataset.theme === "dark" ? "light" : "dark"); return; }
    if (command?.matches("[data-tag]")) { event.preventDefault(); applyFilter(command); return; }
    if (command?.matches("[data-toc-toggle]")) { event.preventDefault(); toggleToc(command); return; }

    const anchor = event.target.closest("a[href]");
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target || anchor.hasAttribute("download")) return;
    const url = new URL(anchor.href, location.href);
    if (url.pathname === location.pathname && url.search === location.search && (url.hash || anchor.getAttribute("href") === "#")) {
      if (scrollToHash(url)) {
        event.preventDefault();
        if (anchor.closest(".toc") && matchMedia("(max-width: 820px)").matches) toggleToc(anchor.closest(".toc").querySelector("[data-toc-toggle]"), false);
      }
      return;
    }
    if (!isSpaRoute(url) || (url.pathname === location.pathname && url.search === location.search)) return;
    event.preventDefault();
    navigate(url);
  });
  document.addEventListener("dblclick", (event) => {
    const image = event.target.closest(".prose img[data-gallery-item]");
    if (!image) return;
    event.preventDefault();
    openGallery(image);
  });
  document.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch") return;
    const image = event.target.closest(".prose img[data-gallery-item]");
    if (!image) return;
    const now = performance.now();
    if (lastImageTap.image === image && now - lastImageTap.time < 350) {
      event.preventDefault();
      lastImageTap = { image: null, time: 0 };
      openGallery(image);
    } else {
      lastImageTap = { image, time: now };
    }
  }, { passive: false });

  history.replaceState({ ...(history.state || {}), spa: true, scrollY }, "", location.href);
  if ("serviceWorker" in navigator) {
    addEventListener("load", () => navigator.serviceWorker.register(`${basePath}/sw.js`, { scope: `${basePath}/`, updateViaCache: "none" }).catch(() => {}));
  }
  addEventListener("popstate", (event) => {
    const url = new URL(location.href);
    if (`${url.pathname}${url.search}` === renderedRoute) {
      if (!url.hash || !scrollToHash(url, { push: false })) scrollTo(0, event.state?.scrollY || 0);
      return;
    }
    navigate(url, { push: false, restoreScroll: event.state?.scrollY || 0 });
  });
  addEventListener("scroll", updateProgress, { passive: true });
  (navigator.connection || navigator.mozConnection || navigator.webkitConnection)?.addEventListener("change", drainPrefetchQueue);
  renderMath();
  prepareGallery();
  updateProgress();
  scheduleArticlePrefetch();
})();
