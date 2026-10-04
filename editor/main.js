import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView, drawSelection, dropCursor, keymap } from "@codemirror/view";
import { defaultKeymap, history as undoHistory, historyKeymap, indentWithTab, redo, undo } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting, syntaxTree } from "@codemirror/language";
import { highlightSelectionMatches, search, searchKeymap } from "@codemirror/search";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { tags } from "@lezer/highlight";
import { mathSyntax } from "./math.js";
import { headings, imageResolver, livePreviewExtension, setSourceMode, sourceMode } from "./live-preview.js";
import { PropertiesPanel } from "./properties.js";
import { t } from "./i18n.js";

const config = window.FRESHMARK_EDITOR;
const $ = (selector) => document.querySelector(selector);
const state = { file: "", post: null, hash: "", dirty: false, saving: false, timer: 0, posts: [], vocabulary: { subjects: [], tags: [], categories: [], locales: ["zh", "en"] } };

async function api(path, { method = "GET", json, body, headers = {} } = {}) {
  const response = await fetch(path, {
    method,
    headers: { "x-freshmark-token": config.token, ...(json ? { "content-type": "application/json" } : {}), ...headers },
    body: json ? JSON.stringify(json) : body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(payload.error || response.statusText), { status: response.status, payload });
  return payload;
}

// ---------- Editor ----------
const highlight = HighlightStyle.define([
  { tag: tags.heading, fontWeight: "650" },
  { tag: tags.strong, fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: [tags.processingInstruction, tags.meta, tags.contentSeparator], color: "var(--muted)" },
  { tag: [tags.url, tags.link], color: "var(--link)" },
  { tag: tags.monospace, fontFamily: "var(--mono)" },
  { tag: tags.quote, color: "var(--soft)" },
]);

const wrap = (marker) => (view) => {
  view.dispatch(view.state.changeByRange((range) => {
    const before = view.state.sliceDoc(range.from - marker.length, range.from);
    const after = view.state.sliceDoc(range.to, range.to + marker.length);
    if (before === marker && after === marker) {
      return { changes: [{ from: range.from - marker.length, to: range.from }, { from: range.to, to: range.to + marker.length }], range: EditorSelection.range(range.from - marker.length, range.to - marker.length) };
    }
    return { changes: [{ from: range.from, insert: marker }, { from: range.to, insert: marker }], range: EditorSelection.range(range.from + marker.length, range.to + marker.length) };
  }));
  return true;
};

const setHeading = (level) => (view) => {
  const changes = [];
  for (const range of view.state.selection.ranges) {
    for (let position = range.from; position <= range.to;) {
      const line = view.state.doc.lineAt(position);
      const existing = line.text.match(/^#{1,6}\s+/)?.[0] || "";
      changes.push({ from: line.from, to: line.from + existing.length, insert: level ? `${"#".repeat(level)} ` : "" });
      position = line.to + 1;
    }
  }
  view.dispatch({ changes });
  return true;
};

const insertBlock = (open, close) => (view) => {
  const range = view.state.selection.main;
  const line = view.state.doc.lineAt(range.from);
  const prefix = line.text.trim() ? "\n\n" : "";
  const selected = view.state.sliceDoc(range.from, range.to);
  const insert = `${prefix}${open}\n${selected}\n${close}\n`;
  const at = line.text.trim() ? line.to : line.from;
  view.dispatch({ changes: { from: at, to: line.text.trim() ? line.to : Math.max(line.to, range.to), insert }, selection: { anchor: at + prefix.length + open.length + 1 + selected.length } });
  return true;
};

const insertLink = (view) => {
  const range = view.state.selection.main;
  const text = view.state.sliceDoc(range.from, range.to);
  view.dispatch({ changes: { from: range.from, to: range.to, insert: `[${text}]()` }, selection: { anchor: range.from + text.length + 3 } });
  return true;
};

const prefixLines = (prefix) => (view) => {
  const changes = [];
  const range = view.state.selection.main;
  for (let position = range.from; position <= range.to;) {
    const line = view.state.doc.lineAt(position);
    changes.push(line.text.startsWith(prefix) ? { from: line.from, to: line.from + prefix.length } : { from: line.from, insert: prefix });
    position = line.to + 1;
  }
  view.dispatch({ changes });
  return true;
};

// Typing $$ then Enter opens a math block, like Typora.
const closeMathBlock = (view) => {
  const range = view.state.selection.main;
  if (!range.empty) return false;
  const line = view.state.doc.lineAt(range.head);
  if (line.text.trim() !== "$$" || range.head !== line.to) return false;
  const node = syntaxTree(view.state).resolveInner(line.from + line.text.indexOf("$$") + 1, 1);
  let math = node;
  while (math && math.name !== "BlockMath") math = math.parent;
  if (math && math.getChildren("BlockMathMark").length > 1) return false;
  view.dispatch({ changes: { from: line.to, insert: "\n\n$$" }, selection: { anchor: line.to + 1 } });
  return true;
};

const toggleSource = (view) => {
  const next = !view.state.field(sourceMode);
  view.dispatch({ effects: setSourceMode.of(next) });
  document.body.classList.toggle("source-mode", next);
  $("[data-action=source]").setAttribute("aria-pressed", String(next));
  return true;
};

const editorKeymap = [
  { key: "Mod-s", run: () => { save(); return true; }, preventDefault: true },
  { key: "Mod-b", run: wrap("**") },
  { key: "Mod-i", run: wrap("*") },
  { key: "Mod-`", run: wrap("`") },
  { key: "Mod-Shift-`", run: insertBlock("```", "```") },
  { key: "Mod-m", run: wrap("$") },
  { key: "Mod-Shift-m", run: insertBlock("$$", "$$") },
  { key: "Mod-k", run: insertLink },
  { key: "Mod-/", run: toggleSource },
  { key: "Mod-0", run: setHeading(0) },
  ...[1, 2, 3, 4, 5, 6].map((level) => ({ key: `Mod-${level}`, run: setHeading(level) })),
  { key: "Enter", run: closeMathBlock },
];

const view = new EditorView({
  parent: $("#editor"),
  state: EditorState.create({ doc: "", extensions: editorExtensions() }),
});
window.freshmarkEditor = view; // automation hook for UI checks

function editorExtensions() {
  return [
    undoHistory(),
    drawSelection(),
    dropCursor(),
    closeBrackets(),
    search({ top: true }),
    highlightSelectionMatches(),
    EditorView.lineWrapping,
    EditorState.languageData.of(() => [{ closeBrackets: { brackets: ["(", "[", "{", "'", '"', "$", "`"] } }]),
    markdown({ base: markdownLanguage, extensions: [mathSyntax], addKeymap: true }),
    syntaxHighlighting(highlight),
    sourceMode,
    livePreviewExtension,
    keymap.of([...editorKeymap, ...closeBracketsKeymap, ...searchKeymap, ...historyKeymap, ...defaultKeymap, indentWithTab]),
    EditorView.contentAttributes.of({ spellcheck: "false", autocorrect: "off", "aria-label": "Markdown" }),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) { markDirty(); scheduleSummary(); }
      if (update.docChanged || update.selectionSet) scheduleOutline();
    }),
    EditorView.domEventHandlers({
      paste: (event) => uploadFiles([...(event.clipboardData?.files || [])], event),
      drop: (event, editorView) => {
        const position = editorView.posAtCoords({ x: event.clientX, y: event.clientY });
        if (position !== null) editorView.dispatch({ selection: { anchor: position } });
        return uploadFiles([...(event.dataTransfer?.files || [])], event);
      },
      click: (event) => {
        const link = event.target.closest(".cm-link, .cm-url");
        if (!link || !(event.metaKey || event.ctrlKey)) return false;
        const position = view.posAtDOM(link);
        const match = view.state.doc.lineAt(position).text.match(/\]\(([^)\s]+)/) || link.textContent.match(/https?:\/\/\S+/);
        if (match) window.open(match[1] || match[0], "_blank", "noopener");
        return true;
      },
    }),
  ];
}

function uploadFiles(files, event) {
  const images = files.filter((file) => file.type.startsWith("image/"));
  if (!images.length || !state.file) return false;
  event.preventDefault();
  (async () => {
    for (const file of images) {
      const extension = (file.type.split("/")[1] || "png").replace("jpeg", "jpg").replace("svg+xml", "svg");
      const name = file.name && file.name !== "image.png" ? file.name : `pasted-${new Date().toISOString().slice(0, 19).replace(/\D/g, "")}.${extension}`;
      try {
        const { name: saved } = await api(`/api/asset?file=${encodeURIComponent(state.file)}&name=${encodeURIComponent(name)}`, { method: "POST", body: file, headers: { "content-type": file.type } });
        const range = view.state.selection.main;
        const insert = `![](${saved})`;
        view.dispatch({ changes: { from: range.from, to: range.to, insert }, selection: { anchor: range.from + insert.length } });
      } catch {
        toast(t("uploadFailed"));
      }
    }
  })();
  return true;
}

// ---------- Properties ----------
const properties = new PropertiesPanel($("#properties"), {
  onChange: () => markDirty(),
  onTitleEnter: () => { view.focus(); view.dispatch({ selection: { anchor: 0 } }); },
  requestSummary: () => api("/api/summary", { method: "POST", json: { body: view.state.doc.toString() } }).then((result) => result.summary),
  vocabulary: () => state.vocabulary,
});

let summaryTimer = 0;
function scheduleSummary() {
  if (!state.post || !properties.autoSummary) return;
  clearTimeout(summaryTimer);
  summaryTimer = setTimeout(async () => properties.setAutoSummary((await api("/api/summary", { method: "POST", json: { body: view.state.doc.toString() } }).catch(() => ({ summary: properties.autoText }))).summary), 700);
}

// ---------- Open / save ----------
const draftKey = (file) => `fm-editor:draft:${file}`;

function setStatus(kind, text) {
  const status = $("#status");
  status.dataset.kind = kind;
  status.textContent = text;
}

function markDirty() {
  if (!state.post || state.loading) return;
  state.dirty = true;
  setStatus("dirty", t("unsaved"));
  clearTimeout(state.timer);
  state.timer = setTimeout(save, 1200);
  clearTimeout(state.draftTimer);
  state.draftTimer = setTimeout(() => {
    try { localStorage.setItem(draftKey(state.file), JSON.stringify({ hash: state.hash, body: view.state.doc.toString(), ...properties.values(), time: Date.now() })); } catch {}
  }, 300);
  updateCount();
}

async function save({ force = false } = {}) {
  if (!state.post || !state.dirty || state.saving) return;
  clearTimeout(state.timer);
  state.saving = true;
  setStatus("saving", t("saving"));
  const file = state.file;
  const body = view.state.doc.toString();
  const { data, autoSummary } = properties.values();
  try {
    const saved = await api("/api/post", { method: "PUT", json: { file, data, body, autoSummary, baseHash: state.hash, force } });
    if (file !== state.file) return;
    state.hash = saved.hash;
    if (view.state.doc.toString() === body) {
      state.dirty = false;
      try { localStorage.removeItem(draftKey(file)); } catch {}
      setStatus("saved", t("saved"));
    } else state.timer = setTimeout(save, 600);
    properties.update(saved);
    hideBanner();
    refreshList();
  } catch (error) {
    if (error.status === 409) showConflict();
    else setStatus("offline", t("offline"));
    if (!error.status) state.timer = setTimeout(save, 5000);
  } finally {
    state.saving = false;
  }
}

async function open(file, { recover = true } = {}) {
  if (state.dirty) await save();
  const post = await api(`/api/post?file=${encodeURIComponent(file)}`);
  state.loading = true;
  state.file = file;
  state.post = post;
  state.hash = post.hash;
  state.dirty = false;
  const directory = file.split("/").slice(0, -1).map(encodeURIComponent).join("/");
  imageResolver.resolve = (src) => (/^(https?:|data:|blob:)/.test(src) ? src : src.startsWith("/") ? `${config.site.replace(/\/$/, "")}${src}` : `/content/${directory}/${src.split("/").map(encodeURIComponent).join("/")}`);
  let body = post.body;
  let recovered = null;
  if (recover) {
    try { recovered = JSON.parse(localStorage.getItem(draftKey(file)) || "null"); } catch {}
    if (recovered && recovered.hash === post.hash && (recovered.body !== post.body || JSON.stringify(recovered.data) !== JSON.stringify(post.data))) {
      body = recovered.body;
      post.data = recovered.data;
      post.autoSummary = recovered.autoSummary;
    } else recovered = null;
  }
  properties.load(post, { site: config.site, onOpenTranslation: (other) => open(other), onCreateTranslation: createTranslation });
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: body }, selection: { anchor: 0 }, scrollIntoView: true });
  state.loading = false;
  document.body.classList.add("has-file");
  history.replaceState(null, "", `?file=${encodeURIComponent(file)}`);
  try { localStorage.setItem("fm-editor:last", file); } catch {}
  document.title = `${post.data.title || t("titlePlaceholder")} — Freshmark`;
  setStatus("saved", t("saved"));
  hideBanner();
  updateCount();
  renderOutline();
  highlightCurrent();
  closeDrawer();
  if (recovered) { state.dirty = true; setStatus("dirty", t("unsaved")); toast(t("recovered")); save(); }
}

async function createTranslation() {
  await save();
  const { file } = await api("/api/translation", { method: "POST", json: { file: state.file } });
  await refreshList();
  await open(file, { recover: false });
}

// Pick up edits made outside the editor (git pull, another device) when the window regains focus.
async function checkExternal() {
  if (!state.file || state.saving) return;
  try {
    const post = await api(`/api/post?file=${encodeURIComponent(state.file)}`);
    if (post.hash === state.hash) return;
    if (state.dirty) showConflict();
    else open(state.file, { recover: false });
  } catch {}
}

function showConflict() {
  const banner = $("#banner");
  banner.hidden = false;
  banner.replaceChildren(
    Object.assign(document.createElement("span"), { textContent: t("conflict") }),
    Object.assign(document.createElement("button"), { textContent: t("reload"), onclick: () => { try { localStorage.removeItem(draftKey(state.file)); } catch {} open(state.file, { recover: false }); } }),
    Object.assign(document.createElement("button"), { textContent: t("overwrite"), onclick: () => { state.dirty = true; save({ force: true }); } }),
  );
  setStatus("dirty", t("unsaved"));
}
const hideBanner = () => { $("#banner").hidden = true; };

let toastTimer = 0;
function toast(text) {
  const element = $("#toast");
  element.textContent = text;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { element.hidden = true; }, 3200);
}

function updateCount() {
  const text = view.state.doc.toString().replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*\$/g, " ");
  const count = (text.match(/[㐀-鿿]/g) || []).length + (text.replace(/[㐀-鿿]/g, " ").match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length;
  $("#count").textContent = t("words", { count: count.toLocaleString() });
}

// ---------- Sidebar ----------
async function refreshList() {
  state.posts = await api("/api/posts").catch(() => state.posts);
  renderList();
}

function renderList() {
  const query = $("#filter").value.trim().toLowerCase();
  const groups = new Map();
  for (const post of state.posts) {
    if (query && !`${post.title} ${post.file}`.toLowerCase().includes(query)) continue;
    if (!groups.has(post.subject)) groups.set(post.subject, []);
    groups.get(post.subject).push(post);
  }
  const labels = Object.fromEntries(state.vocabulary.subjects.map((subject) => [subject.id, subject.labels[document.documentElement.lang.startsWith("zh") ? "zh" : "en"]]));
  const list = $("#files");
  list.replaceChildren(...[...groups].map(([subject, posts]) => {
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    heading.textContent = `${labels[subject] || subject} · ${posts.length}`;
    section.append(heading, ...posts.map((post) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "file";
      button.dataset.file = post.file;
      const title = document.createElement("span");
      title.className = "file-title";
      title.textContent = post.title || post.file;
      const meta = document.createElement("span");
      meta.className = "file-meta";
      meta.textContent = [post.date, post.locale !== "zh" ? post.locale.toUpperCase() : "", post.translated ? "⇄" : ""].filter(Boolean).join(" · ");
      if (post.draft) meta.prepend(Object.assign(document.createElement("b"), { textContent: `${t("draft")} ` }));
      button.append(title, meta);
      button.addEventListener("click", () => open(post.file));
      return button;
    }));
    return section;
  }));
  highlightCurrent();
}

function highlightCurrent() {
  document.querySelectorAll(".file").forEach((button) => button.setAttribute("aria-current", String(button.dataset.file === state.file)));
}

let outlineTimer = 0;
function scheduleOutline() {
  clearTimeout(outlineTimer);
  outlineTimer = setTimeout(renderOutline, 250);
}

function renderOutline() {
  const items = headings(view.state);
  const head = view.state.selection.main.head;
  const current = items.filter((item) => item.from <= head).at(-1);
  const outline = $("#outline");
  if (!items.length) { outline.replaceChildren(Object.assign(document.createElement("p"), { className: "empty", textContent: t("noOutline") })); return; }
  outline.replaceChildren(...items.map((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `outline-item level-${item.level}`;
    button.textContent = item.text;
    button.setAttribute("aria-current", String(item === current));
    button.addEventListener("click", () => {
      view.dispatch({ selection: { anchor: item.from }, effects: EditorView.scrollIntoView(item.from, { y: "start", yMargin: 80 }) });
      view.focus();
      closeDrawer();
    });
    return button;
  }));
}

// ---------- New post ----------
function openNewPost() {
  const dialog = $("#new-post");
  const form = dialog.querySelector("form");
  form.reset();
  const subjects = form.elements.subject;
  subjects.replaceChildren(...state.vocabulary.subjects.map((subject) => new Option(subject.labels[document.documentElement.lang.startsWith("zh") ? "zh" : "en"], subject.id)));
  const current = state.file.split("/")[0];
  if (current) subjects.value = current;
  form.elements.locale.value = document.documentElement.lang.startsWith("zh") ? "zh" : "en";
  dialog.querySelector(".form-error").textContent = "";
  dialog.showModal();
  form.elements.title.focus();
}

function suggestSlug(title) {
  const slug = title.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64).replace(/-+$/, "");
  return slug || `note-${new Date().toISOString().slice(0, 10)}`;
}

$("#new-post form").addEventListener("input", (event) => {
  const form = event.currentTarget;
  if (event.target.name === "title" && !form.elements.slug.dataset.touched) form.elements.slug.value = suggestSlug(form.elements.title.value);
  if (event.target.name === "slug") form.elements.slug.dataset.touched = "1";
});
$("#new-post form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (event.submitter?.value === "cancel") { form.closest("dialog").close(); return; }
  try {
    const { file } = await api("/api/post", { method: "POST", json: { title: form.elements.title.value, subject: form.elements.subject.value, slug: form.elements.slug.value, locale: form.elements.locale.value } });
    form.closest("dialog").close();
    delete form.elements.slug.dataset.touched;
    await refreshList();
    await open(file, { recover: false });
    view.focus();
  } catch (error) {
    form.querySelector(".form-error").textContent = error.message;
  }
});

// ---------- Chrome ----------
function closeDrawer() { document.body.classList.remove("drawer-open"); }
const actions = {
  menu: () => document.body.classList.toggle("drawer-open"),
  new: openNewPost,
  source: () => toggleSource(view),
  theme: () => {
    const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("fm-editor:theme", document.documentElement.dataset.theme); } catch {}
  },
  tab: (button) => {
    document.querySelectorAll("[data-action=tab]").forEach((tab) => tab.setAttribute("aria-selected", String(tab === button)));
    $("#files").hidden = button.dataset.tab !== "files";
    $("#outline").hidden = button.dataset.tab !== "outline";
    $("#filter").hidden = button.dataset.tab !== "files";
  },
  bold: () => wrap("**")(view), italic: () => wrap("*")(view), code: () => wrap("`")(view), inlineMath: () => wrap("$")(view),
  blockMath: () => insertBlock("$$", "$$")(view), heading: () => {
    const line = view.state.doc.lineAt(view.state.selection.main.head);
    const level = (line.text.match(/^(#{1,6})\s/)?.[1].length || 0) % 3 + 1;
    return setHeading(level)(view);
  },
  list: () => prefixLines("- ")(view), quote: () => prefixLines("> ")(view), link: () => insertLink(view),
  image: () => $("#image-input").click(), undo: () => undo(view), redo: () => redo(view),
};
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const keepFocus = button.closest(".touchbar");
  actions[button.dataset.action]?.(button);
  if (keepFocus) view.focus();
});
document.querySelector(".touchbar")?.addEventListener("mousedown", (event) => event.preventDefault());
$("#image-input").addEventListener("change", (event) => {
  uploadFiles([...event.target.files], { preventDefault() {} });
  event.target.value = "";
});
$("#filter").addEventListener("input", renderList);
$("#scrim").addEventListener("click", closeDrawer);
addEventListener("focus", checkExternal);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkExternal(); else save(); });
addEventListener("beforeunload", (event) => { if (state.dirty) { save(); event.preventDefault(); } });

// Keep the touch toolbar above the on-screen keyboard on Android.
if (window.visualViewport) {
  const place = () => document.documentElement.style.setProperty("--keyboard", `${Math.max(0, innerHeight - visualViewport.height - visualViewport.offsetTop)}px`);
  visualViewport.addEventListener("resize", place);
  visualViewport.addEventListener("scroll", place);
}

// Translate static labels.
document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
document.querySelectorAll("[data-i18n-label]").forEach((node) => { node.setAttribute("aria-label", t(node.dataset.i18nLabel)); node.title = t(node.dataset.i18nLabel); });
$("#filter").placeholder = t("filter");
document.documentElement.lang = navigator.language?.toLowerCase().startsWith("zh") ? "zh-CN" : "en";

(async () => {
  const [posts, vocabulary] = await Promise.all([api("/api/posts"), api("/api/vocabulary")]);
  state.posts = posts;
  state.vocabulary = vocabulary;
  renderList();
  const requested = new URLSearchParams(location.search).get("file") || localStorage.getItem("fm-editor:last");
  if (requested && posts.some((post) => post.file === requested)) await open(requested);
  else document.body.classList.add("drawer-open");
})().catch((error) => setStatus("offline", error.message));

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
