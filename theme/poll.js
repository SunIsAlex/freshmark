function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days = 365) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function getVoterToken() {
  try {
    let token = localStorage.getItem("freshmark-voter-token");
    if (!token) token = getCookie("fm_voter");
    if (!token) {
      token = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    }
    localStorage.setItem("freshmark-voter-token", token);
    setCookie("fm_voter", token);
    return token;
  } catch {
    return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
}

function getStoredVote(pollId) {
  try {
    const raw = localStorage.getItem(`freshmark-poll:${pollId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredVote(pollId, data) {
  try {
    localStorage.setItem(`freshmark-poll:${pollId}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

function updatePollUI(poll, votedOption, stats) {
  poll.classList.add("is-voted");

  const inputs = poll.querySelectorAll("input[type='radio']");
  for (const input of inputs) input.disabled = true;

  if (typeof votedOption === "number" && inputs[votedOption]) {
    inputs[votedOption].checked = true;
    poll.querySelectorAll(".poll-option").forEach((opt) => opt.classList.remove("is-selected"));
    const selectedOption = poll.querySelector(`.poll-option[data-option-index="${votedOption}"]`);
    if (selectedOption) selectedOption.classList.add("is-voted-option");
  }

  if (poll.dataset.correctIndex !== undefined) {
    const correctIdx = Number(poll.dataset.correctIndex);
    const correctOption = poll.querySelector(`.poll-option[data-option-index="${correctIdx}"]`);
    if (correctOption) correctOption.classList.add("is-correct-answer");
  }

  const submitBtn = poll.querySelector(".poll-submit-btn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "已投票";
  }

  const totalCountEl = poll.querySelector(".poll-total-count");
  if (totalCountEl && typeof stats?.totalVotes === "number") {
    totalCountEl.textContent = `共 ${stats.totalVotes} 人参与`;
  }

  if (Array.isArray(stats?.percentages)) {
    const optionEls = poll.querySelectorAll(".poll-option");
    optionEls.forEach((opt, idx) => {
      const pct = stats.percentages[idx] || 0;
      const votes = stats.counts ? stats.counts[idx] : null;
      const bar = opt.querySelector(".poll-result-bar");
      const pctEl = opt.querySelector(".poll-result-percent");
      const votesEl = opt.querySelector(".poll-result-votes");

      if (bar) bar.style.width = `${pct}%`;
      if (pctEl) pctEl.textContent = `${pct}%`;
      if (votesEl && votes !== null && votes !== undefined) {
        votesEl.textContent = `(${votes} 票)`;
      }
    });
  }

  const revealEl = poll.querySelector(".poll-reveal");
  if (revealEl) {
    revealEl.removeAttribute("hidden");
    revealEl.setAttribute("aria-hidden", "false");
    revealEl.classList.add("is-revealed");
  }
}

function initPoll(poll) {
  if (poll.dataset.pollInitialized === "true") return;
  poll.dataset.pollInitialized = "true";

  const pollId = poll.dataset.pollId;
  const form = poll.querySelector(".poll-form");
  const options = poll.querySelectorAll(".poll-option");
  const submitBtn = poll.querySelector(".poll-submit-btn");
  const statusEl = poll.querySelector(".poll-status");
  const totalCountEl = poll.querySelector(".poll-total-count");
  const endpoint = window.FRESHMARK?.poll?.endpoint || "/api/poll";

  // Check local storage for previous vote
  const localVote = getStoredVote(pollId);
  if (localVote && typeof localVote.option === "number") {
    updatePollUI(poll, localVote.option, localVote.stats);
  }

  // Fetch latest stats from server
  const voterToken = getVoterToken();
  const query = new URLSearchParams({
    id: pollId,
    path: location.pathname,
    voter: voterToken,
  });

  fetch(`${endpoint}?${query.toString()}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return;
      if (data.hasVoted) {
        setStoredVote(pollId, { option: data.votedOption, stats: data });
        updatePollUI(poll, data.votedOption, data);
      } else if (typeof data.totalVotes === "number" && totalCountEl && !poll.classList.contains("is-voted")) {
        totalCountEl.textContent = `${data.totalVotes} 人参与`;
      }
    })
    .catch(() => {});

  // Handle radio selection
  form.addEventListener("change", () => {
    if (poll.classList.contains("is-voted")) return;
    options.forEach((opt) => opt.classList.remove("is-selected"));
    const checked = form.querySelector("input[type='radio']:checked");
    if (checked) {
      checked.closest(".poll-option")?.classList.add("is-selected");
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  // Handle vote submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (poll.classList.contains("is-voted")) return;

    const checked = form.querySelector("input[type='radio']:checked");
    if (!checked) return;

    const optionIndex = Number(checked.value);
    if (Number.isNaN(optionIndex)) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "提交中...";
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: pollId,
          path: location.pathname,
          optionIndex,
          voterToken: getVoterToken(),
        }),
      });

      const result = await response.json();
      if (response.ok && (result.ok || result.error === "already_voted")) {
        const votedOption = result.votedOption !== undefined ? result.votedOption : optionIndex;
        setStoredVote(pollId, { option: votedOption, stats: result });
        updatePollUI(poll, votedOption, result);
        if (statusEl) {
          statusEl.textContent = result.error === "already_voted" ? "您已投过票" : "✓ 投票成功";
        }
      } else {
        throw new Error(result.error || "failed");
      }
    } catch {
      // Offline fallback: calculate local distribution and reveal answers
      const countList = new Array(options.length).fill(0);
      countList[optionIndex] = 1;
      const pctList = new Array(options.length).fill(0);
      pctList[optionIndex] = 100;

      const fallbackStats = {
        totalVotes: 1,
        counts: countList,
        percentages: pctList,
      };

      setStoredVote(pollId, { option: optionIndex, stats: fallbackStats });
      updatePollUI(poll, optionIndex, fallbackStats);
      if (statusEl) statusEl.textContent = "✓ 投票成功";
    }
  });
}

export function initPolls(scope = document) {
  for (const poll of scope.querySelectorAll(".freshmark-poll")) {
    initPoll(poll);
  }
}
