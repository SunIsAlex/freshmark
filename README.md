# Freshmark

Freshmark is a Markdown-first static blog generator. It has the
writing workflow of Hugo with a softer editorial design and built-in browser
search.

There is no application server, database, React runtime, or framework runtime.
The build produces ordinary HTML, CSS, JavaScript, XML, and JSON in `public/`.

## Requirements

- Node.js 20 or newer

Install the build dependencies with `npm install`.

## Start writing

```bash
npm install
npm run dev
```

The preview automatically rebuilds when a Markdown post or theme file changes.

## Create a post

Generate a new draft from the built-in post template:

```bash
npm run new -- "My first note"
```

The command writes `content/posts/my-first-note.md`. Add metadata while creating
it with options such as:

```bash
npm run new -- "My first note" --summary "A short description." --tags Design,Notes
```

Posts are drafts by default. Pass `--publish` to generate `draft: false`,
`--dry-run` to preview the result, or `--help` for all options. Existing files
are never overwritten unless `--force` is explicitly supplied.

Templates live in `templates/`. Add another `.md` file using placeholders such
as `{{title}}`, `{{slug}}`, `{{date}}`, `{{summary}}`, `{{tags}}`, and `{{draft}}`,
then select it with `--template name`. Custom placeholders can be supplied with
repeatable `--set key=value` arguments; the generator reports any missing value.

You can also create a post manually. Create `content/posts/my-first-note.md`:

```md
---
title: "My first note"
date: "2026-07-10"
summary: "A short description shown on the home page and in search."
tags: [Design, Notes]
featured: false
draft: false
---

Start writing here.

## A section heading

- Lists work.
- So do **bold text**, *italics*, links, images, quotes, and code fences.
```

The filename becomes the URL:

```text
content/posts/my-first-note.md → /posts/my-first-note/
```

Set `draft: true` to hide unfinished posts. Preview drafts with:

```bash
FRESHMARK_DRAFTS=true npm run dev
```

## Build the static site

```bash
npm run build
```

Upload the resulting `public/` directory to any static host, including GitHub
Pages, Cloudflare Pages, Netlify, Vercel, S3, or a basic web server. No Node.js
process is needed after the build.

## Configuration

Edit `site.config.mjs`:

```js
export default {
  title: "Freshmark",
  description: "Notes for curious people.",
  author: "Your Name",
  baseUrl: "https://example.com",
  basePath: "",
};
```

For a GitHub Pages project site such as `name.github.io/my-blog`, use:

```js
baseUrl: "https://name.github.io/my-blog",
basePath: "/my-blog",
```

## Project map

```text
content/posts/       Markdown articles
theme/styles.css     Visual design
lib/markdown.mjs     Shared server/browser Markdown pipeline
theme/app.js         SPA navigation, search, tags, and reading progress
site.config.mjs      Site title, URL, author, and path settings
scripts/build.mjs    Static generator
scripts/new.mjs      Markdown template generator
templates/           Reusable Markdown templates
public/              Portable generated website
```

## Features

- Shared `markdown-it` rendering on the server and in the browser
- Pre-generated article and about pages
- SPA article navigation using published raw Markdown
- Client-side full-text search from `search-index.json`
- Tags and filters
- Automatic table of contents and reading time
- Dark mode and reading progress
- RSS, sitemap, robots.txt, and 404 page
- Draft support and configurable base paths
- Raw Markdown downloads for every published article
- Installable PWA with versioned offline caching and app icons
