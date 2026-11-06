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
  const directories = new Set();
  for (const absolute of files) for (let directory = path.dirname(toRelative(contentDir, absolute)); directory && directory !== "."; directory = path.posix.dirname(directory)) directories.add(directory);
  return { subjects, folders: [...directories].sort(), tags: ranked(counts.tags), categories: ranked(counts.categories), locales: Object.keys(locales) };
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

// One path segment of a post location: anything a file system and a URL can both carry.
const segmentPattern = /^[^./\\<>:"|?*\s\u0000-\u001f][^/\\<>:"|?*\u0000-\u001f]{0,119}$/;
const validSegment = (value) => segmentPattern.test(value) && !/[.\s]$/.test(value);
const isBundleFile = (name) => /^index(\.[a-z]{2})?\.md$/.test(name);
const exists = (absolute) => fs.access(absolute).then(() => true, () => false);

export function normalizePostPath(value) {
  const parts = String(value || "").replaceAll("\\", "/").trim().replace(/^\/+|\/+$/g, "").split("/").map((part) => part.trim());
  if (parts.length < 2 || !parts.every(validSegment)) throw new EditorError(400, "Use a path like subject/folder/index.md; names cannot start with a dot or contain \\ : * ? \" < > |");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(parts[0])) throw new EditorError(400, "The first folder must be a subject such as math or physics");
  if (!parts.at(-1).endsWith(".md")) throw new EditorError(400, "The file name must end with .md");
  return parts.join("/");
}

export async function createPost(contentDir, { subject, folder, title, slug, filename = "index.md", locale = "zh", tags = [], templateFile, today = new Date().toISOString().slice(0, 10) }) {
  if (!String(title || "").trim()) throw new EditorError(400, "Title is required");
  if (!locales[locale]) throw new EditorError(400, "Unsupported language");
  const location = String(folder ?? subject ?? "").trim().replace(/^\/+|\/+$/g, "");
  const finalSlug = String(slug ?? suggestSlug(title, today)).trim();
  if (!finalSlug && isBundleFile(String(filename).trim())) throw new EditorError(400, "Give the post a slug, or a file name other than index.md");
  const file = normalizePostPath([location, finalSlug, String(filename || "index.md").trim()].filter(Boolean).join("/"));
  const absolute = resolveContentPath(contentDir, file, { extensions: [".md"] });
  if (await exists(absolute)) throw new EditorError(409, "A post already exists at this path");
  const template = templateFile ? await fs.readFile(templateFile, "utf8").catch(() => null) : null;
  const variables = { title: JSON.stringify(title), slug: finalSlug, date: today, summary: '""', tags: "[]", draft: "true" };
  // Custom placeholders in a user's template are left empty rather than failing the creation.
  const filled = template ? Object.fromEntries([...template.matchAll(/{{\s*([a-zA-Z][\w.-]*)\s*}}/g)].map(([, key]) => [key, variables[key] ?? ""])) : {};
  const seed = template ? renderTemplate(template, filled, templateFile) : `---\ntitle: ""\ndate: "${today}"\n---\n\n`;
  const { body } = readPost(seed, file);
  const cleanTags = [...new Set((Array.isArray(tags) ? tags : []).map((tag) => String(tag).trim()).filter(Boolean))];
  const output = composePost({ source: seed, body, data: { title, date: today, lang: locale, categories: [subjectLabel(file.split("/")[0], locale)], tags: cleanTags, draft: true } });
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, output, { flag: "wx" });
  return { file };
}

// Moves or renames a post. An index.md post takes its whole folder along (images, translations);
// any other file is moved on its own. Stored `alternate` links are rewritten to the new URL.
export async function movePost(contentDir, { file, to }) {
  const source = resolveContentPath(contentDir, file, { extensions: [".md"] });
  if (!(await exists(source))) throw new EditorError(404, "Post not found");
  const target = normalizePostPath(to);
  const targetAbsolute = resolveContentPath(contentDir, target, { extensions: [".md"] });
  if (target === file) return { file, moved: [] };
  const sourceDir = path.dirname(source);
  const targetDir = path.dirname(targetAbsolute);
  let moved;
  if (isBundleFile(path.basename(source)) && sourceDir !== targetDir) {
    const inside = path.relative(sourceDir, targetDir);
    if (!inside.startsWith("..") && !path.isAbsolute(inside)) throw new EditorError(400, "A folder cannot be moved into itself");
    if (await exists(targetDir)) throw new EditorError(409, "That folder already exists; pick a new folder name so the post's images can move with it");
    const all = await markdownFiles(sourceDir);
    if (all.some((absolute) => path.dirname(absolute) !== sourceDir)) throw new EditorError(409, "This folder also contains other posts; move them separately");
    const own = all.map((absolute) => path.basename(absolute));
    const renamed = path.basename(targetAbsolute);
    if (renamed !== path.basename(source) && own.includes(renamed)) throw new EditorError(409, "A file with that name already exists in the folder");
    await fs.mkdir(path.dirname(targetDir), { recursive: true });
    await fs.rename(sourceDir, targetDir);
    moved = own.map((name) => [path.join(sourceDir, name), path.join(targetDir, name)]);
    if (renamed !== path.basename(source)) {
      await fs.rename(path.join(targetDir, path.basename(source)), targetAbsolute);
      moved = moved.map(([from, into]) => [from, from === source ? targetAbsolute : into]);
    }
  } else {
    if (await exists(targetAbsolute)) throw new EditorError(409, "A file already exists at this path");
    await fs.mkdir(targetDir, { recursive: true });
    await fs.rename(source, targetAbsolute);
    moved = [[source, targetAbsolute]];
  }
  moved = moved.map(([from, into]) => [toRelative(contentDir, from), toRelative(contentDir, into)]);
  for (const [, relative] of moved) {
    const absolute = resolveContentPath(contentDir, relative);
    const text = await fs.readFile(absolute, "utf8");
    const post = readPost(text, relative);
    if (!post.data.alternate) continue;
    const alternate = translationLink(relative, postLocale(relative, post.data)).alternate;
    if (alternate !== post.data.alternate) await writeAtomic(absolute, composePost({ source: text, body: post.body, data: { ...post.data, alternate } }));
  }
  return { file: target, moved };
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
