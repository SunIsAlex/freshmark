export async function submitComment({ form, comments, message, loadComments }) {
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
    if (result.status === "published") loadComments(section);
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
