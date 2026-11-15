let commentsRequest = 0;

export function abortComments() {
  commentsRequest += 1;
}

function commentDate(value) {
  try {
    return new Intl.DateTimeFormat(window.FRESHMARK?.language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function commentElement(comment) {
  const article = document.createElement("article");
  article.className = "comment";
  article.dataset.commentId = comment.id;
  const header = document.createElement("header");
  const author = document.createElement("strong");
  author.textContent = comment.name;
  const time = document.createElement("time");
  time.dateTime = comment.createdAt;
  time.textContent = commentDate(comment.createdAt);
  const body = document.createElement("div");
  body.className = "comment-body";
  if (typeof comment.bodyHtml === "string") body.innerHTML = comment.bodyHtml;
  else body.textContent = comment.body;
  header.append(author, time);
  article.append(header, body);
  return article;
}

function renderComments(section, payload, message, { prepend = false } = {}) {
  const list = section.querySelector("[data-comment-list]");
  const more = section.querySelector("[data-comments-more]");
  if (!list || !more) return;
  const elements = (payload.comments || []).map(commentElement);
  if (prepend) {
    const fragment = document.createDocumentFragment();
    fragment.append(...elements);
    list.prepend(fragment);
  } else if (elements.length) {
    list.replaceChildren(...elements);
  } else {
    const empty = document.createElement("p");
    empty.className = "comment-state";
    empty.textContent = message("commentsEmpty");
    list.replaceChildren(empty);
  }
  more.dataset.cursor = payload.nextCursor || "";
  more.hidden = !payload.nextCursor;
  more.disabled = false;
  more.textContent = message("loadOlderComments");
  const title = section.querySelector("[data-comments-title]");
  if (title) title.textContent = `${message("commentsTitle")} (${Number(payload.count) || 0})`;
}

export async function loadComments({ section, comments, message, cursor = "", prepend = false }) {
  if (!comments.enabled || !comments.listEndpoint || !section?.isConnected) return;
  const request = ++commentsRequest;
  const endpoint = new URL(comments.listEndpoint, location.origin);
  endpoint.searchParams.set("path", section.dataset.commentsPath);
  if (cursor) endpoint.searchParams.set("cursor", cursor);
  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      credentials: "same-origin",
      headers: { accept: "application/json" },
    });
    if (!response.ok) throw new Error("comments");
    const payload = await response.json();
    if (request !== commentsRequest || !section.isConnected) return;
    renderComments(section, payload, message, { prepend });
  } catch {
    if (request !== commentsRequest || !section.isConnected) return;
    const state = section.querySelector("[data-comment-state]");
    if (state) state.textContent = message("commentsFailed");
    const more = section.querySelector("[data-comments-more]");
    if (more) more.hidden = true;
  }
}

export async function submitComment({ form, comments, message }) {
  const section = form.closest("[data-comments]");
  const submit = form.querySelector("[data-comment-submit]");
  const status = form.querySelector("[data-comment-form-status]");
  if (!section || !submit || !status || !comments.submitEndpoint) return;
  const data = new FormData(form);
  submit.disabled = true;
  submit.textContent = message("submittingComment");
  status.textContent = "";
  try {
    const response = await fetch(comments.submitEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        path: section.dataset.commentsPath,
        name: data.get("name"),
        email: data.get("email"),
        body: data.get("body"),
        website: data.get("website"),
        a: comments.auth,
      }),
      cache: "no-store",
      credentials: "same-origin",
    });
    let result = {};
    try { result = await response.json(); } catch {}
    if (!form.isConnected) return;
    if (response.status === 429) throw Object.assign(new Error("rate_limited"), { code: "rate_limited" });
    if (!response.ok) throw Object.assign(new Error(result.error || "unavailable"), { code: result.error });
    if (!comments.auth) {
      try { localStorage.setItem("freshmark-comment-name", String(data.get("name") || "")); } catch {}
    }
    form.elements.body.value = "";
    form.elements.website.value = "";
    status.textContent = result.status === "published" ? message("commentPublished") : message("commentPending");
    if (result.status === "published") loadComments({ section, comments, message });
  } catch (error) {
    if (!form.isConnected) return;
    status.textContent = error?.code === "invalid"
      ? message("commentInvalid")
      : error?.code === "authentication_required"
        ? message("authRequired")
        : error?.code === "rate_limited"
          ? message("commentRateLimited")
          : message("commentSubmitFailed");
    if (error?.code === "authentication_required") {
      form.hidden = true;
      section.querySelector("[data-comment-auth]")?.dispatchEvent(new CustomEvent("freshmark-auth-expired"));
    }
  } finally {
    if (form.isConnected) {
      submit.disabled = false;
      submit.textContent = message("submitComment");
    }
  }
}
