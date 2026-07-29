export function beginCommentVerification({ form, id, message }) {
  const compose = form.querySelector("[data-comment-compose]");
  const verification = form.querySelector("[data-comment-verification]");
  const status = form.querySelector("[data-comment-verification-status]");
  const code = form.elements["verification-code"];
  form.dataset.verificationId = id;
  if (compose) compose.hidden = true;
  if (verification) verification.hidden = false;
  if (status) status.textContent = message("commentVerificationSent");
  if (code) {
    code.value = "";
    code.required = true;
    code.focus();
  }
}

export async function verifyComment({ form, comments, message, loadComments }) {
  const section = form.closest("[data-comments]");
  const button = form.querySelector("[data-comment-verify]");
  const status = form.querySelector("[data-comment-verification-status]");
  const code = form.elements["verification-code"];
  const id = form.dataset.verificationId;
  if (!section || !button || !status || !code || !id || !comments.verifyEndpoint) return;
  if (!/^\d{6}$/.test(code.value.trim())) {
    status.textContent = message("commentCodeInvalid");
    code.focus();
    return;
  }
  button.disabled = true;
  button.textContent = message("verifyingComment");
  status.textContent = "";
  try {
    const response = await fetch(comments.verifyEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        path: section.dataset.commentsPath,
        id,
        code: code.value.trim(),
      }),
      cache: "no-store",
      credentials: "same-origin",
    });
    let result = {};
    try { result = await response.json(); } catch {}
    if (!form.isConnected) return;
    if (!response.ok) throw Object.assign(new Error(result.error || "unavailable"), { code: result.error });
    const compose = form.querySelector("[data-comment-compose]");
    const verification = form.querySelector("[data-comment-verification]");
    const composeStatus = form.querySelector("[data-comment-form-status]");
    code.required = false;
    form.reset();
    delete form.dataset.verificationId;
    if (verification) verification.hidden = true;
    if (compose) compose.hidden = false;
    try {
      const name = localStorage.getItem("freshmark-comment-name");
      if (name) form.elements.name.value = name;
    } catch {}
    if (composeStatus) {
      composeStatus.textContent = result.status === "published"
        ? message("commentPublished")
        : message("commentPending");
    }
    if (result.status === "published") loadComments(section);
  } catch (error) {
    if (!form.isConnected) return;
    status.textContent = error?.code === "invalid_code"
      ? message("commentCodeInvalid")
      : ["expired", "attempts_exceeded"].includes(error?.code)
        ? message("commentCodeExpired")
        : message("commentVerificationFailed");
    if (["expired", "attempts_exceeded"].includes(error?.code)) {
      const compose = form.querySelector("[data-comment-compose]");
      const verification = form.querySelector("[data-comment-verification]");
      const composeStatus = form.querySelector("[data-comment-form-status]");
      code.required = false;
      delete form.dataset.verificationId;
      if (verification) verification.hidden = true;
      if (compose) compose.hidden = false;
      if (composeStatus) composeStatus.textContent = message("commentCodeExpired");
    }
  } finally {
    if (form.isConnected) {
      button.disabled = false;
      button.textContent = message("verifyComment");
    }
  }
}
