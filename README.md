# Freshmark

Freshmark is a zero-dependency, Markdown-first static blog generator. It has the
writing workflow of Hugo with a softer editorial design and built-in browser
search.

There is no application server, database, React runtime, or framework runtime.
The build produces ordinary HTML, CSS, JavaScript, XML, and JSON in `public/`.

## Requirements

- Node.js 20 or newer

That is all. `npm install` has no packages to download.

## Start writing

```bash
npm install
npm run dev
```

The preview automatically rebuilds when a Markdown post or theme file changes.

## Create a post

Create `content/posts/my-first-note.md`:

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
theme/app.js         Search, tags, dark mode, reading progress
site.config.mjs      Site title, URL, author, and path settings
scripts/build.mjs    Static generator
public/              Portable generated website
```

## Features

- Build-time Markdown rendering
- Pre-generated article and about pages
- Client-side full-text search from `search-index.json`
- Tags and filters
- Automatic table of contents and reading time
- Dark mode and reading progress
- RSS, sitemap, robots.txt, and 404 page
- Draft support and configurable base paths
- No production dependencies
