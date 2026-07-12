import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { generateMarkdown, renderTemplate, slugify, yamlList } from "../lib/templates.mjs";
import { parseArgs, templateVariables } from "../scripts/new.mjs";

test("template helpers create safe Markdown values", () => {
  assert.equal(slugify(" A Thoughtful Post! "), "a-thoughtful-post");
  assert.equal(yamlList(["Design", "Builder's notes"]), '["Design", "Builder\'s notes"]');
  assert.equal(renderTemplate("# {{ title }}\n{{body}}", { title: "Hello", body: "World" }), "# Hello\nWorld");
  assert.throws(() => renderTemplate("{{unknown}}", {}), /missing template value: unknown/);
});

test("CLI arguments produce draft-safe defaults and custom values", () => {
  const options = parseArgs(["A new post", "--tags", "Design, Notes", "--set", "kind=essay"]);
  assert.deepEqual(templateVariables(options, "2026-07-12"), {
    title: '"A new post"', slug: "a-new-post", date: "2026-07-12", summary: '""',
    tags: '["Design", "Notes"]', draft: "true", kind: "essay",
  });
  assert.equal(templateVariables(parseArgs(["Published", "--publish"]), "2026-07-12").draft, "false");
});

test("generator creates parent directories and refuses accidental overwrites", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "freshmark-template-"));
  const template = path.join(directory, "template.md");
  const destination = path.join(directory, "nested", "post.md");
  await fs.writeFile(template, "# {{title}}\n");
  await generateMarkdown({ template, destination, variables: { title: "First" } });
  assert.equal(await fs.readFile(destination, "utf8"), "# First\n");
  await assert.rejects(generateMarkdown({ template, destination, variables: { title: "Second" } }), { code: "EEXIST" });
  await generateMarkdown({ template, destination, variables: { title: "Second" }, force: true });
  assert.equal(await fs.readFile(destination, "utf8"), "# Second\n");
});
