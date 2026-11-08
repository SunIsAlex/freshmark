// Frontmatter as an editable header above the text: a title field, a one-line summary of the
// metadata, and an expandable panel. The server turns these values into YAML (lib/frontmatter.mjs).
import { t } from "./i18n.js";

export const element = (tag, attributes = {}, children = []) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (key === "class") node.className = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else if (value !== false && value !== undefined) node.setAttribute(key, value === true ? "" : value);
  }
  node.append(...[].concat(children).filter((child) => child !== null && child !== undefined));
  return node;
};

// A row of removable chips with an input that adds on Enter or comma; used for tags and categories.
let chipListCount = 0;
export function chipEditor({ label, values, suggestions, onChange }) {
  const wrapper = element("div", { class: "chips" });
  const listId = `chip-suggest-${(chipListCount += 1)}`;
  const set = (next) => { onChange(next); draw(); wrapper.querySelector("input").focus(); };
  const draw = () => {
    const current = values();
    const input = element("input", {
      class: "chip-input", list: listId, placeholder: t("addTag"), "aria-label": label, enterkeyhint: "done",
      onkeydown: (event) => {
        const value = event.target.value.trim().replace(/[,，]$/, "");
        if ((event.key === "Enter" || event.key === "," || event.key === "，") && value) {
          event.preventDefault();
          if (!current.includes(value)) set([...current, value]);
        } else if (event.key === "Enter") event.preventDefault();
        else if (event.key === "Backspace" && !event.target.value && current.length) set(current.slice(0, -1));
      },
      // Picking a suggestion, or typing a comma on a phone keyboard that sends no key events.
      oninput: (event) => {
        const value = event.target.value;
        if (/[,，]$/.test(value) && value.slice(0, -1).trim()) { const item = value.slice(0, -1).trim(); if (!current.includes(item)) set([...current, item]); else draw(); }
        else if (suggestions.includes(value) && event.inputType !== "insertText" && !current.includes(value)) set([...current, value]);
      },
    });
    wrapper.replaceChildren(
      ...current.map((value) => element("span", { class: "chip" }, [value, element("button", { type: "button", "aria-label": `× ${value}`, onclick: () => set(current.filter((item) => item !== value)) }, "×")])),
      input,
      element("datalist", { id: listId }, suggestions.filter((value) => !current.includes(value)).slice(0, 80).map((value) => element("option", { value }))),
    );
  };
  draw();
  return wrapper;
}

export class PropertiesPanel {
  constructor(root, { onChange, onTitleEnter, requestSummary, vocabulary }) {
    this.root = root;
    this.onChange = onChange;
    this.onTitleEnter = onTitleEnter;
    this.requestSummary = requestSummary;
    this.vocabulary = vocabulary;
    this.expanded = false;
  }

  load(post, { site, onOpenTranslation, onCreateTranslation, onMove }) {
    this.post = post;
    this.data = structuredClone(post.data);
    this.autoSummary = post.autoSummary;
    this.autoText = post.autoSummary ? post.data.summary : "";
    this.site = site;
    this.onOpenTranslation = onOpenTranslation;
    this.onCreateTranslation = onCreateTranslation;
    this.onMove = onMove;
    this.render();
  }

  values() {
    return { data: this.data, autoSummary: this.autoSummary };
  }

  update(saved) {
    this.post = { ...this.post, issues: saved.issues };
    if (this.autoSummary) {
      this.data.summary = saved.data.summary;
      this.autoText = saved.data.summary;
      if (this.summaryField && document.activeElement !== this.summaryField) this.summaryField.value = this.autoText;
    }
    this.renderIssues();
  }

  setAutoSummary(text) {
    if (!this.autoSummary) return;
    this.autoText = text;
    this.data.summary = text;
    if (this.summaryField && document.activeElement !== this.summaryField) this.summaryField.value = text;
  }

  change(key, value) {
    this.data[key] = value;
    this.renderMeta();
    this.onChange();
  }

  render() {
    this.root.replaceChildren();
    this.title = element("textarea", {
      class: "doc-title", rows: "1", placeholder: t("titlePlaceholder"), "aria-label": t("titlePlaceholder"), spellcheck: "false",
      oninput: (event) => { this.data.title = event.target.value.replace(/\n/g, " "); this.fit(); this.onChange(); },
      onkeydown: (event) => { if (event.key === "Enter") { event.preventDefault(); this.onTitleEnter(); } },
    });
    this.title.value = this.data.title;
    this.meta = element("button", { class: "doc-meta", type: "button", "aria-expanded": String(this.expanded), onclick: () => this.toggle() });
    this.panel = element("div", { class: "doc-props", hidden: !this.expanded });
    this.issues = element("ul", { class: "doc-issues" });
    this.root.append(this.title, this.meta, this.panel, this.issues);
    this.renderMeta();
    this.renderPanel();
    this.renderIssues();
    requestAnimationFrame(() => this.fit());
  }

  fit() {
    this.title.style.height = "auto";
    this.title.style.height = `${this.title.scrollHeight}px`;
  }

  toggle() {
    this.expanded = !this.expanded;
    this.panel.hidden = !this.expanded;
    this.meta.setAttribute("aria-expanded", String(this.expanded));
  }

  renderMeta() {
    const { data, post } = this;
    const bits = [
      element("span", { class: `pill ${data.draft ? "pill-draft" : "pill-live"}` }, data.draft ? t("draft") : t("published")),
      element("span", {}, data.date.slice(0, 10) || "—"),
      element("span", {}, t(`localeName_${data.lang || post.locale}`)),
      ...(data.featured ? [element("span", {}, `★ ${t("featured")}`)] : []),
      ...data.categories.slice(0, 2).map((value) => element("span", {}, value)),
      ...data.tags.slice(0, 4).map((value) => element("span", { class: "meta-tag" }, `#${value}`)),
    ];
    this.meta.replaceChildren(...bits, element("span", { class: "meta-more", "aria-hidden": "true" }, t("properties")));
  }

  renderIssues() {
    this.issues.replaceChildren(...(this.post.issues || []).map((issue) => element("li", { class: `issue-${issue.level}` }, t(`issue_${issue.message}`))));
  }

  chips(key, suggestions) {
    return chipEditor({ label: t(key), values: () => this.data[key], suggestions, onChange: (values) => this.change(key, values) });
  }

  // The post's path under content/posts; editing it moves or renames the file (and its folder).
  locationControl() {
    const { post } = this;
    const error = element("span", { class: "location-error", role: "alert" });
    const move = async () => {
      const to = input.value.trim();
      if (!to || to === post.file) return;
      button.disabled = true;
      error.textContent = "";
      try { await this.onMove(to); } catch (failure) { error.textContent = failure.message; button.disabled = false; }
    };
    const input = element("input", {
      class: "location-input", value: post.file, spellcheck: "false", autocapitalize: "off", autocomplete: "off", "aria-label": t("location"), title: t("locationHint"),
      oninput: () => { button.disabled = !input.value.trim() || input.value.trim() === post.file; error.textContent = ""; },
      onkeydown: (event) => {
        if (event.key === "Enter") { event.preventDefault(); move(); }
        if (event.key === "Escape") { input.value = post.file; button.disabled = true; error.textContent = ""; }
      },
    });
    const button = element("button", { type: "button", class: "small-button", disabled: true, onclick: move }, t("move"));
    return element("div", { class: "location" }, [element("div", { class: "location-row" }, [element("span", { class: "location-root" }, "content/posts/"), input, button]), element("small", { class: "location-hint" }, t("locationHint")), error]);
  }

  renderPanel() {
    const { data, post } = this;
    const vocabulary = this.vocabulary();
    const row = (label, control) => element("label", { class: "prop" }, [element("span", { class: "prop-label" }, label), control]);
    const date = element("input", {
      type: "date", value: data.date.slice(0, 10),
      onchange: (event) => this.change("date", event.target.value + data.date.slice(10)),
    });
    const language = element("select", { onchange: (event) => this.change("lang", event.target.value) }, vocabulary.locales.map((locale) => element("option", { value: locale, selected: (data.lang || post.locale) === locale }, t(`localeName_${locale}`))));
    const status = element("div", { class: "segmented", role: "group" }, [false, true].map((draft) => element("button", {
      type: "button", "aria-pressed": String(data.draft === draft), onclick: (event) => {
        this.change("draft", draft);
        event.currentTarget.parentElement.querySelectorAll("button").forEach((button, index) => button.setAttribute("aria-pressed", String(index === Number(draft))));
      },
    }, draft ? t("draft") : t("published"))));
    const featured = element("input", { type: "checkbox", checked: data.featured, onchange: (event) => this.change("featured", event.target.checked) });
    this.summaryField = element("textarea", {
      class: "summary", rows: "3", placeholder: t("summaryAutoHint"),
      oninput: (event) => {
        this.autoSummary = false;
        autoToggle.setAttribute("aria-pressed", "false");
        this.change("summary", event.target.value);
      },
    });
    this.summaryField.value = data.summary;
    const autoToggle = element("button", {
      type: "button", class: "auto-toggle", "aria-pressed": String(this.autoSummary), title: t("summaryAutoHint"),
      onclick: async () => {
        this.autoSummary = !this.autoSummary;
        autoToggle.setAttribute("aria-pressed", String(this.autoSummary));
        if (this.autoSummary) {
          const text = await this.requestSummary();
          this.setAutoSummary(text);
          this.summaryField.value = text;
        }
        this.onChange();
      },
    }, t("summaryAuto"));
    const translation = post.translation;
    const otherLocale = t(`localeName_${translation.locale}`);
    const translationControl = translation.exists
      ? element("button", { type: "button", class: "link-button", onclick: () => this.onOpenTranslation(translation.file) }, `${t("openTranslation")} · ${translation.file.split("/").pop()}`)
      : element("button", { type: "button", class: "link-button", onclick: () => this.onCreateTranslation() }, `+ ${t("createTranslation", { lang: otherLocale })}`);
    const siteUrl = `${this.site.replace(/\/$/, "")}${post.locale === "zh" ? "" : `/${post.locale}`}/posts/${post.slug}/`;
    this.panel.replaceChildren(
      row(t("status"), status),
      row(t("date"), date),
      row(t("language"), language),
      row(t("categories"), this.chips("categories", vocabulary.categories)),
      row(t("tags"), this.chips("tags", vocabulary.tags)),
      element("div", { class: "prop prop-summary" }, [element("span", { class: "prop-label" }, [t("summary"), autoToggle]), this.summaryField]),
      row(t("featured"), featured),
      row(t("translation"), translationControl),
      row(t("location"), this.locationControl()),
      element("div", { class: "prop-foot" }, [
        element("a", { href: siteUrl, target: "_blank", rel: "noopener", title: t("openOnSiteHint") }, `${t("openOnSite")} ↗`),
        post.extraKeys.length ? element("span", { class: "prop-extra", title: post.extraKeys.join(", ") }, t("extraFields", { count: post.extraKeys.length })) : null,
      ]),
    );
  }
}
