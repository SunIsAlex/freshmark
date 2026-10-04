// Loaded on first use of the theme picker so the initial bundle stays small.
const root = document.documentElement;
let menu;
let trigger;
let options;

function loadSkinStyles(href) {
  let link = document.querySelector("link[data-skin-styles]");
  if (link?.sheet) return Promise.resolve();
  if (!link) {
    link = Object.assign(document.createElement("link"), { rel: "stylesheet", href });
    link.setAttribute("data-skin-styles", "");
    document.head.append(link);
  }
  return new Promise((resolve) => {
    link.addEventListener("load", resolve, { once: true });
    link.addEventListener("error", resolve, { once: true });
  });
}

async function setSkin(skin) {
  if (skin !== "ivory") await loadSkinStyles(options.skinStyles);
  if (skin === "ivory") delete root.dataset.skin;
  else root.dataset.skin = skin;
  try { localStorage.setItem("freshmark-skin", skin); } catch {}
  sync();
}

function sync() {
  const skin = root.dataset.skin || "ivory";
  const mode = root.dataset.theme === "dark" ? "dark" : "light";
  menu.querySelectorAll("[data-skin-option]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.skinOption === skin)));
  menu.querySelectorAll("[data-mode-option]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.modeOption === mode)));
}

function close({ restoreFocus = false } = {}) {
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
  if (restoreFocus) trigger.focus();
}

function build() {
  const { messages } = options;
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
  menu = document.createElement("div");
  menu.className = "skin-menu";
  menu.id = "skin-menu";
  menu.hidden = true;
  menu.setAttribute("role", "group");
  menu.setAttribute("aria-label", messages.chooseSkin);
  menu.innerHTML = `<p class="skin-menu-title">${escape(messages.skinHeading)}</p><div class="skin-options">${Object.entries(messages.skinLabels).map(([skin, label]) => `<button class="skin-option" type="button" data-skin-option="${skin}" aria-pressed="false"><span class="skin-swatch" data-swatch="${skin}" aria-hidden="true"><i></i><i></i><i></i></span><span>${escape(label)}</span></button>`).join("")}</div><p class="skin-menu-title">${escape(messages.modeHeading)}</p><div class="mode-switch">${["light", "dark"].map((mode) => `<button type="button" data-mode-option="${mode}" aria-pressed="false">${escape(messages[mode === "dark" ? "modeDark" : "modeLight"])}</button>`).join("")}</div>`;
  trigger.setAttribute("aria-controls", menu.id);
  trigger.after(menu);
  menu.addEventListener("click", (event) => {
    const skin = event.target.closest("[data-skin-option]");
    if (skin) { setSkin(skin.dataset.skinOption); return; }
    const mode = event.target.closest("[data-mode-option]");
    if (mode) { options.setTheme(mode.dataset.modeOption); sync(); }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".skin-picker")) close();
  });
  addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) close({ restoreFocus: menu.contains(document.activeElement) });
  });
  menu.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !event.relatedTarget.closest(".skin-picker")) close();
  });
}

export function toggleSkinMenu(button, settings) {
  trigger = button;
  options = settings;
  if (!menu) build();
  if (!menu.hidden) { close(); return; }
  sync();
  menu.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
  menu.querySelector('[aria-pressed="true"]')?.focus();
}
