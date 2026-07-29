const jsonRequest = async (url, body) => {
  const response = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: { accept: "application/json", ...(body === undefined ? {} : { "content-type": "application/json" }) },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    credentials: "same-origin",
  });
  let result = {};
  try { result = await response.json(); } catch {}
  if (!response.ok) throw Object.assign(new Error(result.error || "unavailable"), {
    code: result.error || "unavailable",
    status: response.status,
  });
  return result;
};

const errorMessage = (error, message) => {
  if (error?.code === "invalid_credentials") return message("authInvalidCredentials");
  if (error?.code === "account_exists") return message("authAccountExists");
  if (error?.code === "invalid_code") return message("authCodeInvalid");
  if (error?.code === "expired") return message("authCodeExpired");
  if (error?.code === "attempts_exceeded" || error?.status === 429) return message("authRateLimited");
  if (error?.code === "invalid") return message("authInvalid");
  return message("authUnavailable");
};

export async function prepareCommentAuth({ section, comments, message }) {
  const panel = section.querySelector("[data-comment-auth]");
  const loading = panel?.querySelector("[data-auth-loading]");
  const guest = panel?.querySelector("[data-auth-guest]");
  const verify = panel?.querySelector("[data-auth-verify]");
  const userPanel = panel?.querySelector("[data-auth-user]");
  const compose = section.querySelector("[data-comment-form]");
  if (!panel || !guest || !verify || !userPanel || !compose || !comments.authEndpoints) return;
  let registrationId = "";

  const showGuest = () => {
    if (loading) loading.hidden = true;
    guest.hidden = false;
    verify.hidden = true;
    userPanel.hidden = true;
    compose.hidden = true;
  };
  const showUser = (user) => {
    if (loading) loading.hidden = true;
    guest.hidden = true;
    verify.hidden = true;
    userPanel.hidden = false;
    compose.hidden = false;
    userPanel.querySelector("[data-auth-user-name]").textContent = user.name;
    userPanel.querySelector("[data-auth-user-email]").textContent = `(${user.email})`;
  };

  panel.addEventListener("freshmark-auth-expired", showGuest);
  panel.querySelector("[data-auth-login]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector("[data-auth-login-status]");
    const button = form.querySelector("button[type='submit']");
    const data = new FormData(form);
    button.disabled = true;
    status.textContent = message("authLoggingIn");
    try {
      const result = await jsonRequest(comments.authEndpoints.login, {
        email: data.get("email"),
        password: data.get("password"),
      });
      form.reset();
      showUser(result.user);
    } catch (error) {
      status.textContent = errorMessage(error, message);
    } finally {
      button.disabled = false;
    }
  });

  panel.querySelector("[data-auth-register]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector("[data-auth-register-status]");
    const button = form.querySelector("button[type='submit']");
    const data = new FormData(form);
    button.disabled = true;
    status.textContent = message("authRegistering");
    try {
      const result = await jsonRequest(comments.authEndpoints.register, {
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password"),
        locale: window.FRESHMARK?.locale,
      });
      form.elements.password.value = "";
      registrationId = result.registration.id;
      guest.hidden = true;
      verify.hidden = false;
      verify.querySelector("input").focus();
    } catch (error) {
      status.textContent = errorMessage(error, message);
    } finally {
      button.disabled = false;
    }
  });

  verify.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = verify.querySelector("[data-auth-verify-status]");
    const button = verify.querySelector("button[type='submit']");
    const code = new FormData(verify).get("code");
    button.disabled = true;
    status.textContent = message("authVerifying");
    try {
      const result = await jsonRequest(comments.authEndpoints.verify, { id: registrationId, code });
      verify.reset();
      showUser(result.user);
    } catch (error) {
      status.textContent = errorMessage(error, message);
    } finally {
      button.disabled = false;
    }
  });

  panel.querySelector("[data-auth-logout]").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await jsonRequest(comments.authEndpoints.logout, {});
      showGuest();
    } catch {
      if (loading) {
        loading.hidden = false;
        loading.textContent = message("authUnavailable");
      }
    } finally {
      button.disabled = false;
    }
  });

  try {
    const result = await jsonRequest(comments.authEndpoints.session);
    if (result.user) showUser(result.user);
    else showGuest();
  } catch {
    showGuest();
    if (loading) {
      loading.hidden = false;
      loading.textContent = message("authUnavailable");
    }
  }
}
