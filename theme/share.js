let resetTimer;

async function copyUrl(url) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(url);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = url;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("copy failed");
}

function setStatus(button, message, key) {
  const label = button.querySelector("[data-share-label]");
  const status = button.parentElement?.querySelector("[data-share-status]");
  const text = message(key);
  if (label) label.textContent = text;
  if (status) status.textContent = text;
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    if (label?.isConnected) label.textContent = message("shareArticle");
    if (status?.isConnected) status.textContent = "";
  }, 2400);
}

export async function shareArticle(button, { message }) {
  if (button.disabled) return;
  const canonical = document.head.querySelector('link[rel="canonical"]')?.href || location.href;
  const payload = {
    title: button.dataset.shareTitle || document.title,
    text: button.dataset.shareText || "",
    url: canonical,
  };
  button.disabled = true;
  try {
    if (typeof navigator.share === "function" && (typeof navigator.canShare !== "function" || navigator.canShare(payload))) {
      await navigator.share(payload);
      return;
    }
    await copyUrl(canonical);
    setStatus(button, message, "shareCopied");
  } catch (error) {
    if (error?.name === "AbortError") return;
    try {
      await copyUrl(canonical);
      setStatus(button, message, "shareCopied");
    } catch {
      setStatus(button, message, "shareFailed");
    }
  } finally {
    button.disabled = false;
  }
}
