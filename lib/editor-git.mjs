// Git operations behind the editor's commit button. Only changes inside content/posts are listed
// or committed; git runs without a shell and never prompts, so a missing credential fails fast.
import { spawn } from "node:child_process";
import path from "node:path";
import { EditorError } from "./editor-store.mjs";

function git(args, { cwd, input, timeout = 30_000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, { cwd, env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "never", LC_ALL: "C" }, stdio: [input === undefined ? "ignore" : "pipe", "pipe", "pipe"] });
    const stdout = [];
    const stderr = [];
    const timer = setTimeout(() => child.kill("SIGTERM"), timeout);
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", (error) => { clearTimeout(timer); reject(error.code === "ENOENT" ? new EditorError(501, "git is not installed") : error); });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code: signal ? 124 : code, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8").trim() || (signal ? "git timed out" : "") });
    });
    if (input !== undefined) {
      child.stdin.on("error", () => {});
      child.stdin.end(input);
    }
  });
}

async function checked(args, options) {
  const result = await git(args, options);
  if (result.code !== 0) throw new EditorError(502, result.stderr || result.stdout.trim() || `git ${args[0]} failed`);
  return result.stdout;
}

const labels = { "?": "added", A: "added", M: "modified", T: "modified", D: "deleted", R: "renamed", C: "added", U: "conflict" };

// `git status -z` output: "XY path\0", with a second "\0old" path after renames and copies.
export function parseStatus(output) {
  const fields = output.split("\0");
  const entries = [];
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (field.length < 4) continue;
    const code = field.slice(0, 2);
    const entry = { code, path: field.slice(3) };
    if (code[0] === "R" || code[0] === "C") entry.from = fields[++index];
    const letter = code === "??" ? "?" : code.includes("U") ? "U" : code[0] !== " " ? code[0] : code[1];
    entry.change = labels[letter] || "modified";
    entries.push(entry);
  }
  return entries;
}

async function repository(contentDir) {
  const top = await git(["rev-parse", "--show-toplevel"], { cwd: contentDir }).catch(() => null);
  if (!top || top.code !== 0) return null;
  const root = top.stdout.trim();
  const prefix = path.relative(root, contentDir).split(path.sep).join("/");
  return { root, prefix: prefix ? `${prefix}/` : "" };
}

export async function gitStatus(contentDir) {
  const repo = await repository(contentDir);
  if (!repo) return { available: false, changes: [] };
  const { root, prefix } = repo;
  const [branch, upstream, remotes, status] = await Promise.all([
    git(["symbolic-ref", "--quiet", "--short", "HEAD"], { cwd: root }),
    git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], { cwd: root }),
    git(["remote"], { cwd: root }),
    checked(["-c", "core.quotepath=false", "status", "--porcelain=v1", "-z", "--untracked-files=all", "--", prefix || "."], { cwd: root }),
  ]);
  let ahead = 0;
  let behind = 0;
  if (upstream.code === 0) {
    const counts = await git(["rev-list", "--left-right", "--count", "HEAD...@{u}"], { cwd: root });
    [ahead, behind] = counts.stdout.trim().split(/\s+/).map(Number);
  }
  const inside = (repoPath) => repoPath.startsWith(prefix);
  const changes = parseStatus(status).filter((entry) => inside(entry.path)).map((entry) => ({
    file: entry.path.slice(prefix.length), change: entry.change, ...(entry.from && inside(entry.from) ? { from: entry.from.slice(prefix.length) } : {}),
  }));
  return {
    available: true, branch: branch.code === 0 ? branch.stdout.trim() : null, upstream: upstream.code === 0 ? upstream.stdout.trim() : null,
    remote: remotes.stdout.split("\n").map((name) => name.trim()).find(Boolean) || null, ahead: ahead || 0, behind: behind || 0, changes,
  };
}

let busy = false;

export async function gitCommit(contentDir, { message, files = [], push = false }) {
  if (busy) throw new EditorError(409, "Another commit or push is still running");
  busy = true;
  try {
    const repo = await repository(contentDir);
    if (!repo) throw new EditorError(400, "content/posts is not inside a git repository");
    const status = await gitStatus(contentDir);
    const known = new Map();
    for (const change of status.changes) {
      known.set(change.file, [change.file, ...(change.from ? [change.from] : [])]);
      if (change.from) known.set(change.from, [change.from, change.file]);
    }
    const requested = [...new Set((Array.isArray(files) ? files : []).map(String))];
    const unknown = requested.filter((file) => !known.has(file));
    if (unknown.length) throw new EditorError(400, `Not a pending change in content/posts: ${unknown.slice(0, 3).join(", ")}`);
    const paths = [...new Set(requested.flatMap((file) => known.get(file)))].map((file) => `${repo.prefix}${file}`);
    let commit = null;
    if (paths.length) {
      const text = String(message || "").trim();
      if (!text) throw new EditorError(400, "Write a commit message");
      if (text.length > 5000) throw new EditorError(400, "The commit message is too long");
      await checked(["add", "-A", "--", ...paths], { cwd: repo.root });
      // Pathspecs make git commit only these files, leaving anything else the user staged alone.
      await checked(["commit", "--quiet", "--file=-", "--", ...paths], { cwd: repo.root, input: `${text}\n` });
      const head = await checked(["log", "-1", "--format=%h%x00%s"], { cwd: repo.root });
      const [hash, subject] = head.trim().split("\0");
      commit = { hash, subject };
    } else if (!push) throw new EditorError(400, "Select at least one file to commit");
    let pushed = null;
    if (push) {
      const branch = status.branch;
      const args = status.upstream ? ["push"] : status.remote && branch ? ["push", "--set-upstream", status.remote, branch] : null;
      if (!args) pushed = { ok: false, error: branch ? "No git remote is configured" : "HEAD is detached; check out a branch first" };
      else {
        const result = await git(args, { cwd: repo.root, timeout: 180_000 });
        pushed = result.code === 0 ? { ok: true, output: result.stderr } : { ok: false, error: result.stderr || "git push failed" };
      }
    }
    return { commit, pushed, status: await gitStatus(contentDir) };
  } finally {
    busy = false;
  }
}
