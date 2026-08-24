import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { availableParallelism } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const defaultPdfWorkers = Math.max(1, Math.min(4, availableParallelism() - 1));

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const positiveInteger = (value, fallback, name) => {
  if (value === undefined || value === "") return fallback;
  const number = Number.parseInt(value, 10);
  if (!Number.isInteger(number) || number < 1) throw new Error(`${name} must be a positive integer`);
  return number;
};

const probeCommand = async (command, args) => {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, { timeout: 15_000 });
    return `${stdout}${stderr}`.trim();
  } catch {
    return null;
  }
};

const insideRoot = (root, file) => {
  const relative = path.relative(root, file);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
};

export async function findPdfRenderer({ root, environment = process.env } = {}) {
  const configured = environment.FRESHMARK_WEASYPRINT?.trim();
  const identity = (file) => file;
  const chrootPath = (file) => insideRoot(root, file)
    ? path.posix.join("/workspace/freshmark", path.relative(root, file).split(path.sep).join("/"))
    : file;
  const candidates = configured
    ? [{ command: configured, args: [], probe: ["--version"], mapPath: identity, batch: false, extraCss: "" }]
    : [
        { command: "python3", args: [path.join(root, "scripts", "render-pdfs.py")], probe: ["-c", "import weasyprint; print(weasyprint.__version__)"], mapPath: identity, batch: true, extraCss: "" },
        { command: "weasyprint", args: [], probe: ["--version"], mapPath: identity, batch: false, extraCss: "" },
        {
          command: "ubuntu-chroot",
          args: ["--exec-root", "/usr/bin/python3", "/workspace/freshmark/scripts/render-pdfs.py"],
          probe: ["--exec-root", "/usr/bin/python3", "-c", "import weasyprint; print(weasyprint.__version__)"],
          mapPath: chrootPath,
          batch: true,
          extraCss: '@font-face{font-family:"Freshmark CJK";src:url("file:///proc/1/root/system/fonts/NotoSansCJK-Regular.ttc") format("truetype")}',
        },
      ];
  for (const candidate of candidates) {
    const version = await probeCommand(candidate.command, candidate.probe);
    if (version !== null) return { ...candidate, version };
  }
  const configuredHint = configured ? ` at FRESHMARK_WEASYPRINT=${configured}` : "";
  throw new Error(`WeasyPrint was not found${configuredHint}. Install it, or set FRESHMARK_WEASYPRINT to its executable path.`);
}

const fileUrl = (renderer, file) => pathToFileURL(renderer.mapPath(path.resolve(file))).href;

export function pdfDocument({ post, articleHtml, summaryHtml, dateLabel, sectionLabel, baseUrl, katexCssUrl, pdfCssUrl, rendererCss = "" }) {
  const tags = post.tags.length ? post.tags.join(" · ") : "";
  const metadata = [dateLabel, tags].filter(Boolean).map((value) => `<span>${escapeHtml(value)}</span>`).join("");
  return `<!doctype html><html lang="${escapeHtml(post.locale === "zh" ? "zh-CN" : post.locale)}"><head><meta charset="utf-8"><base href="${escapeHtml(baseUrl)}"><title>${escapeHtml(post.title)}</title><link rel="stylesheet" href="${escapeHtml(katexCssUrl)}"><link rel="stylesheet" href="${escapeHtml(pdfCssUrl)}">${rendererCss ? `<style>${rendererCss}</style>` : ""}</head><body><span class="pdf-section">${escapeHtml(sectionLabel)}</span><main><header class="article-header"><h1>${escapeHtml(post.title)}</h1><p class="article-dek">${summaryHtml}</p><div class="article-meta">${metadata}</div></header><article class="prose">${articleHtml}</article></main></body></html>`;
}

async function validPdf(file) {
  let descriptor;
  try {
    descriptor = await fs.open(file, "r");
    const header = Buffer.alloc(5);
    const { bytesRead } = await descriptor.read(header, 0, header.length, 0);
    return bytesRead === header.length && header.toString("ascii") === "%PDF-";
  } catch {
    return false;
  } finally {
    await descriptor?.close();
  }
}

async function materializePdf(source, output) {
  const temporaryOutput = `${output}.${process.pid}.tmp`;
  try {
    await fs.copyFile(source, temporaryOutput);
    await fs.rename(temporaryOutput, output);
  } finally {
    await fs.rm(temporaryOutput, { force: true });
  }
}

async function directoryDigest(directory) {
  const hash = createHash("sha256");
  const visit = async (relative = "") => {
    const entries = await fs.readdir(path.join(directory, relative), { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const entryPath = path.join(relative, entry.name);
      if (entry.isDirectory()) await visit(entryPath);
      else if (entry.isFile()) {
        hash.update(entryPath.split(path.sep).join("/"));
        hash.update("\0");
        hash.update(await fs.readFile(path.join(directory, entryPath)));
        hash.update("\0");
      }
    }
  };
  await visit();
  return hash.digest("hex");
}

async function referencedAssetDigest(directory, html, contentDirectory) {
  const references = new Set();
  const addReference = (rawValue) => {
    const value = rawValue.replaceAll("&amp;", "&").trim();
    if (!value || value.startsWith("#") || value.startsWith("/") || /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(value) || /^data:/i.test(value)) return;
    const withoutQuery = value.split(/[?#]/, 1)[0];
    try {
      const target = path.resolve(directory, decodeURIComponent(withoutQuery));
      if (insideRoot(contentDirectory, target)) references.add(target);
    } catch {
      // A malformed URL cannot resolve to a local resource, but its text remains in articleHtml.
    }
  };
  for (const match of html.matchAll(/\b(?:src|poster)\s*=\s*(?:"|\x27)([^"\x27]+)(?:"|\x27)/gi)) addReference(match[1]);
  for (const match of html.matchAll(/\bsrcset\s*=\s*(?:"|\x27)([^"\x27]+)(?:"|\x27)/gi)) {
    for (const candidate of match[1].split(",")) addReference(candidate.trim().split(/\s+/, 1)[0]);
  }
  for (const match of html.matchAll(/\burl\(\s*(?:"|\x27)?([^"\x27)]+)(?:"|\x27)?\s*\)/gi)) addReference(match[1]);

  const hash = createHash("sha256");
  for (const target of [...references].sort()) {
    hash.update(path.relative(contentDirectory, target).split(path.sep).join("/"));
    hash.update("\0");
    try {
      const metadata = await fs.stat(target);
      if (metadata.isFile()) hash.update(await fs.readFile(target));
      else hash.update("not-a-file");
    } catch {
      hash.update("missing");
    }
    hash.update("\0");
  }
  return hash.digest("hex");
}

function pdfCacheKey({ post, articleHtml, summaryHtml, dateLabel, sectionLabel, renderer, stylesheetDigest, assetDigest }) {
  const hash = createHash("sha256");
  hash.update("freshmark-pdf-v3\0");
  for (const value of [
    renderer.version,
    renderer.extraCss,
    stylesheetDigest,
    assetDigest,
    post.locale,
    post.title,
    dateLabel,
    sectionLabel,
    JSON.stringify(post.tags),
    articleHtml,
    summaryHtml,
  ]) {
    hash.update(String(value));
    hash.update("\0");
  }
  return hash.digest("hex");
}

async function renderPdf(renderer, input, output) {
  await execFileAsync(renderer.command, [...renderer.args, "--quiet", renderer.mapPath(input), renderer.mapPath(output)], { maxBuffer: 2 * 1024 * 1024 });
}

async function renderPdfBatch(renderer, documents, manifest) {
  await fs.writeFile(manifest, JSON.stringify(documents.map(({ input, output, sourceFile }) => ({
    input: renderer.mapPath(input),
    output: renderer.mapPath(output),
    sourceFile,
  }))));
  await execFileAsync(renderer.command, [...renderer.args, renderer.mapPath(manifest)], { maxBuffer: 2 * 1024 * 1024 });
}

export async function buildPostPdfs(posts, {
  root,
  contentDirectory,
  outputDirectory,
  cacheDirectory,
  katexStylesheet,
  pdfStylesheet,
  fontDirectory,
  articleOutputDirectory,
  sourceDirectory,
  renderSummary,
  formatDate,
  sectionLabel,
  environment = process.env,
} = {}) {
  if (!posts.length) return { rendered: 0, reused: 0 };
  const renderer = await findPdfRenderer({ root, environment });
  const concurrency = positiveInteger(environment.FRESHMARK_PDF_WORKERS, defaultPdfWorkers, "FRESHMARK_PDF_WORKERS");
  const temporaryFiles = [];
  const stylesheetHash = createHash("sha256");
  stylesheetHash.update(await fs.readFile(katexStylesheet));
  stylesheetHash.update(await fs.readFile(pdfStylesheet));
  stylesheetHash.update(await directoryDigest(fontDirectory));
  const stylesheetDigest = stylesheetHash.digest("hex");
  await fs.mkdir(cacheDirectory, { recursive: true });

  const documents = await Promise.all(posts.map(async (post, index) => {
    const articleDirectory = articleOutputDirectory(post);
    const output = path.join(articleDirectory, "index.pdf");
    const summaryHtml = await renderSummary(post.summary, { mathOutput: "html" });
    const dateLabel = formatDate(post.locale, post.date);
    const resolvedSectionLabel = sectionLabel(post);
    const cacheKey = pdfCacheKey({
      post,
      articleHtml: post.pdfHtml,
      summaryHtml,
      dateLabel,
      sectionLabel: resolvedSectionLabel,
      renderer,
      stylesheetDigest,
      assetDigest: await referencedAssetDigest(sourceDirectory(post), post.pdfHtml, contentDirectory),
    });
    const cached = path.join(cacheDirectory, `${cacheKey}.pdf`);
    await fs.mkdir(articleDirectory, { recursive: true });
    if (await validPdf(cached)) {
      await materializePdf(cached, output);
      return { output, sourceFile: post.sourceFile, cached: true };
    }
    const input = path.join(outputDirectory, `.freshmark-pdf-${process.pid}-${index}.html`);
    const renderedOutput = `${output}.${process.pid}.rendering`;
    temporaryFiles.push(input, renderedOutput);
    await fs.writeFile(input, pdfDocument({
      post,
      articleHtml: post.pdfHtml,
      summaryHtml,
      dateLabel,
      sectionLabel: resolvedSectionLabel,
      baseUrl: `${fileUrl(renderer, articleDirectory)}/`,
      katexCssUrl: fileUrl(renderer, katexStylesheet),
      pdfCssUrl: fileUrl(renderer, pdfStylesheet),
      rendererCss: renderer.extraCss,
    }));
    return { input, output: renderedOutput, finalOutput: output, cached: false, cacheFile: cached, sourceFile: post.sourceFile };
  }));
  const pending = documents.filter((document) => !document.cached);
  try {
    if (renderer.batch && pending.length) {
      const batches = Array.from({ length: Math.min(concurrency, pending.length) }, () => []);
      pending.forEach((document, index) => batches[index % batches.length].push(document));
      await Promise.all(batches.map(async (batch, index) => {
        const manifest = path.join(outputDirectory, `.freshmark-pdf-${process.pid}-${index}.json`);
        temporaryFiles.push(manifest);
        await renderPdfBatch(renderer, batch, manifest);
      }));
    } else if (pending.length) {
      const queue = [...pending];
      const worker = async () => {
        while (queue.length) {
          const document = queue.shift();
          await renderPdf(renderer, document.input, document.output);
        }
      };
      await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, worker));
    }
    for (const document of pending) {
      if (!await validPdf(document.output)) throw new Error(`${document.sourceFile}: renderer did not produce a valid PDF file`);
      const temporaryCache = `${document.cacheFile}.${process.pid}.tmp`;
      temporaryFiles.push(temporaryCache);
      await fs.copyFile(document.output, temporaryCache);
      await fs.rename(temporaryCache, document.cacheFile);
      await materializePdf(document.cacheFile, document.finalOutput);
    }
  } catch (error) {
    throw new Error(`PDF rendering failed: ${error.message}`, { cause: error });
  } finally {
    await Promise.all(temporaryFiles.map((file) => fs.rm(file, { force: true })));
  }
  const result = { rendered: pending.length, reused: documents.length - pending.length };
  console.log(`Freshmark PDFs: rendered ${result.rendered}, reused ${result.reused} from cache.`);
  return result;
}
