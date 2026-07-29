# Freshmark

Freshmark is a Markdown-first static blog generator. It has the
writing workflow of Hugo with a softer editorial design and built-in browser
search.

By default there is no application server, database, React runtime, or
framework runtime. The build produces ordinary HTML, CSS, JavaScript, XML, and
JSON in `public/`. An optional Netlify Functions view counter can be enabled at
build time.

## Requirements

- Node.js 20.9 or newer

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

Choose an exact location and filename with `--output` (or `-o`). Paths are
relative to the project root, and the `.md` extension is added when omitted:

```bash
npm run new -- "My first note" --output content/posts/notes/custom-name.md
```

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

Add a visible caption to an image with standard Markdown image-title syntax:

```md
![A useful description](image.png "Caption shown below the image")
```

Captioned images render as semantic figures. The PhotoSwipe-powered gallery
opens when an article image is clicked or tapped; swipe or use the left and
right arrow keys to move between images. Pinch on a touchscreen to zoom and
drag the enlarged image to pan; on a computer, hold `Ctrl` while using the
mouse wheel to zoom around the pointer. Images animate from their position in
the article into the gallery, and swipe navigation keeps the neighboring image
visible while dragging.

During a production build, local PNG, JPEG, and WebP article images receive
intrinsic dimensions plus responsive AVIF and WebP variants. The article uses
the size best suited to the viewport, while the gallery continues to open the
original full-resolution image. Generated variants are cached in
`.freshmark-cache/` to keep later builds fast.

## Build the static site

```bash
npm run build
```

The build uses up to four worker threads for Markdown/KaTeX rendering and HTML
minification. Override the worker count with `FRESHMARK_WORKERS` when tuning for
the available CPU and memory:

```bash
# macOS or Linux
FRESHMARK_WORKERS=2 npm run build

# PowerShell
$env:FRESHMARK_WORKERS=2; npm run build
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

Set `FRESHMARK_BASE_URL` to override `baseUrl` for a specific build without
editing the config file. An unset or blank value falls back to
`site.config.mjs`:

```bash
FRESHMARK_BASE_URL=https://preview.example.com npm run build
```

### Optional Netlify view counts

Set `FRESHMARK_NETLIFY_FUNCTIONS=true` in Netlify and make it available to both
the Builds and Functions scopes. The next deploy will show a site-wide view
count in the footer and a per-article view count in article metadata:

```bash
FRESHMARK_NETLIFY_FUNCTIONS=true npm run build
```

`netlify.toml` already configures `public/` as the publish directory and
`netlify/functions/` as the Functions directory. Counts are stored persistently
in Netlify Blobs. The function uses strongly consistent reads and conditional
writes so concurrent visits do not overwrite one another.

The browser waits until after the first paint before sending the request. SPA
navigation is counted after the new page has rendered; slow or failed counter
requests never block page rendering or navigation. Leave the variable unset
(or set it to `false`) to omit the counter UI and client requests entirely.

## Project map

```text
content/posts/       Markdown articles
theme/styles.css     Visual design
lib/markdown.mjs     Build-time Markdown pipeline
lib/responsive-images.mjs  Responsive image generation
theme/app.js         SPA navigation, search, tags, and reading progress
site.config.mjs      Site title, URL, author, and path settings
scripts/build.mjs    Static generator
scripts/build-worker.mjs  Parallel rendering and minification worker
scripts/new.mjs      Markdown template generator
templates/           Reusable Markdown templates
netlify/functions/   Optional view-count backend
netlify.toml          Netlify build and Functions configuration
public/              Portable generated website
```

## Features

- Build-time `markdown-it` rendering with client-side KaTeX enhancement
- Pre-generated article and about pages
- SPA article navigation using pre-rendered HTML fragments
- Client-side full-text search from `search-index.json`
- Tags and filters
- Automatic table of contents and reading time
- Dark mode and reading progress
- Responsive AVIF/WebP images, captions, and a PhotoSwipe keyboard/touch-friendly gallery
- RSS, sitemap, robots.txt, and 404 page
- Draft support and configurable base paths
- Raw Markdown downloads for every published article
- Installable PWA with versioned offline caching and app icons
- Optional non-blocking Netlify Functions site/article view counts
