#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { generateMarkdown, listTemplates, quoteYaml, renderTemplate, slugify, yamlList } from "../lib/templates.mjs";

const root = path.resolve(import.meta.dirname, "..");
const templatesDir = path.join(root, "templates");

function usage() {
  return `Create Markdown from a Freshmark template.

Usage:
  npm run new -- "Post title" [options]
  npm run new -- --title "Post title" [options]
  npm run new -- --list

Options:
  -t, --template <name>  Template in templates/ (default: post)
      --title <text>     Document title (or use the first positional value)
      --slug <slug>      Output slug (default: title converted to a slug)
  -o, --output <path>    Output file, relative to the project (default: content/posts/<slug>.md)
      --date <YYYY-MM-DD> Publication date (default: today)
      --summary <text>   Frontmatter summary
      --tags <a,b>       Comma-separated tags
      --set <key=value>  Set a custom template value; may be repeated
      --publish          Generate with draft: false (default: true)
      --dry-run          Print output without writing a file
  -f, --force            Replace an existing Markdown file
  -l, --list             List available templates
  -h, --help             Show this help`;
}

function takeValue(args, index, option) {
  const value = args[index + 1];
  if (!value || value.startsWith("-")) throw new Error(`${option} requires a value`);
  return value;
}

export function parseArgs(args) {
  const options = { template: "post", tags: [], set: {}, force: false, publish: false, dryRun: false, list: false, help: false };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "-h" || arg === "--help") options.help = true;
    else if (arg === "-l" || arg === "--list") options.list = true;
    else if (arg === "-f" || arg === "--force") options.force = true;
    else if (arg === "--publish") options.publish = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (["-t", "--template", "-o", "--output", "--title", "--slug", "--date", "--summary", "--tags", "--set"].includes(arg)) {
      const value = takeValue(args, index, arg);
      index += 1;
      if (arg === "-t" || arg === "--template") options.template = value;
      else if (arg === "-o" || arg === "--output") options.output = value;
      else if (arg === "--tags") options.tags = value.split(",").map((tag) => tag.trim()).filter(Boolean);
      else if (arg === "--set") {
        const separator = value.indexOf("=");
        if (separator < 1) throw new Error("--set must use key=value");
        options.set[value.slice(0, separator)] = value.slice(separator + 1);
      } else options[arg.slice(2)] = value;
    } else if (arg.startsWith("-")) throw new Error(`unknown option: ${arg}`);
    else positional.push(arg);
  }
  if (!options.title && positional.length) options.title = positional.join(" ");
  return options;
}

function safeName(value, label) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value)) throw new Error(`${label} may contain only letters, numbers, hyphens, and underscores`);
  return value;
}

export function resolveOutput(output, slug, projectRoot = root) {
  let relative = output || path.join("content", "posts", `${slug}.md`);
  if (!path.extname(relative)) relative += ".md";
  if (path.extname(relative).toLowerCase() !== ".md") throw new Error("output file must use the .md extension");
  const destination = path.resolve(projectRoot, relative);
  const relation = path.relative(projectRoot, destination);
  if (!relation || relation.startsWith("..") || path.isAbsolute(relation)) throw new Error("output path must stay inside the project");
  return destination;
}

export function templateVariables(options, today = new Date().toISOString().slice(0, 10)) {
  if (!options.title) throw new Error("a title is required");
  const slug = safeName(options.slug || slugify(options.title), "slug");
  return {
    ...options.set,
    title: quoteYaml(options.title),
    slug,
    date: options.date || today,
    summary: quoteYaml(options.summary || ""),
    tags: yamlList(options.tags),
    draft: String(!options.publish),
  };
}

export async function main(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  if (options.help) {
    console.log(usage());
    return;
  }
  if (options.list) {
    console.log((await listTemplates(templatesDir)).join("\n"));
    return;
  }
  const variables = templateVariables(options);
  const templateName = safeName(options.template, "template name");
  const template = path.join(templatesDir, `${templateName}.md`);
  await fs.access(template).catch(() => { throw new Error(`template not found: ${templateName} (use --list to see available templates)`); });
  const destination = resolveOutput(options.output, variables.slug);
  if (options.dryRun) {
    const source = await fs.readFile(template, "utf8");
    console.log(renderTemplate(source, variables, template).trimEnd());
    return;
  }
  await generateMarkdown({ template, destination, variables, force: options.force });
  console.log(`Created ${path.relative(root, destination)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  main().catch((error) => {
    if (error.code === "EEXIST") console.error("A post with that slug already exists. Choose --slug or use --force.");
    else console.error(error.message);
    process.exitCode = 1;
  });
}
