import { promises as fs } from "node:fs";
import path from "node:path";

const placeholderPattern = /{{\s*([a-zA-Z][\w.-]*)\s*}}/g;

export function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function quoteYaml(value) {
  return JSON.stringify(String(value));
}

export function yamlList(values = []) {
  return `[${values.map(quoteYaml).join(", ")}]`;
}

export function renderTemplate(source, variables, file = "Markdown template") {
  const missing = new Set();
  const rendered = source.replace(placeholderPattern, (_, key) => {
    if (!Object.hasOwn(variables, key)) {
      missing.add(key);
      return "";
    }
    return String(variables[key]);
  });
  if (missing.size) throw new Error(`${file}: missing template value${missing.size === 1 ? "" : "s"}: ${[...missing].join(", ")}`);
  return rendered;
}

export async function listTemplates(templatesDir) {
  const entries = await fs.readdir(templatesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name.slice(0, -3))
    .sort();
}

export async function generateMarkdown({ template, destination, variables, force = false }) {
  const source = await fs.readFile(template, "utf8");
  const output = `${renderTemplate(source, variables, template).trimEnd()}\n`;
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, output, { encoding: "utf8", flag: force ? "w" : "wx" });
  return output;
}
