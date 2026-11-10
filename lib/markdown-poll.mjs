import { createHash } from "node:crypto";

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

export function parsePollBody(body) {
  const lines = body.split("\n");
  const questionLines = [];
  const revealLines = [];
  let inReveal = false;
  let revealTitle = "答案与解析";

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const revealStart = line.match(/^\s*:::reveal(?:\s+(.+))?\s*$/);
    if (!inReveal && revealStart) {
      inReveal = true;
      if (revealStart[1]?.trim()) revealTitle = revealStart[1].trim();
      continue;
    }
    if (inReveal && line.match(/^\s*:::\s*$/)) {
      inReveal = false;
      continue;
    }
    if (inReveal) {
      revealLines.push(line);
    } else {
      questionLines.push(line);
    }
  }

  // Parse options from questionLines
  const optionRegex = /^\s*(?:[-*]\s*(?:\[([ xX])\]\s*)?|(\d+)[.)]\s*|[A-Z][.)]\s*)(.*)$/;
  const cleanQuestionLines = [];
  const options = [];
  let foundFirstOption = false;

  for (const line of questionLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (!foundFirstOption) cleanQuestionLines.push(line);
      continue;
    }
    const match = line.match(optionRegex);
    if (match) {
      foundFirstOption = true;
      const isCorrect = match[1] === "x" || match[1] === "X";
      options.push({
        text: match[3].trim(),
        isCorrect,
      });
    } else {
      if (foundFirstOption) {
        if (options.length > 0) options[options.length - 1].text += "\n" + line.trim();
      } else {
        cleanQuestionLines.push(line);
      }
    }
  }

  return {
    question: cleanQuestionLines.join("\n").trim(),
    options,
    reveal: revealLines.length ? revealLines.join("\n").trim() : null,
    revealTitle,
  };
}

export function renderPollHtml({ id, question, options, reveal, revealTitle }, md) {
  const renderedQuestion = md.render(question).trim();
  const renderedOptions = options.map((opt) => md.renderInline(opt.text).trim());
  const renderedReveal = reveal ? md.render(reveal).trim() : "";
  const correctIndex = options.findIndex((opt) => opt.isCorrect);

  const correctAttr = correctIndex >= 0 ? ` data-correct-index="${correctIndex}"` : "";

  return `<div class="freshmark-poll" data-poll-id="${escapeHtml(id)}" data-has-reveal="${Boolean(reveal)}"${correctAttr}>
<div class="poll-question">
${renderedQuestion}
</div>
<form class="poll-form" data-poll-id="${escapeHtml(id)}">
<div class="poll-options" role="radiogroup" aria-label="投票选项">
${options.map((opt, i) => `<label class="poll-option${opt.isCorrect ? " is-correct-answer" : ""}" data-option-index="${i}">
<input type="radio" name="poll-option-${escapeHtml(id)}" value="${i}">
<span class="poll-option-indicator" aria-hidden="true"></span>
<span class="poll-option-content">${renderedOptions[i]}</span>
<div class="poll-result-bar-wrapper" aria-hidden="true">
<div class="poll-result-bar" style="width: 0%"></div>
</div>
<span class="poll-result-stats" aria-hidden="true">
<span class="poll-result-percent">0%</span>
<span class="poll-result-votes"></span>
</span>
</label>`).join("\n")}
</div>
<div class="poll-actions">
<button type="submit" class="poll-submit-btn" disabled>投票</button>
<div class="poll-meta">
<span class="poll-status" aria-live="polite"></span>
<span class="poll-total-count">0 人参与</span>
</div>
</div>
</form>
${reveal ? `<div class="poll-reveal" hidden aria-hidden="true">
<div class="poll-reveal-header">
<span class="poll-reveal-icon" aria-hidden="true">💡</span>
<span class="poll-reveal-title">${escapeHtml(revealTitle)}</span>
</div>
<div class="poll-reveal-content prose">
${renderedReveal}
</div>
</div>` : ""}
</div>`;
}

export function renderPolls(markdown, md) {
  if (!markdown.includes(":::poll") && !markdown.includes("```poll")) return markdown;

  const lines = markdown.split("\n");
  const output = [];
  let inPoll = false;
  let inReveal = false;
  let isCodeFence = false;
  let pollId = "";
  let pollBodyLines = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (!inPoll) {
      const containerStart = line.match(/^\s*:::poll(?:\s+([\w\d_-]+))?\s*$/);
      const fenceStart = line.match(/^\s*```poll(?:\s+([\w\d_-]+))?\s*$/);

      if (containerStart || fenceStart) {
        inPoll = true;
        isCodeFence = Boolean(fenceStart);
        pollId = (containerStart ? containerStart[1] : fenceStart[1]) || "";
        pollBodyLines = [];
        inReveal = false;
        continue;
      }

      output.push(line);
      continue;
    }

    if (isCodeFence) {
      if (line.match(/^\s*```\s*$/)) {
        inPoll = false;
        const parsed = parsePollBody(pollBodyLines.join("\n"));
        if (parsed.options && parsed.options.length >= 2) {
          const id = pollId || `poll-${createHash("sha256").update(parsed.question + parsed.options.map((o) => o.text).join("|")).digest("hex").slice(0, 10)}`;
          output.push("", renderPollHtml({ id, ...parsed }, md), "");
        } else {
          output.push(`\`\`\`poll${pollId ? ` ${pollId}` : ""}`, ...pollBodyLines, "```");
        }
        continue;
      }
      pollBodyLines.push(line);
      continue;
    }

    const revealStart = line.match(/^\s*:::reveal(?:\s+(.+))?\s*$/);
    if (!inReveal && revealStart) {
      inReveal = true;
      pollBodyLines.push(line);
      continue;
    }

    if (inReveal && line.match(/^\s*:::\s*$/)) {
      inReveal = false;
      pollBodyLines.push(line);
      continue;
    }

    if (!inReveal && line.match(/^\s*:::\s*$/)) {
      inPoll = false;
      const parsed = parsePollBody(pollBodyLines.join("\n"));
      if (parsed.options && parsed.options.length >= 2) {
        const id = pollId || `poll-${createHash("sha256").update(parsed.question + parsed.options.map((o) => o.text).join("|")).digest("hex").slice(0, 10)}`;
        output.push("", renderPollHtml({ id, ...parsed }, md), "");
      } else {
        output.push(`:::poll${pollId ? ` ${pollId}` : ""}`, ...pollBodyLines, ":::");
      }
      continue;
    }

    pollBodyLines.push(line);
  }

  if (inPoll) {
    output.push((isCodeFence ? "```poll" : ":::poll") + (pollId ? ` ${pollId}` : ""), ...pollBodyLines);
  }

  return output.join("\n");
}
