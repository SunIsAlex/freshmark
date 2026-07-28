import { parentPort } from "node:worker_threads";
import { minify as minifyHtml } from "html-minifier-terser";
import { renderMarkdown } from "../lib/markdown.mjs";

const htmlMinifierOptions = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: true,
  removeComments: false,
  removeRedundantAttributes: true,
  sortAttributes: true,
  sortClassName: true,
};

async function runTask(type, payload) {
  if (type === "render-markdown") {
    try {
      const { html, headings } = await renderMarkdown(payload.body);
      const { html: spaHtml, headings: spaHeadings } = await renderMarkdown(payload.body, { mathOutput: "source" });
      return { html, headings, spaHtml, spaHeadings };
    } catch (error) {
      error.message = `${payload.sourceFile}: ${error.message}`;
      throw error;
    }
  }
  if (type === "minify-html") return minifyHtml(payload.html, htmlMinifierOptions);
  throw new Error(`Unknown build worker task: ${type}`);
}

parentPort.on("message", async ({ id, type, payload }) => {
  try {
    parentPort.postMessage({ id, result: await runTask(type, payload) });
  } catch (error) {
    parentPort.postMessage({
      id,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "",
      },
    });
  }
});
