import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
  typographer: false,
});

markdown.disable("heading");

markdown.renderer.rules.image = (tokens, index) => markdown.utils.escapeHtml(tokens[index].content);

markdown.renderer.rules.link_open = (tokens, index, options, environment, renderer) => {
  const token = tokens[index];
  token.attrSet("target", "_blank");
  token.attrSet("rel", "nofollow ugc noopener noreferrer");
  return renderer.renderToken(tokens, index, options);
};

export function renderCommentMarkdown(source) {
  return markdown.render(String(source || ""));
}
