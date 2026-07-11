(() => {
  const root = document.documentElement;
  const basePath = window.FRESHMARK?.basePath || "";
  const modal = document.querySelector("[data-search-modal]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  let index;

  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
  const setTheme = (theme) => { root.dataset.theme = theme; try { localStorage.setItem("freshmark-theme", theme); } catch {} };
  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

  async function loadIndex() {
    if (!index) index = await fetch(`${basePath}/search-index.json`).then((response) => response.json());
    return index;
  }

  function draw(items, query = "") {
    if (!items.length) { results.innerHTML = '<p class="search-hint">No matching notes. Try a broader word.</p>'; return; }
    results.innerHTML = items.slice(0, 8).map((post) => `<a class="search-result" href="${escape(post.url)}"><strong>${escape(post.title)}</strong><span>${escape([...(post.categories || []), ...post.tags].join(" · "))} · ${post.readingTime} min read</span></a>`).join("");
  }

  async function openSearch() {
    modal.hidden = false; document.body.style.overflow = "hidden"; input.focus();
    try { draw(await loadIndex()); } catch { results.innerHTML = '<p class="search-hint">Search index could not be loaded.</p>'; }
  }
  function closeSearch() { modal.hidden = true; document.body.style.overflow = ""; input.value = ""; }
  document.querySelectorAll("[data-search-open]").forEach((button) => button.addEventListener("click", openSearch));
  document.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);
  modal?.addEventListener("click", (event) => { if (event.target === modal) closeSearch(); });
  input?.addEventListener("input", async () => {
    const needle = input.value.toLowerCase().trim(); const posts = await loadIndex();
    draw(!needle ? posts : posts.filter((post) => `${post.title} ${post.summary} ${(post.categories || []).join(" ")} ${post.tags.join(" ")} ${post.searchText}`.toLowerCase().includes(needle)), needle);
  });
  addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
    if (event.key === "/" && !["INPUT","TEXTAREA"].includes(event.target.tagName)) { event.preventDefault(); openSearch(); }
    if (event.key === "Escape" && !modal?.hidden) closeSearch();
  });

  const filters = document.querySelectorAll("[data-tag]");
  const cards = document.querySelectorAll("[data-post-card]");
  filters.forEach((button) => button.addEventListener("click", () => {
    filters.forEach((item) => item.classList.toggle("active", item === button));
    let shown = 0; cards.forEach((card) => { const visible = button.dataset.tag === "All" || card.dataset.tags.split("|").includes(button.dataset.tag); card.hidden = !visible; if (visible) shown += 1; });
    const empty = document.querySelector("[data-filter-empty]"); if (empty) empty.hidden = shown !== 0;
  }));

  const progress = document.querySelector("[data-reading-progress]");
  if (progress) addEventListener("scroll", () => { const total = document.documentElement.scrollHeight - innerHeight; progress.style.width = `${total > 0 ? Math.min(100, scrollY / total * 100) : 0}%`; }, { passive:true });
})();
