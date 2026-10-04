// Reads and writes post frontmatter for the editor. Only the fields Freshmark understands are
// regenerated; every other key (legacy theme fields, comments) is preserved byte for byte.
import { parseFrontmatter, summaryFromBody } from "./markdown.mjs";
import { defaultLocale, locales, localizedPath } from "./i18n.mjs";

export const managedFields = ["title", "date", "summary", "lang", "translationKey", "alternate", "tags", "categories", "featured", "draft"];
const listFields = new Set(["tags", "categories"]);
const booleanFields = new Set(["featured", "draft"]);
const datePattern = /^\d{4}-\d{2}-\d{2}(?:[T ][\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)?$/;

export function splitFrontmatter(source) {
  const text = String(source || "").replaceAll("\r\n", "\n");
  const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
  if (!match) return { entries: [], body: text };
  const entries = [];
  for (const line of match[1].split("\n")) {
    const key = line.match(/^([^\s#:][^:]*):/);
    if (key) entries.push({ key: key[1].trim(), lines: [line] });
    else if (entries.length) entries.at(-1).lines.push(line);
    else entries.push({ key: null, lines: [line] });
  }
  return { entries, body: match[2] };
}

// Quote so that both YAML parsers and Freshmark's lightweight parser read the exact text back.
export function yamlScalar(value) {
  const text = String(value ?? "").replace(/\s*\n\s*/g, " ").trim();
  if (!/["\\]/.test(text)) return `"${text}"`;
  if (!text.includes("'")) return `'${text}'`;
  return `>\n  ${text}`;
}

function listItem(value) {
  const text = String(value).replace(/\s*\n\s*/g, " ").trim();
  if (!/["\\]/.test(text)) return `"${text}"`;
  return `'${text.replaceAll("'", "’")}'`;
}

// Keys absent from the file stay absent while they hold their default value; present keys are kept.
export function serializeField(key, value, { existing = true } = {}) {
  if (booleanFields.has(key)) return !existing && value !== true ? null : [`${key}: ${value === true}`];
  if (listFields.has(key)) {
    const items = (Array.isArray(value) ? value : []).map((item) => String(item).trim()).filter(Boolean);
    if (!items.length) return existing ? [`${key}: []`] : null;
    return [`${key}:`, ...items.map((item) => `  - ${listItem(item)}`)];
  }
  const text = String(value ?? "").trim();
  if (!text) return existing ? [`${key}: ""`] : null;
  return yamlScalar(text).split("\n").map((line, index) => (index ? line : `${key}: ${line}`));
}

export function normalizePostData(data = {}) {
  const normalized = {};
  for (const key of managedFields) {
    const value = data[key];
    if (listFields.has(key)) normalized[key] = Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];
    else if (booleanFields.has(key)) normalized[key] = value === true || value === "true";
    else normalized[key] = value === undefined || value === null ? "" : String(value);
  }
  return normalized;
}

export function readPost(source, file = "Markdown source") {
  const { data, body } = parseFrontmatter(String(source).replaceAll("\r\n", "\n"), file);
  const extraKeys = splitFrontmatter(source).entries.map((entry) => entry.key).filter((key) => key && !managedFields.includes(key));
  const normalized = normalizePostData(data);
  return { data: normalized, extraKeys: [...new Set(extraKeys)], body, autoSummary: !normalized.summary || normalized.summary === summaryFromBody(body) };
}

function entryValue(key, lines) {
  try {
    return normalizePostData(parseFrontmatter(`---\n${lines.join("\n")}\n---\n`).data)[key];
  } catch {
    return undefined;
  }
}

// Untouched fields and an untouched body keep their original bytes, so saves produce minimal diffs.
export function composePost({ source = "", data = {}, body = "", autoSummary = false }) {
  const values = { ...data };
  if (autoSummary) values.summary = summaryFromBody(String(body).trim());
  const split = splitFrontmatter(source);
  const entries = split.entries.map((entry) => ({ ...entry }));
  for (const key of managedFields) {
    if (!Object.hasOwn(values, key)) continue;
    const matches = entries.flatMap((entry, index) => (entry.key === key ? [index] : []));
    if (matches.length === 1 && JSON.stringify(entryValue(key, entries[matches[0]].lines)) === JSON.stringify(normalizePostData({ [key]: values[key] })[key])) continue;
    const lines = serializeField(key, values[key], { existing: matches.length > 0 });
    for (const index of matches.slice(1).reverse()) entries.splice(index, 1);
    if (matches.length) {
      if (lines) entries[matches[0]].lines = lines;
      else entries.splice(matches[0], 1);
      continue;
    }
    if (!lines) continue;
    const previous = managedFields.slice(0, managedFields.indexOf(key)).reverse().map((name) => entries.findIndex((entry) => entry.key === name)).find((index) => index >= 0);
    const leading = entries.findIndex((entry) => entry.key !== null);
    entries.splice(previous !== undefined ? previous + 1 : leading < 0 ? entries.length : leading, 0, { key, lines });
  }
  const yaml = entries.flatMap((entry) => entry.lines).join("\n");
  const text = String(body).replaceAll("\r\n", "\n");
  if (split.entries.length && text.trim() === split.body.trim()) return `---\n${yaml}\n---\n${split.body}`;
  return `---\n${yaml}\n---\n\n${text.replace(/^\s*\n/, "").trimEnd()}\n`;
}

export function postLocale(sourceFile, data = {}) {
  const fromFile = String(sourceFile).match(/\.([a-z]{2})\.md$/)?.[1];
  const requested = String(data.lang || fromFile || defaultLocale).split("-")[0];
  return locales[requested] ? requested : defaultLocale;
}

export function relativeSlug(sourceFile) {
  return String(sourceFile).replace(/(\.[a-z]{2})?\.md$/, "").replace(/(^|\/)index$/, "");
}

// index.md ↔ index.en.md for default-locale posts; an English post kept in index.md pairs with index.zh.md.
export function counterpartFile(sourceFile, locale) {
  const otherLocale = locales[locale].alternate;
  const suffixed = /\.[a-z]{2}\.md$/.test(String(sourceFile));
  const base = String(sourceFile).replace(/(\.[a-z]{2})?\.md$/, "");
  return otherLocale === defaultLocale && suffixed ? `${base}.md` : `${base}.${otherLocale}.md`;
}

export function translationLink(sourceFile, locale) {
  const otherLocale = locales[locale].alternate;
  return { locale: otherLocale, file: counterpartFile(sourceFile, locale), alternate: localizedPath(otherLocale, `/posts/${relativeSlug(sourceFile)}/`) };
}

// ASCII slug that matches the existing content/posts convention; CJK titles fall back to a dated name.
export function suggestSlug(title, today = new Date().toISOString().slice(0, 10)) {
  const slug = String(title || "").normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64).replace(/-+$/, "");
  return slug || `note-${today}`;
}

export function validatePost(data, body = "") {
  const issues = [];
  if (!String(data.title || "").trim()) issues.push({ level: "error", field: "title", message: "title" });
  const date = String(data.date || "");
  const day = date.slice(0, 10);
  const real = !Number.isNaN(Date.parse(`${day}T00:00:00Z`)) && new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;
  if (!datePattern.test(date) || !real) issues.push({ level: "error", field: "date", message: "date" });
  if (data.lang && !locales[String(data.lang).split("-")[0]]) issues.push({ level: "warning", field: "lang", message: "lang" });
  if (String(data.summary || "").length > 220) issues.push({ level: "warning", field: "summary", message: "summaryLength" });
  if (!String(body).trim()) issues.push({ level: "warning", field: "body", message: "emptyBody" });
  return issues;
}
