import { createRequestCache } from "../lib/request-cache.mjs";
import { searchableLatexText } from "../lib/search-text.mjs";

(() => {
  const root = document.documentElement;
  const basePath = window.FRESHMARK?.basePath || "";
  const messages = window.FRESHMARK?.messages || {};
  const localeRoot = window.FRESHMARK?.localeRoot || basePath || "/";
  const alternateRoot = window.FRESHMARK?.alternateRoot || basePath || "/";
  const postsRoot = window.FRESHMARK?.postsRoot || `${basePath}/posts/`;
  const searchIndexPath = window.FRESHMARK?.searchIndexPath || `${basePath}/search-index.json`;
  const assetVersion = window.FRESHMARK?.assetVersion || "";
  const views = window.FRESHMARK?.views || {};
  const comments = window.FRESHMARK?.comments || {};
  const searchQueryParam = "q";
  const contentSnapshotPrefix = "freshmark-content-v2:";
  const modal = document.querySelector("[data-search-modal]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const shell = document.querySelector(".site-shell");
  const pageCache = createRequestCache(12);
  const searchCache = createRequestCache(1);
  const prefetchQueue = [];
  const queuedPrefetches = new Set();
  const preparedPrefetchLinks = new WeakSet();
  let prefetching = false;
  let renderedRoute = `${location.pathname}${location.search}`;
  let searchRequest = 0;
  let searchReturnFocus;
  let activePhotoSwipe;
  let photoSwipeModule;
  let galleryRequest = 0;
  let katexRequest;
  let mathOverflowFrame;
  let inlineMathObserver;
  let readingStateFrame;
  let anchorSyncTimer;
  let cachedProgressEl = null;
  let cachedHeadings = null;
  let loadedSearchIndex = null;
  let searchScrollRequest = 0;
  let hashScrollRequest = 0;
  let hashSyncHoldUntil = 0;
  let viewRequest = 0;
  let commentAuthModule;
  let commentSubmitModule;
  let pollModule;
  let shareModule;
  let navigationController;
  const preparedGalleryImages = new WeakSet();
  const preparedPhotoSwipePreloads = new WeakSet();
  const preparedAnswerReveals = new WeakSet();
  const observedInlineMath = new WeakSet();
  const nearbyInlineMath = new Set();

  function resetReadingCache() {
    cachedProgressEl = null;
    cachedHeadings = null;
  }

  function afterFirstPaint(task) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if ("requestIdleCallback" in window) requestIdleCallback(task, { timeout: 1200 });
      else setTimeout(task, 0);
    }));
  }

  function viewPath(url) {
    let path = url.pathname;
    if (basePath && path.startsWith(basePath)) path = path.slice(basePath.length) || "/";
    return path.replace(/\/page\.html$/, "/").replace(/\/{2,}/g, "/");
  }

  function showViewCount(selector, value) {
    const output = document.querySelector(selector);
    if (!output || !Number.isSafeInteger(value) || value < 0) return;
    output.textContent = new Intl.NumberFormat(window.FRESHMARK?.language).format(value);
    output.closest(".view-count").hidden = false;
  }

  function recordView(url = new URL(location.href)) {
    if (!views.enabled || !views.endpoint) return;
    const request = ++viewRequest;
    const article = Boolean(document.querySelector("[data-reading-progress]"));
    fetch(views.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: viewPath(url), article }),
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`View counter returned ${response.status}`);
        return response.json();
      })
      .then((counts) => {
        if (request !== viewRequest || viewPath(new URL(location.href)) !== viewPath(url)) return;
        showViewCount("[data-site-views]", counts.siteViews);
        if (article) showViewCount("[data-article-views]", counts.articleViews);
      })
      .catch(() => {});
  }

  const getCommentsModule = () => (commentSubmitModule ||= import("./comment-submit.js"));

  function prepareComments() {
    const section = document.querySelector("[data-comments]");
    if (!comments.enabled || !section) return;
    if (!comments.auth) {
      const name = section.querySelector("[name='name']");
      try {
        if (name && !name.value) name.value = localStorage.getItem("freshmark-comment-name") || "";
      } catch {}
    } else {
      commentAuthModule ||= import("./comment-auth.js");
      commentAuthModule.then((module) => module.prepareCommentAuth({ section, comments, message }));
    }
    getCommentsModule().then((module) => module.loadComments({ section, comments, message }));
  }

  async function submitComment(form) {
    (await getCommentsModule()).submitComment({ form, comments, message });
  }

  function loadKaTeXStyles() {
    const existing = document.querySelector("link[data-katex-styles]");
    if (existing?.sheet) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const stylesheet = existing || document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.dataset.katexStyles = "";
      stylesheet.href = `${basePath}/assets/katex.min${assetVersion ? `.${assetVersion}` : ""}.css`;
      stylesheet.addEventListener("load", resolve, { once: true });
      stylesheet.addEventListener("error", reject, { once: true });
      if (!existing) document.head.append(stylesheet);
    });
  }

  async function renderSpaMath(scope) {
    if (!scope.querySelector("[data-math-source]")) return;
    katexRequest ||= Promise.all([
      import("./katex.js"),
      loadKaTeXStyles(),
    ]);
    const [katex] = await katexRequest;
    katex.renderMath(scope);
  }

  function upgradeInitialMath() {
    if ((navigator.connection || navigator.mozConnection || navigator.webkitConnection)?.saveData) return;
    const formulas = [...document.querySelectorAll("[data-math-source]")];
    if (!formulas.length) return;
    if (!("IntersectionObserver" in window)) {
      renderSpaMath(document);
      return;
    }
    const pending = new Set(formulas);
    const queue = [];
    let inFlight = false;
    const observer = new IntersectionObserver((entries) => {
      let queued = false;
      for (const entry of entries) {
        if (!entry.isIntersecting || !pending.has(entry.target)) continue;
        queue.push(entry.target);
        queued = true;
      }
      if (queued) drainMathQueue();
    }, { rootMargin: "200px 0px" });
    const drainMathQueue = async () => {
      if (inFlight || !queue.length) return;
      inFlight = true;
      const batch = queue.splice(0);
      try {
        const [katex] = await (katexRequest ||= Promise.all([
          import("./katex.js"),
          loadKaTeXStyles(),
        ]));
        katex.renderMathList(batch);
        batch.forEach((element) => pending.delete(element));
        if (!pending.size) observer.disconnect();
      } catch {
        batch.forEach((element) => pending.delete(element));
      } finally {
        inFlight = false;
        drainMathQueue();
      }
    };
    formulas.forEach((element) => observer.observe(element));
  }

  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
  const message = (key, values = {}) => String(messages[key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
  const setTheme = (theme) => { root.dataset.theme = theme; try { localStorage.setItem("freshmark-theme", theme); } catch {} };

  const toggleSkins = async (button) => (await import("./skins.js")).toggleSkinMenu(button, { messages, setTheme, skinStyles: window.FRESHMARK.skinStyles });

  async function shareArticle(button) {
    shareModule ||= import("./share.js");
    (await shareModule).shareArticle(button, { message });
  }

  async function loadIndex() {
    return searchCache.get(searchIndexPath, async () => {
      const response = await fetch(searchIndexPath);
      if (!response.ok) throw new Error("Could not load search index");
      const items = await response.json();
      for (const item of items) {
        item._title = String(item.title || "").toLowerCase();
        item._meta = [...(item.categories || []), ...(item.tags || [])].join(" ").toLowerCase();
        item._summary = String(item.summary || "").toLowerCase();
        item._body = String(item.searchText || "").toLowerCase();
      }
      loadedSearchIndex = items;
      return items;
    });
  }

  function searchResultHref(value, term) {
    const url = new URL(value, location.origin);
    if (term) url.searchParams.set(searchQueryParam, term);
    else url.searchParams.delete(searchQueryParam);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function searchNeedle(term) {
    return searchableLatexText(term).replace(/[#*`>~]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function highlightedResultText(value, needle) {
    const text = String(value || "");
    if (!needle) return escape(text);
    const normalized = text.toLowerCase();
    let cursor = 0;
    let matchAt = normalized.indexOf(needle);
    if (matchAt < 0) return escape(text);
    let html = "";
    while (matchAt >= 0) {
      html += escape(text.slice(cursor, matchAt));
      html += `<mark class="search-result-highlight">${escape(text.slice(matchAt, matchAt + needle.length))}</mark>`;
      cursor = matchAt + needle.length;
      matchAt = normalized.indexOf(needle, cursor);
    }
    return html + escape(text.slice(cursor));
  }

  function searchResultSnippet(post, needle) {
    const candidates = [post.summary, post.searchText].map((value) => String(value || "")).filter(Boolean);
    const source = candidates.find((value) => needle && value.toLowerCase().includes(needle)) || candidates[0] || "";
    const matchAt = needle ? source.toLowerCase().indexOf(needle) : -1;
    const start = matchAt < 0 ? 0 : Math.max(0, matchAt - 72);
    const end = Math.min(source.length, matchAt < 0 ? 170 : matchAt + needle.length + 96);
    return `${start ? "…" : ""}${highlightedResultText(source.slice(start, end), needle)}${end < source.length ? "…" : ""}`;
  }

  function draw(items, term = "") {
    if (!items.length) { results.innerHTML = `<p class="search-hint">${escape(message("noResults"))}</p>`; return; }
    const needle = searchNeedle(term);
    results.innerHTML = items.map((post) => {
      const metadata = [...(post.categories || []), ...(post.tags || [])].join(" · ");
      return `<a class="search-result" href="${escape(searchResultHref(post.url, term))}"><div class="search-result-heading"><strong>${highlightedResultText(post.title, needle)}</strong><span>${metadata ? `${escape(metadata)} · ` : ""}${escape(message("minuteRead", { minutes: post.readingTime }))}</span></div><p class="search-result-context">${searchResultSnippet(post, needle)}</p></a>`;
    }).join("");
  }

  async function openSearch() {
    if (!modal?.hidden) return;
    searchReturnFocus = document.activeElement;
    shell.inert = true;
    root.classList.add("search-open");
    modal.hidden = false;
    modal.scrollTop = 0;
    input.focus({ preventScroll: true });
    await updateSearch();
  }
  function closeSearch() {
    if (!modal || modal.hidden) return;
    if (modal.contains(document.activeElement)) document.activeElement.blur();
    modal.hidden = true;
    shell.inert = false;
    root.classList.remove("search-open");
    input.value = "";
    if (searchReturnFocus?.isConnected) searchReturnFocus.focus({ preventScroll: true });
  }

  function searchTerm(url = new URL(location.href)) {
    return url.searchParams.get(searchQueryParam)?.trim() || "";
  }

  function clearSearchHighlights(scope = document) {
    const parents = new Set();
    for (const block of scope.querySelectorAll("[data-search-reveal]")) delete block.dataset.searchReveal;
    for (const formula of scope.querySelectorAll(".math-expression[data-search-highlight]")) {
      delete formula.dataset.searchHighlight;
      formula.classList.remove("search-highlight", "search-highlight-current", "search-highlight-formula");
    }
    for (const mark of scope.querySelectorAll("mark[data-search-highlight]")) {
      const parent = mark.parentNode;
      parents.add(parent);
      mark.replaceWith(document.createTextNode(mark.textContent));
    }
    parents.forEach((parent) => parent?.normalize());
  }

  function highlightSearchTerm(url, scope = document) {
    clearSearchHighlights(scope);
    const term = searchTerm(url);
    if (!term) return null;

    const nodes = [];
    const roots = scope.querySelectorAll(".article-header h1, .article-dek, .article-meta > span, .prose");
    const ignored = "script, style, noscript, template, code, pre, svg, math, .math-expression, .content-diff-notice, [aria-hidden='true'], u.answer-reveal:not(.is-revealed)";
    for (const contentRoot of roots) {
      const walker = document.createTreeWalker(contentRoot, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          return node.nodeValue.trim() && !node.parentElement?.closest(ignored)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      });
      while (walker.nextNode()) nodes.push(walker.currentNode);
    }

    const needle = term.toLowerCase();
    const matches = [];
    const bareFormulaNeedle = needle
      .replace(/^(?:\${1,2}|\\\(|\\\[)\s*/, "")
      .replace(/\s*(?:\${1,2}|\\\)|\\\])$/, "");
    const formulaNeedles = [...new Set([needle, bareFormulaNeedle].map(searchableLatexText).filter(Boolean))];
    for (const formula of scope.querySelectorAll(".math-expression[aria-label], .math-expression[data-math-source]")) {
      const source = searchableLatexText(formula.getAttribute("aria-label") || formula.dataset.mathSource).toLowerCase();
      if (!formulaNeedles.some((candidate) => source.includes(candidate))) continue;
      formula.dataset.searchHighlight = "";
      formula.classList.add("search-highlight", "search-highlight-formula");
      matches.push(formula);
    }
    for (const node of nodes) {
      const value = node.nodeValue;
      const normalized = value.toLowerCase();
      let cursor = 0;
      let matchAt = normalized.indexOf(needle);
      if (matchAt < 0) continue;

      const fragment = document.createDocumentFragment();
      while (matchAt >= 0) {
        fragment.append(document.createTextNode(value.slice(cursor, matchAt)));
        const mark = document.createElement("mark");
        mark.className = "search-highlight";
        mark.dataset.searchHighlight = "";
        mark.textContent = value.slice(matchAt, matchAt + term.length);
        fragment.append(mark);
        matches.push(mark);
        cursor = matchAt + term.length;
        matchAt = normalized.indexOf(needle, cursor);
      }
      fragment.append(document.createTextNode(value.slice(cursor)));
      node.replaceWith(fragment);
    }

    matches.sort((left, right) => {
      if (left === right) return 0;
      return left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    const first = matches[0] || null;
    first?.classList.add("search-highlight-current");
    return first;
  }

  function scrollToSearchHighlight(target) {
    if (!target) return false;
    const request = ++searchScrollRequest;
    const prose = target.closest(".prose");
    if (prose) prose.dataset.layoutSettled = "";
    let block = target;
    while (prose && block.parentElement && block.parentElement !== prose) block = block.parentElement;
    if (prose && block.parentElement === prose) block.dataset.searchReveal = "";

    let settled = false;
    const correctPosition = (remainingFrames = 3) => {
      if (request !== searchScrollRequest || !target.isConnected) return;
      const bounds = target.getBoundingClientRect();
      const offset = bounds.top + bounds.height / 2 - innerHeight / 2;
      if (Math.abs(offset) > 2) scrollBy({ top: offset, behavior: "instant" });
      if (remainingFrames > 1) requestAnimationFrame(() => correctPosition(remainingFrames - 1));
    };
    const settle = () => {
      if (settled) return;
      settled = true;
      removeEventListener("scrollend", settle);
      requestAnimationFrame(() => correctPosition());
    };
    addEventListener("scrollend", settle, { once: true });
    setTimeout(settle, 700);
    target.scrollIntoView({
      block: "center",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
    document.fonts?.ready.then(() => {
      if (settled) correctPosition();
    });
    return true;
  }

  function articleContentUnits(prose) {
    const units = [];
    for (const child of prose.children) {
      if (["UL", "OL"].includes(child.tagName)) {
        units.push(...child.querySelectorAll(":scope > li"));
      } else if (child.tagName === "TABLE") {
        const rows = child.querySelectorAll("tr");
        units.push(...(rows.length ? rows : [child]));
      } else {
        units.push(child);
      }
    }
    return units;
  }

  function normalizedContentUrl(value, pageUrl) {
    try {
      const url = new URL(value, pageUrl);
      return url.origin === location.origin ? `${url.pathname}${url.search}${url.hash}` : url.href;
    } catch {
      return value;
    }
  }

  function hashSignature(value) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < value.length; i += 1) {
      const code = value.charCodeAt(i);
      h1 = Math.imul(h1 ^ code, 2654435761);
      h2 = Math.imul(h2 ^ code, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return ((4294967296 * (2097151 & h2)) + (h1 >>> 0)).toString(36);
  }

  function articleUnitSignature(element, pageUrl) {
    let rawText = element.textContent;
    if (element.querySelector(".math-expression")) {
      const textCopy = element.cloneNode(true);
      for (const formula of textCopy.querySelectorAll(".math-expression")) {
        formula.replaceWith(document.createTextNode(` ${formula.getAttribute("aria-label") || formula.dataset.mathSource || ""} `));
      }
      rawText = textCopy.textContent;
    }
    const text = rawText.replace(/\s+/g, " ").trim();
    const resources = [element, ...element.querySelectorAll("a[href], img[src], video[src], source[src], iframe[src], .math-expression[aria-label], .math-expression[data-math-source]")]
      .map((item) => {
        const mathSource = item.getAttribute("aria-label") || item.dataset.mathSource;
        if (item.matches(".math-expression") && mathSource) return `MATH:${mathSource}`;
        const source = item.getAttribute("href") || item.getAttribute("src");
        if (!source) return "";
        return [
          item.tagName,
          normalizedContentUrl(source, pageUrl),
          item.getAttribute("alt") || "",
          item.getAttribute("title") || "",
        ].join(":");
      })
      .filter(Boolean);
    return hashSignature(`${element.tagName}\u0000${text}\u0000${resources.join("\u0001")}`);
  }

  async function applyArticleContentDiff(url, scope = document) {
    const prose = scope.querySelector(".prose");
    if (!prose) return 0;
    prose.querySelector(":scope > .content-diff-notice")?.remove();
    for (const element of prose.querySelectorAll("[data-content-diff]")) delete element.dataset.contentDiff;

    await new Promise((resolve) => idle(resolve));
    if (!prose.isConnected) return 0;

    const pageUrl = pageContentUrl(url);
    const storageKey = `${contentSnapshotPrefix}${pageUrl.pathname}`;
    const units = articleContentUnits(prose);
    const snapshot = units.map((element) => articleUnitSignature(element, pageUrl));
    let previous = null;
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (stored?.version === 3 && Array.isArray(stored.units)) previous = stored.units;
    } catch {}

    let changed = 0;
    if (previous && (previous.length !== snapshot.length || previous.some((value, index) => value !== snapshot[index]))) {
      const { changedCurrentIndexes } = await import("../lib/content-diff.mjs");
      if (!prose.isConnected) return 0;
      const changedIndexes = changedCurrentIndexes(previous, snapshot);
      for (const index of changedIndexes) units[index].dataset.contentDiff = "changed";
      changed = changedIndexes.length;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 3, units: snapshot }));
    } catch {}
    if (changed) {
      const notice = document.createElement("div");
      notice.className = "content-diff-notice";
      notice.setAttribute("role", "status");
      notice.textContent = message("contentDiffNotice", { count: changed });
      prose.prepend(notice);
    }
    return changed;
  }

  function prepareGallery(scope = document) {
    for (const image of scope.querySelectorAll(".prose img")) {
      image.dataset.galleryItem = "";
      image.tabIndex = 0;
      image.setAttribute("aria-haspopup", "dialog");
      image.setAttribute("aria-label", `${image.alt || image.title || message("articleImage")}. ${message("openGallery")}`);
      if (!preparedGalleryImages.has(image)) {
        preparedGalleryImages.add(image);
        image.addEventListener("click", (event) => {
          event.preventDefault();
          openGallery(image);
        });
      }
    }
  }

  function setAnswerRevealState(answer, revealed) {
    answer.classList.toggle("is-revealed", revealed);
    answer.setAttribute("aria-expanded", String(revealed));
    const answerText = answer.textContent.trim();
    answer.setAttribute("aria-label", revealed && answerText ? `${message("hideAnswer")}: ${answerText}` : message("revealAnswer"));
  }

  function prepareAnswerReveals(scope = document) {
    for (const answer of scope.querySelectorAll("u.answer-reveal")) {
      answer.tabIndex = 0;
      answer.setAttribute("role", "button");
      if (!preparedAnswerReveals.has(answer)) {
        preparedAnswerReveals.add(answer);
        setAnswerRevealState(answer, false);
      }
    }
  }

  function toggleAnswerReveal(answer) {
    setAnswerRevealState(answer, !answer.classList.contains("is-revealed"));
  }

  function preparePolls(scope = document) {
    if (scope.querySelector(".freshmark-poll")) {
      pollModule ||= import("./poll.js");
      pollModule.then(({ initPolls }) => initPolls(scope));
    }
  }

  function gallerySource(image) {
    return image.dataset.gallerySrc || image.currentSrc || image.src;
  }

  function galleryThumbnailSource(image) {
    return image.currentSrc || image.src;
  }

  function galleryImageSize(image) {
    const bounds = image.getBoundingClientRect();
    const ratio = bounds.width && bounds.height ? bounds.width / bounds.height : 4 / 3;
    const width = Number(image.dataset.galleryWidth) || image.naturalWidth || Number(image.getAttribute("width")) || 1600;
    return {
      width,
      height: Number(image.dataset.galleryHeight) || image.naturalHeight || Number(image.getAttribute("height")) || Math.round(width / ratio),
    };
  }

  function loadPhotoSwipe() {
    if (!photoSwipeModule) photoSwipeModule = import("photoswipe").then(({ default: PhotoSwipe }) => PhotoSwipe);
    return photoSwipeModule;
  }

  function preloadPhotoSwipe(scope = document) {
    const warm = () => {
      if (canPrefetch()) loadPhotoSwipe().catch(() => {});
    };
    for (const image of scope.querySelectorAll(".prose img")) {
      if (preparedPhotoSwipePreloads.has(image)) continue;
      preparedPhotoSwipePreloads.add(image);
      image.addEventListener("pointerenter", warm, { once: true, passive: true });
      image.addEventListener("touchstart", warm, { once: true, passive: true });
      image.addEventListener("focus", warm, { once: true });
    }
  }

  async function openGallery(image) {
    const request = ++galleryRequest;
    const images = [...document.querySelectorAll("main .prose img")];
    const nextIndex = images.indexOf(image);
    if (nextIndex < 0) return;
    const PhotoSwipe = await loadPhotoSwipe();
    const sizes = images.map(galleryImageSize);
    if (request !== galleryRequest || !image.isConnected) return;
    const dataSource = images.map((item, itemIndex) => {
      const figureCaption = item.closest("figure")?.querySelector("figcaption")?.textContent.trim();
      return {
        src: gallerySource(item),
        msrc: galleryThumbnailSource(item),
        width: sizes[itemIndex].width,
        height: sizes[itemIndex].height,
        alt: item.alt || "",
        caption: item.title || figureCaption || item.alt || "",
      };
    });
    activePhotoSwipe?.destroy();
    const pswp = new PhotoSwipe({
      dataSource,
      index: nextIndex,
      bgOpacity: .94,
      spacing: .12,
      loop: images.length > 2,
      preload: [1, 2],
      showHideAnimationType: "zoom",
      showAnimationDuration: 360,
      hideAnimationDuration: 300,
      zoomAnimationDuration: 300,
      easing: "cubic-bezier(.22,1,.36,1)",
      arrowKeys: true,
      arrowPrev: false,
      arrowNext: false,
      trapFocus: true,
      returnFocus: true,
      pinchToClose: true,
      closeOnVerticalDrag: true,
      imageClickAction: "zoom",
      tapAction: "toggle-controls",
      doubleTapAction: "zoom",
      mainClass: "freshmark-pswp",
      paddingFn: (viewport) => ({
        top: viewport.x < 600 ? 56 : 32,
        bottom: 64,
        left: viewport.x < 600 ? 8 : 32,
        right: viewport.x < 600 ? 8 : 32,
      }),
    });
    pswp.addFilter("thumbEl", (thumbnail, _itemData, itemIndex) => images[itemIndex] || thumbnail);
    pswp.addFilter("placeholderSrc", (placeholder, content) => {
      const thumbnail = images[content.index];
      return thumbnail ? galleryThumbnailSource(thumbnail) : placeholder;
    });
    pswp.on("uiRegister", () => {
      pswp.ui.registerElement({
        name: "freshmark-caption",
        className: "pswp__freshmark-caption",
        appendTo: "root",
        order: 9,
        onInit: (element, instance) => {
          const updateCaption = () => {
            const caption = instance.currSlide?.data.caption || "";
            element.textContent = caption;
            element.hidden = !caption;
          };
          instance.on("change", updateCaption);
          updateCaption();
        },
      });
    });
    pswp.on("loadComplete", ({ slide, content }) => {
      const loadedImage = content.element;
      if (!slide || !(loadedImage instanceof HTMLImageElement) || !loadedImage.naturalWidth || !loadedImage.naturalHeight) return;
      if (content.width === loadedImage.naturalWidth && content.height === loadedImage.naturalHeight) return;
      slide.data.width = content.width = slide.width = loadedImage.naturalWidth;
      slide.data.height = content.height = slide.height = loadedImage.naturalHeight;
      slide.resize();
    });
    pswp.on("destroy", () => {
      if (activePhotoSwipe === pswp) activePhotoSwipe = undefined;
    });
    activePhotoSwipe = pswp;
    pswp.init();
  }

  function closeGallery({ restoreFocus = true } = {}) {
    galleryRequest += 1;
    if (!activePhotoSwipe) return;
    activePhotoSwipe.options.returnFocus = restoreFocus;
    activePhotoSwipe.close();
  }

  document.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);
  modal?.addEventListener("click", (event) => { if (event.target === modal) closeSearch(); });
  modal?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll('a[href],button,input')].filter((element) => !element.disabled && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  function rankSearchMatches(posts, needle) {
    const scored = [];
    for (const post of posts) {
      let score = 0;
      const titleIdx = post._title.indexOf(needle);
      if (titleIdx === 0) score += 12;
      else if (titleIdx > 0) score += 8;
      if (post._meta.includes(needle)) score += 4;
      if (post._summary.includes(needle)) score += 2;
      if (post._body.includes(needle)) score += 1;
      if (score) scored.push({ post, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 24).map(({ post }) => post);
  }

  async function updateSearch() {
    const request = ++searchRequest;
    const term = input.value.trim();
    if (!term) {
      if (loadedSearchIndex) draw(loadedSearchIndex.slice(0, 12), "");
      else results.innerHTML = `<p class="search-hint">${escape(message("searchPlaceholder"))}</p>`;
      return;
    }
    const needle = searchNeedle(term);
    if (!needle) {
      draw([], term);
      return;
    }
    try {
      const posts = await loadIndex();
      if (request !== searchRequest || modal.hidden) return;
      draw(rankSearchMatches(posts, needle), term);
    } catch {
      if (request === searchRequest && !modal.hidden) results.innerHTML = `<p class="search-hint">${escape(message("searchFailed"))}</p>`;
    }
  }
  input?.addEventListener("input", updateSearch);
  addEventListener("keydown", (event) => {
    const answerTrigger = event.target.closest?.("u.answer-reveal");
    if (answerTrigger && ["Enter", " "].includes(event.key)) { event.preventDefault(); toggleAnswerReveal(answerTrigger); return; }
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
      const visible = button.dataset.tag === "__all__" || card.dataset.tags.split("|").includes(button.dataset.tag);
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    document.querySelectorAll("[data-timeline-group]").forEach((group) => {
      group.hidden = !group.querySelector("[data-post-card]:not([hidden])");
    });
    const empty = document.querySelector("[data-filter-empty]");
    if (empty) empty.hidden = shown !== 0;
  }

  function toggleToc(button, expanded = button.getAttribute("aria-expanded") !== "true") {
    button.setAttribute("aria-expanded", String(expanded));
    button.closest(".toc")?.classList.toggle("toc-open", expanded);
  }

  function updateProgress() {
    const progress = cachedProgressEl?.isConnected ? cachedProgressEl : (cachedProgressEl = document.querySelector("[data-reading-progress]"));
    if (!progress) return;
    const total = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0})`;
  }

  function syncReadingAnchor() {
    if (!(cachedProgressEl?.isConnected || (cachedProgressEl = document.querySelector("[data-reading-progress]")))) return;
    if (Date.now() < hashSyncHoldUntil) return;
    const headings = cachedHeadings || (cachedHeadings = [...document.querySelectorAll(".prose h1[id], .prose h2[id], .prose h3[id], .prose h4[id], .prose h5[id], .prose h6[id]")]);
    const threshold = Math.min(160, innerHeight * 0.25);
    let heading = null;
    for (const candidate of headings) {
      if (candidate.getBoundingClientRect().top > threshold) break;
      heading = candidate;
    }
    const nextUrl = new URL(location.href);
    nextUrl.hash = heading?.id || "";
    if (nextUrl.href === location.href) return;
    history.replaceState({ ...(history.state || {}), spa: true, scrollY }, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  }

  function updateReadingState(immediateAnchor) {
    cancelAnimationFrame(readingStateFrame);
    readingStateFrame = requestAnimationFrame(() => {
      updateProgress();
      clearTimeout(anchorSyncTimer);
      if (immediateAnchor === true) syncReadingAnchor();
      else anchorSyncTimer = setTimeout(syncReadingAnchor, 120);
    });
  }

  function measureInlineMathOverflow(formula) {
    formula.classList.remove("math-inline-overflow");
    const line = formula.closest("p, li, td, th, blockquote, figcaption, h1, h2, h3, h4, h5, h6") || formula.closest(".prose");
    if (!line) return;
    const lineStyle = getComputedStyle(line);
    const availableWidth = line.clientWidth
      - Number.parseFloat(lineStyle.paddingLeft || "0")
      - Number.parseFloat(lineStyle.paddingRight || "0");
    formula.classList.toggle(
      "math-inline-overflow",
      formula.scrollWidth > availableWidth + 2,
    );
  }

  function observeInlineMath(scope = document) {
    if (!("IntersectionObserver" in window)) return;
    inlineMathObserver ||= new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) nearbyInlineMath.add(entry.target);
        else nearbyInlineMath.delete(entry.target);
      }
      updateInlineMathOverflow();
    }, { rootMargin: "100% 0px" });
    for (const formula of scope.querySelectorAll(".prose .math-inline")) {
      if (observedInlineMath.has(formula)) continue;
      observedInlineMath.add(formula);
      inlineMathObserver.observe(formula);
    }
  }

  function updateInlineMathOverflow(scope = document) {
    cancelAnimationFrame(mathOverflowFrame);
    mathOverflowFrame = requestAnimationFrame(() => {
      const formulas = inlineMathObserver
        ? [...nearbyInlineMath]
        : [...scope.querySelectorAll(".prose .math-inline")];
      for (const formula of formulas) {
        if (!formula.isConnected) {
          nearbyInlineMath.delete(formula);
          continue;
        }
        if (scope !== document && !scope.contains(formula)) continue;
        measureInlineMathOverflow(formula);
      }
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
    const languageSwitch = document.querySelector(".language-switch");
    if (languageSwitch) languageSwitch.href = page.alternate || alternateRoot;
  }

  function pageContentUrl(url) {
    const contentUrl = new URL(url);
    contentUrl.searchParams.delete(searchQueryParam);
    return contentUrl;
  }

  async function getPage(url) {
    const contentUrl = pageContentUrl(url);
    const key = `${contentUrl.pathname}${contentUrl.search}`;
    return pageCache.get(key, async () => {
      let page;
      if (contentUrl.pathname.endsWith("/")) {
        const fragmentUrl = new URL("page.html", contentUrl);
        const response = await fetch(`${fragmentUrl.pathname}${fragmentUrl.search}`, { headers: { "X-Freshmark-Navigation": "spa" } });
        if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
          const fragmentDocument = new DOMParser().parseFromString(await response.text(), "text/html");
          const metadata = fragmentDocument.querySelector("[data-freshmark-page]");
          page = {
            title: metadata?.dataset.title || "",
            description: metadata?.dataset.description || "",
            canonical: metadata?.dataset.canonical || contentUrl.href,
            alternate: metadata?.dataset.alternate || alternateRoot,
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
          canonical: nextDocument.head.querySelector('link[rel="canonical"]')?.href || contentUrl.href,
          alternate: [...nextDocument.head.querySelectorAll('link[rel="alternate"][hreflang]')].find((link) => ![window.FRESHMARK.language, "x-default"].includes(link.hreflang))?.href || alternateRoot,
          article: Boolean(nextDocument.querySelector("[data-reading-progress]")),
          html: nextDocument.querySelector("main")?.outerHTML,
        };
      }
      if (!page.html) throw new Error(`Page has no main content: ${key}`);
      return page;
    });
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
        finally { queuedPrefetches.delete(`${url.pathname}${url.search}`); }
      }
      prefetching = false;
      drainPrefetchQueue();
    });
  }

  function queueArticlePrefetch(anchor) {
    const postsBase = new URL(postsRoot, location.origin).pathname;
    const url = pageContentUrl(new URL(anchor.href, location.href));
    const key = `${url.pathname}${url.search}`;
    if (url.origin !== location.origin || !url.pathname.startsWith(postsBase) || !url.pathname.endsWith("/") || pageCache.has(key) || queuedPrefetches.has(key)) return;
    queuedPrefetches.add(key);
    prefetchQueue.push(url);
    drainPrefetchQueue();
  }

  function scheduleArticlePrefetch(scope = document) {
    for (const anchor of scope.querySelectorAll("a[href]")) {
      if (preparedPrefetchLinks.has(anchor)) continue;
      preparedPrefetchLinks.add(anchor);
      anchor.addEventListener("pointerenter", () => queueArticlePrefetch(anchor), { once: true, passive: true });
      anchor.addEventListener("focus", () => queueArticlePrefetch(anchor), { once: true });
    }
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

  function resolveHashTarget(target) {
    if (target?.tagName === "A" && !target.textContent.trim()) {
      return target.closest("p, li, h1, h2, h3, h4, h5, h6, blockquote, div") || target;
    }
    return target;
  }

  function scrollToHash(url, { push = true, behavior = null } = {}) {
    const id = decodeURIComponent(url.hash.slice(1));
    const target = id ? document.getElementById(id) : document.documentElement;
    if (!target) return false;
    const request = ++hashScrollRequest;
    const prose = target.closest?.(".prose");
    if (prose) prose.dataset.layoutSettled = "";
    if (push) {
      history.replaceState({ ...(history.state || {}), scrollY }, "", location.href);
      history.pushState({ spa: true, scrollY: 0 }, "", url);
    }
    if (!id) {
      scrollTo({ top: 0, behavior: behavior || "smooth" });
      return true;
    }
    const anchorEl = resolveHashTarget(target);
    const targetTop = (document.querySelector(".header")?.getBoundingClientRect().height || 68) + 20;
    hashSyncHoldUntil = Date.now() + 1500;
    const align = (remaining = 4) => {
      if (request !== hashScrollRequest || !anchorEl.isConnected) return;
      const delta = anchorEl.getBoundingClientRect().top - targetTop;
      if (Math.abs(delta) > 2) scrollBy({ top: delta, behavior: "instant" });
      if (remaining > 1) requestAnimationFrame(() => align(remaining - 1));
    };
    const scrollBehavior = behavior || (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
    const delta = anchorEl.getBoundingClientRect().top - targetTop;
    if (scrollBehavior === "auto" || scrollBehavior === "instant" || Math.abs(delta) <= 2) {
      align(4);
    } else {
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        removeEventListener("scrollend", settle);
        hashSyncHoldUntil = Date.now() + 800;
        requestAnimationFrame(() => align(3));
      };
      addEventListener("scrollend", settle, { once: true });
      setTimeout(settle, 1100);
      scrollBy({ top: delta, behavior: "smooth" });
    }
    document.fonts?.ready.then(() => { if (request === hashScrollRequest) align(2); });
    return true;
  }

  async function navigate(url, { push = true, restoreScroll = null } = {}) {
    navigationController?.abort();
    const controller = navigationController = new AbortController();
    const { signal } = controller;
    const previousScroll = scrollY;
    let committed = false;
    viewRequest += 1;
    commentSubmitModule?.then((module) => module.abortComments());
    closeGallery({ restoreFocus: false });
    shell.setAttribute("aria-busy", "true");
    try {
      const nextPage = await getPage(url);
      signal.throwIfAborted();
      const nextDocument = new DOMParser().parseFromString(nextPage.html, "text/html");
      const nextMain = nextDocument.querySelector("main");
      const currentMain = document.querySelector("main");
      if (!nextMain || !currentMain) throw new Error("Page has no main content");
      rebaseMainUrls(nextMain, url);
      await renderSpaMath(nextMain);
      signal.throwIfAborted();

      const swap = () => {
        signal.throwIfAborted();
        currentMain.replaceWith(nextMain);
        if (nextPage.article) applyArticleContentDiff(url, nextMain).catch(() => {});
        observeInlineMath(nextMain);
        updateInlineMathOverflow(nextMain);
        document.fonts?.ready.then(() => updateInlineMathOverflow(nextMain));
        prepareAnswerReveals(nextMain);
        preparePolls(nextMain);
        prepareGallery(nextMain);
        preloadPhotoSwipe(nextMain);
        scheduleArticlePrefetch(nextMain);
        document.querySelector("[data-reading-progress]")?.remove();
        if (nextPage.article) {
          const progress = document.createElement("div");
          progress.className = "reading-progress";
          progress.dataset.readingProgress = "";
          document.querySelector(".header")?.before(progress);
        }
        resetReadingCache();
        updateMetadata(nextPage);
        if (push) {
          history.replaceState({ ...(history.state || {}), scrollY: previousScroll }, "", location.href);
          history.pushState({ spa: true, scrollY: 0 }, "", url);
        }
        committed = true;
        renderedRoute = `${url.pathname}${url.search}`;
      };
      if (document.startViewTransition) {
        root.dataset.navigationDirection = push ? "forward" : "back";
        try {
          await document.startViewTransition(swap).finished;
        } finally {
          delete root.dataset.navigationDirection;
        }
      } else swap();
      signal.throwIfAborted();

      const searchMatch = highlightSearchTerm(url, nextMain);

      closeSearch();
      if (restoreScroll !== null) scrollTo(0, restoreScroll);
      else if (searchMatch) scrollToSearchHighlight(searchMatch);
      else if (url.hash) scrollToHash(url, { push: false, behavior: "auto" });
      else scrollTo(0, 0);
      updateReadingState(true);
      const main = document.querySelector("main");
      main.setAttribute("tabindex", "-1");
      if (document.activeElement === document.body) main.focus({ preventScroll: true });
      main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
      afterFirstPaint(() => {
        if (signal.aborted) return;
        recordView(url);
        prepareComments();
      });
    } catch {
      if (!signal.aborted) {
        location.href = url.href;
      }
    } finally {
      if (navigationController === controller) shell.removeAttribute("aria-busy");
    }
  }

  document.addEventListener("click", (event) => {
    const answerReveal = event.target.closest("u.answer-reveal");
    if (answerReveal) { event.preventDefault(); toggleAnswerReveal(answerReveal); return; }
    const command = event.target.closest("[data-search-open], [data-theme-toggle], [data-skin-toggle], [data-tag], [data-toc-toggle], [data-comments-more], [data-share-article]");
    if (command?.matches("[data-search-open]")) { event.preventDefault(); openSearch(); return; }
    if (command?.matches("[data-theme-toggle]")) { event.preventDefault(); setTheme(root.dataset.theme === "dark" ? "light" : "dark"); return; }
    if (command?.matches("[data-skin-toggle]")) { event.preventDefault(); toggleSkins(command); return; }
    if (command?.matches("[data-tag]")) { event.preventDefault(); applyFilter(command); return; }
    if (command?.matches("[data-toc-toggle]")) { event.preventDefault(); toggleToc(command); return; }
    if (command?.matches("[data-share-article]")) { event.preventDefault(); shareArticle(command); return; }
    if (command?.matches("[data-comments-more]")) {
      event.preventDefault();
      command.disabled = true;
      command.textContent = message("commentsLoading");
      getCommentsModule().then((module) => module.loadComments({
        section: command.closest("[data-comments]"),
        comments,
        message,
        cursor: command.dataset.cursor,
        prepend: true,
      }));
      return;
    }
    const anchor = event.target.closest("a[href]");
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target || anchor.hasAttribute("download") || anchor.hasAttribute("data-no-spa")) return;
    const url = new URL(anchor.href, location.href);
    const isSearchResult = anchor.matches(".search-result");
    if (isSearchResult && url.pathname === location.pathname && url.search === location.search) {
      event.preventDefault();
      closeSearch();
      scrollToSearchHighlight(highlightSearchTerm(url));
      return;
    }
    if (url.pathname === location.pathname && url.search === location.search && (url.hash || anchor.getAttribute("href") === "#")) {
      if (scrollToHash(url)) {
        event.preventDefault();
        if (anchor.closest(".toc") && matchMedia("(max-width: 820px)").matches) toggleToc(anchor.closest(".toc").querySelector("[data-toc-toggle]"), false);
      }
      return;
    }
    if (!isSpaRoute(url) || (url.pathname === location.pathname && url.search === location.search)) return;
    event.preventDefault();
    if (isSearchResult) closeSearch();
    navigate(url);
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-comment-form]");
    if (!form) return;
    event.preventDefault();
    submitComment(form);
  });

  history.replaceState({ ...(history.state || {}), spa: true, scrollY }, "", location.href);
  addEventListener("load", () => {
    preloadPhotoSwipe();
  }, { once: true });
  addEventListener("popstate", (event) => {
    const url = new URL(location.href);
    if (`${url.pathname}${url.search}` === renderedRoute) {
      if (!url.hash || !scrollToHash(url, { push: false })) scrollTo(0, event.state?.scrollY || 0);
      return;
    }
    navigate(url, { push: false, restoreScroll: event.state?.scrollY || 0 });
  });
  addEventListener("scroll", updateReadingState, { passive: true });
  addEventListener("resize", () => {
    updateInlineMathOverflow();
    updateReadingState(true);
  }, { passive: true });
  (navigator.connection || navigator.mozConnection || navigator.webkitConnection)?.addEventListener("change", drainPrefetchQueue);
  const initialUrl = new URL(location.href);
  afterFirstPaint(() => {
    recordView(initialUrl);
    prepareComments();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${basePath}/sw.js`, { scope: `${basePath}/`, updateViaCache: "none" }).catch(() => {});
    }
    upgradeInitialMath();
    if (document.querySelector("[data-reading-progress]")) applyArticleContentDiff(initialUrl).catch(() => {});
    observeInlineMath();
    updateInlineMathOverflow();
    document.fonts?.ready.then(() => updateInlineMathOverflow());
    prepareAnswerReveals();
    preparePolls();
    prepareGallery();
    const initialSearchMatch = highlightSearchTerm(initialUrl);
    if (initialSearchMatch) requestAnimationFrame(() => scrollToSearchHighlight(initialSearchMatch));
    else if (initialUrl.hash) scrollToHash(initialUrl, { push: false, behavior: "auto" });
    updateReadingState(true);
    scheduleArticlePrefetch();
  });
})();
