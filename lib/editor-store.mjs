// File operations behind the Freshmark editor. Every path is relative to content/posts and is
// resolved through resolveContentPath, so requests can never reach files outside that folder.
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { composePost, postLocale, readPost, relativeSlug, suggestSlug, translationLink, validatePost } from "./frontmatter.mjs";
import { renderTemplate } from "./templates.mjs";
import { subjectLabel, subjectLabels } from "./subjects.mjs";
import { locales } from "./i18n.mjs";

export const imageTypes = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml" };

export class EditorError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.status = status;
    Object.assign(this, details);
  }
}

export function resolveContentPath(contentDir, relative, { extensions } = {}) {
  const value = String(relative || "").replaceAll("\\", "/");
  if (!value || value.startsWith("/") || value.split("/").some((part) => part === ".." || part === "")) throw new EditorError(400, "Invalid path");
  const absolute = path.resolve(contentDir, ...value.split("/"));
  const relation = path.relative(contentDir, absolute);
  if (!relation || relation.startsWith("..") || path.isAbsolute(relation)) throw new EditorError(400, "Path outside content/posts");
  if (extensions && !extensions.includes(path.extname(absolute).toLowerCase())) throw new EditorError(400, "Unsupported file type");
  return absolute;
}

const hash = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);
const toRelative = (contentDir, absolute) => path.relative(contentDir, absolute).split(path.sep).join("/");

async function markdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(entries.map((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) return markdownFiles(absolute);
    return entry.isFile() && entry.name.endsWith(".md") ? [absolute] : [];
  }));
  return nested.flat();
}

async function writeAtomic(absolute, contents) {
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  const temporary = `${absolute}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(temporary, contents);
  await fs.rename(temporary, absolute);
}

export async function listPosts(contentDir) {
  const files = await markdownFiles(contentDir);
  const posts = (await Promise.all(files.map(async (absolute) => {
    const file = toRelative(contentDir, absolute);
    try {
      const { data } = readPost(await fs.readFile(absolute, "utf8"), file);
      const locale = postLocale(file, data);
      return { file, subject: file.split("/")[0], title: data.title, date: data.date.slice(0, 10), draft: data.draft, featured: data.featured, locale, translationKey: data.translationKey || relativeSlug(file) };
    } catch (error) {
      return { file, subject: file.split("/")[0], title: file, date: "", draft: false, locale: "zh", error: error.message };
    }
  })));
  const keys = new Map();
  for (const post of posts) keys.set(post.translationKey, (keys.get(post.translationKey) || 0) + 1);
  for (const post of posts) post.translated = keys.get(post.translationKey) > 1;
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.file.localeCompare(b.file));
}

export async function vocabulary(contentDir) {
  const files = await markdownFiles(contentDir);
  const counts = { tags: new Map(), categories: new Map() };
  for (const absolute of files) {
    try {
      const { data } = readPost(await fs.readFile(absolute, "utf8"));
      for (const field of ["tags", "categories"]) for (const value of data[field]) counts[field].set(value, (counts[field].get(value) || 0) + 1);
    } catch {}
  }
  const ranked = (map) => [...map].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([value]) => value);
  const folders = (await fs.readdir(contentDir, { withFileTypes: true }).catch(() => [])).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const subjects = [...new Set([...Object.keys(subjectLabels), ...folders])].map((id) => ({ id, labels: Object.fromEntries(Object.keys(locales).map((locale) => [locale, subjectLabel(id, locale)])) }));
  return { subjects, tags: ranked(counts.tags), categories: ranked(counts.categories), locales: Object.keys(locales) };
}

export async function loadPost(contentDir, file) {
  const absolute = resolveContentPath(contentDir, file, { extensions: [".md"] });
  const source = await fs.readFile(absolute, "utf8").catch(() => { throw new EditorError(404, "Post not found"); });
  const post = readPost(source, file);
  const locale = postLocale(file, post.data);
  const link = translationLink(file, locale);
  const translationExists = await fs.access(resolveContentPath(contentDir, link.file)).then(() => true, () => false);
  return { file, ...post, locale, slug: relativeSlug(file), hash: hash(source), issues: validatePost(post.data, post.body), translation: { ...link, exists: translationExists } };
}

export async function savePost(contentDir, { file, data, body, autoSummary = false, baseHash, force = false }) {
  const absolute = resolveContentPath(contentDir, file, { extensions: [".md"] });
  const source = await fs.readFile(absolute, "utf8").catch(() => { throw new EditorError(404, "Post not found"); });
  if (!force && baseHash && hash(source) !== baseHash) throw new EditorError(409, "The file changed on disk", { currentHash: hash(source) });
  const output = composePost({ source, data, body, autoSummary });
  readPost(output, file);
  if (output !== source) await writeAtomic(absolute, output);
  const saved = readPost(output, file);
  return { hash: hash(output), data: saved.data, issues: validatePost(saved.data, saved.body), changed: output !== source };
}

export async function createPost(contentDir, { subject, title, slug, locale = "zh", templateFile, today = new Date().toISOString().slice(0, 10) }) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(String(subject || ""))) throw new EditorError(400, "Invalid subject folder");
  const finalSlug = String(slug || suggestSlug(title, today)).trim();
  if (!/^[a-z0-9][a-z0-9-]*$/.test(finalSlug)) throw new EditorError(400, "Slug may contain lowercase letters, numbers and hyphens");
  if (!String(title || "").trim()) throw new EditorError(400, "Title is required");
  if (!locales[locale]) throw new EditorError(400, "Unsupported language");
  const file = `${subject}/${finalSlug}/index.md`;
  const absolute = resolveContentPath(contentDir, file);
  if (await fs.access(path.dirname(absolute)).then(() => true, () => false)) throw new EditorError(409, "A post with this slug already exists");
  const template = templateFile ? await fs.readFile(templateFile, "utf8").catch(() => null) : null;
  const variables = { title: JSON.stringify(title), slug: finalSlug, date: today, summary: '""', tags: "[]", draft: "true" };
  // Custom placeholders in a user's template are left empty rather than failing the creation.
  const filled = template ? Object.fromEntries([...template.matchAll(/{{\s*([a-zA-Z][\w.-]*)\s*}}/g)].map(([, key]) => [key, variables[key] ?? ""])) : {};
  const seed = template ? renderTemplate(template, filled, templateFile) : `---\ntitle: ""\ndate: "${today}"\n---\n\n`;
  const { body } = readPost(seed, file);
  const output = composePost({ source: seed, body, data: { title, date: today, lang: locale, categories: [subjectLabel(subject, locale)], draft: true } });
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, output, { flag: "wx" });
  return { file };
}

export async function createTranslation(contentDir, file) {
  const original = await loadPost(contentDir, file);
  if (original.translation.exists) throw new EditorError(409, "Translation already exists", { file: original.translation.file });
  const posts = await listPosts(contentDir);
  const lastSegment = original.slug.split("/").at(-1);
  const taken = posts.some((post) => post.translationKey === lastSegment && relativeSlug(post.file) !== original.slug);
  const translationKey = original.data.translationKey || (taken ? original.slug : lastSegment);
  const target = original.translation;
  const subject = file.split("/")[0];
  const back = translationLink(target.file, target.locale);
  const output = composePost({
    source: `---\ntitle: ""\ndate: "${original.data.date}"\n---\n`,
    body: original.body,
    autoSummary: true,
    data: { title: original.data.title, date: original.data.date, lang: target.locale, translationKey, alternate: back.alternate, tags: [], categories: [subjectLabel(subject, target.locale)], draft: true },
  });
  const absolute = resolveContentPath(contentDir, target.file, { extensions: [".md"] });
  await fs.writeFile(absolute, output, { flag: "wx" });
  await savePost(contentDir, { file, data: { ...original.data, translationKey, alternate: target.alternate }, body: original.body, baseHash: original.hash });
  return { file: target.file };
}

export async function saveAsset(contentDir, file, name, contents) {
  const post = resolveContentPath(contentDir, file, { extensions: [".md"] });
  const extension = path.extname(String(name || "")).toLowerCase();
  if (!imageTypes[extension]) throw new EditorError(415, "Only images can be added");
  if (contents.length > 20 * 1024 * 1024) throw new EditorError(413, "Image is larger than 20 MB");
  const base = path.basename(String(name), path.extname(String(name || ""))).normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "image";
  let candidate = `${base}${extension}`;
  for (let index = 2; await fs.access(path.join(path.dirname(post), candidate)).then(() => true, () => false); index += 1) candidate = `${base}-${index}${extension}`;
  await writeAtomic(path.join(path.dirname(post), candidate), contents);
  return { name: candidate };
}
