import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const pipelineVersion = "freshmark-responsive-v1";
const rasterExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const targetWidths = [480, 960, 1440];
const formats = [
  { extension: "avif", mime: "image/avif", options: { quality: 62, effort: 1, chromaSubsampling: "4:4:4" } },
  { extension: "webp", mime: "image/webp", options: { quality: 86, effort: 3, smartSubsample: true } },
];

function createLimiter(limit) {
  const queue = [];
  let active = 0;
  const drain = () => {
    while (active < limit && queue.length) {
      active += 1;
      const { task, resolve, reject } = queue.shift();
      Promise.resolve().then(task).then(resolve, reject).finally(() => {
        active -= 1;
        drain();
      });
    }
  };
  return (task) => new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    drain();
  });
}

function attributeValue(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? match[1] ?? match[2] ?? match[3] : "";
}

function setAttribute(tag, name, value) {
  const pattern = new RegExp(`\\s${name}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+))?`, "i");
  const cleaned = tag.replace(pattern, "");
  const escaped = String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  return cleaned.replace(/\s*\/?>$/, (ending) => ` ${name}="${escaped}"${ending.includes("/") ? " />" : ">"}`);
}

function localImagePath(src, sourceFile, contentDirectory) {
  if (!src || /^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#)/i.test(src)) return null;
  const pathname = src.split(/[?#]/, 1)[0].replaceAll("&amp;", "&");
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (!rasterExtensions.has(path.extname(decoded).toLowerCase())) return null;
  const sourceDirectory = path.dirname(path.join(contentDirectory, sourceFile));
  const absolutePath = path.resolve(sourceDirectory, decoded);
  const relativeToContent = path.relative(contentDirectory, absolutePath);
  if (relativeToContent.startsWith("..") || path.isAbsolute(relativeToContent)) return null;
  return { absolutePath, decoded, sourceDirectory };
}

function encodedRelativeUrl(value) {
  return value.split("/").map((segment) => ["", ".", ".."].includes(segment) ? segment : encodeURIComponent(segment)).join("/");
}

function imageDimensions(metadata) {
  const rotated = [5, 6, 7, 8].includes(metadata.orientation);
  return {
    width: rotated ? metadata.height : metadata.width,
    height: rotated ? metadata.width : metadata.height,
  };
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export async function enhanceResponsiveImages(posts, {
  contentDirectory,
  outputDirectory,
  cacheDirectory,
  articleOutputDirectory,
  concurrency = 4,
} = {}) {
  const limit = createLimiter(Math.max(1, concurrency));
  const imageCache = new Map();
  const variantJobs = new Map();
  await fs.mkdir(cacheDirectory, { recursive: true });

  const ensureVariant = (cacheFile, task) => {
    if (!variantJobs.has(cacheFile)) {
      variantJobs.set(cacheFile, limit(async () => {
        if (!await exists(cacheFile)) await task();
      }));
    }
    return variantJobs.get(cacheFile);
  };

  const inspectImage = (source) => {
    if (!imageCache.has(source.absolutePath)) {
      imageCache.set(source.absolutePath, (async () => {
        const input = await fs.readFile(source.absolutePath);
        const metadata = await sharp(input).metadata();
        const dimensions = imageDimensions(metadata);
        if (!dimensions.width || !dimensions.height) return null;
        const hash = createHash("sha256").update(pipelineVersion).update(input).digest("hex").slice(0, 12);
        const maximumWidth = Math.min(dimensions.width, targetWidths.at(-1));
        const widths = maximumWidth >= 320
          ? [...new Set([...targetWidths.filter((width) => width < maximumWidth), maximumWidth])]
          : [];
        const variants = [];
        if (!(metadata.pages > 1)) {
          for (const format of formats) {
            for (const width of widths) {
              const cacheFile = path.join(cacheDirectory, `${hash}-${width}.${format.extension}`);
              if (!await exists(cacheFile)) {
                await ensureVariant(cacheFile, async () => {
                  const image = sharp(input).rotate().resize({ width, withoutEnlargement: true });
                  await image[format.extension](format.options).toFile(cacheFile);
                });
              }
              variants.push({ ...format, width, cacheFile });
            }
          }
        }
        return { ...dimensions, hash, variants };
      })());
    }
    return imageCache.get(source.absolutePath);
  };

  const enhancePost = async (post) => {
    const imageTags = [...post.html.matchAll(/<img\b[^>]*>/gi)];
    if (!imageTags.length) return;
    let html = "";
    let cursor = 0;
    for (const match of imageTags) {
      html += post.html.slice(cursor, match.index);
      cursor = match.index + match[0].length;
      const tag = match[0];
      const src = attributeValue(tag, "src");
      const source = localImagePath(src, post.sourceFile, contentDirectory);
      if (!source) {
        html += tag;
        continue;
      }
      let image;
      try {
        image = await inspectImage(source);
      } catch (error) {
        throw new Error(`${post.sourceFile}: could not process image ${src}: ${error.message}`, { cause: error });
      }
      if (!image) {
        html += tag;
        continue;
      }

      let responsiveTag = setAttribute(tag, "width", image.width);
      responsiveTag = setAttribute(responsiveTag, "height", image.height);
      responsiveTag = setAttribute(responsiveTag, "data-gallery-src", src);
      responsiveTag = setAttribute(responsiveTag, "data-gallery-width", image.width);
      responsiveTag = setAttribute(responsiveTag, "data-gallery-height", image.height);
      if (!image.variants.length) {
        html += responsiveTag;
        continue;
      }

      const parsed = path.posix.parse(source.decoded.replaceAll("\\", "/"));
      const articleDirectory = articleOutputDirectory(post);
      const sources = [];
      for (const format of formats) {
        const candidates = [];
        for (const variant of image.variants.filter((item) => item.extension === format.extension)) {
          const filename = `${parsed.name}.freshmark-${image.hash}-${variant.width}w.${format.extension}`;
          const relativePath = path.posix.join(parsed.dir, filename);
          const destination = path.resolve(articleDirectory, relativePath);
          const relativeToOutput = path.relative(outputDirectory, destination);
          if (relativeToOutput.startsWith("..") || path.isAbsolute(relativeToOutput)) {
            throw new Error(`${post.sourceFile}: responsive image output escapes public directory: ${relativePath}`);
          }
          await fs.mkdir(path.dirname(destination), { recursive: true });
          await fs.copyFile(variant.cacheFile, destination);
          candidates.push(`${encodedRelativeUrl(relativePath)} ${variant.width}w`);
        }
        if (candidates.length) sources.push(`<source type="${format.mime}" srcset="${candidates.join(", ")}">`);
      }
      responsiveTag = setAttribute(responsiveTag, "sizes", "(max-width: 820px) calc(100vw - 32px), 720px");
      html += `<picture class="responsive-picture">${sources.join("")}${responsiveTag}</picture>`;
    }
    post.html = html + post.html.slice(cursor);
  };

  await Promise.all(posts.map(enhancePost));
}
