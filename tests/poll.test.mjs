import assert from "node:assert/strict";
import test from "node:test";
import { renderMarkdown, summaryFromBody } from "../lib/markdown.mjs";
import { parsePollBody, renderPolls } from "../lib/markdown-poll.mjs";
import pollHandler, { computeVoterHash, pollStorageKey } from "../netlify/functions/poll.mjs";
import { setStoreFactory } from "../netlify/lib/store.mjs";
import { createFileStoreFactory } from "../server/file-store.mjs";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

test("poll parser separates question, options, and reveal block", () => {
  const body = `
Which dimension does \`not...but\` primarily belong to?

- [ ] A. Importance contrast
- [x] B. Truth value / correction contrast
- [ ] C. Scope expansion contrast

:::reveal 答案与解析
The correct answer is **B**!
It negates the misconception and confirms the true fact.
:::
  `.trim();

  const parsed = parsePollBody(body);
  assert.equal(parsed.question, "Which dimension does `not...but` primarily belong to?");
  assert.equal(parsed.options.length, 3);
  assert.equal(parsed.options[0].text, "A. Importance contrast");
  assert.equal(parsed.options[0].isCorrect, false);
  assert.equal(parsed.options[1].text, "B. Truth value / correction contrast");
  assert.equal(parsed.options[1].isCorrect, true);
  assert.equal(parsed.revealTitle, "答案与解析");
  assert.ok(parsed.reveal?.includes("The correct answer is **B**!"));
});

test("renderMarkdown renders interactive poll container and KaTeX math formulas", async () => {
  const source = `
# Quiz Post

Before the poll.

:::poll test-math-poll
What is the positive root of $x^2 - 9 = 0$?

- [ ] $x = 1$
- [x] $x = 3$
- [ ] $x = 9$

:::reveal 详细解析
Because $x^2 = 9$ and $x > 0$, we have $x = \\sqrt{9} = 3$.
:::
:::

After the poll.
  `.trim();

  const { html } = await renderMarkdown(source);

  assert.ok(html.includes('class="freshmark-poll"'));
  assert.ok(html.includes('data-poll-id="test-math-poll"'));
  assert.ok(html.includes('data-has-reveal="true"'));
  assert.ok(html.includes('data-correct-index="1"'));
  assert.ok(html.includes('class="poll-reveal" hidden aria-hidden="true"'));
  assert.ok(html.includes("详细解析"));
  // Math was transformed into KaTeX or math expression HTML
  assert.ok(html.includes("katex") || html.includes("math-expression"));
});

test("summaryFromBody strips poll container markers", () => {
  const body = `
:::poll intro-poll
What do you think?
- A
- B
:::

This is the real beginning of the article about English grammar.
  `.trim();

  const summary = summaryFromBody(body);
  assert.ok(!summary.includes(":::poll"));
  assert.ok(!summary.includes(":::"));
  assert.ok(summary.includes("This is the real beginning"));
});

test("poll API guarantees one-person-one-vote and hides percentages before voting", async () => {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "freshmark-poll-test-"));
  try {
    setStoreFactory(createFileStoreFactory(temporaryDirectory));

    const pollId = "test-blind-poll";
    const voter1 = "voter-token-alpha-123456";
    const voter2 = "voter-token-beta-987654";

    // 1. Initial GET before anyone votes: percentages are hidden
    const getRes1 = await pollHandler(new Request(`http://localhost/api/poll?id=${pollId}&voter=${voter1}`, {
      method: "GET",
    }));
    assert.equal(getRes1.status, 200);
    const getData1 = await getRes1.json();
    assert.equal(getData1.totalVotes, 0);
    assert.equal(getData1.hasVoted, false);
    assert.equal(getData1.percentages, undefined, "Blind test must NOT leak percentages to unvoted users");
    assert.equal(getData1.counts, undefined, "Blind test must NOT leak counts to unvoted users");

    // 2. Voter 1 submits vote for option 1
    const postRes1 = await pollHandler(new Request("http://localhost/api/poll", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: pollId,
        path: "/posts/test/",
        optionIndex: 1,
        voterToken: voter1,
      }),
    }));
    assert.equal(postRes1.status, 200);
    const postData1 = await postRes1.json();
    assert.equal(postData1.ok, true);
    assert.equal(postData1.totalVotes, 1);
    assert.deepEqual(postData1.percentages, [0, 100]);
    assert.equal(postData1.votedOption, 1);
    assert.ok(postRes1.headers.get("set-cookie")?.includes("fm_voter="));

    // 3. Voter 1 tries to vote again -> rejected as already_voted, count does not increase
    const postRes1Repeat = await pollHandler(new Request("http://localhost/api/poll", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: pollId,
        path: "/posts/test/",
        optionIndex: 0,
        voterToken: voter1,
      }),
    }));
    assert.equal(postRes1Repeat.status, 200);
    const repeatData = await postRes1Repeat.json();
    assert.equal(repeatData.ok, false);
    assert.equal(repeatData.error, "already_voted");
    assert.equal(repeatData.totalVotes, 1, "Duplicate vote must not increment total votes");
    assert.equal(repeatData.votedOption, 1, "Must retain originally recorded vote");

    // 4. Voter 2 checks GET before voting -> can see totalVotes=1, but percentages remain hidden
    const getRes2 = await pollHandler(new Request(`http://localhost/api/poll?id=${pollId}&voter=${voter2}`, {
      method: "GET",
    }));
    const getData2 = await getRes2.json();
    assert.equal(getData2.totalVotes, 1);
    assert.equal(getData2.hasVoted, false);
    assert.equal(getData2.percentages, undefined);

    // 5. Voter 2 submits vote for option 0 -> totalVotes becomes 2, percentages become 50% / 50%
    const postRes2 = await pollHandler(new Request("http://localhost/api/poll", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: pollId,
        path: "/posts/test/",
        optionIndex: 0,
        voterToken: voter2,
      }),
    }));
    const postData2 = await postRes2.json();
    assert.equal(postData2.ok, true);
    assert.equal(postData2.totalVotes, 2);
    assert.deepEqual(postData2.percentages, [50, 50]);

    // 6. Voter 1 checks GET now -> hasVoted is true, percentages are revealed
    const getRes1After = await pollHandler(new Request(`http://localhost/api/poll?id=${pollId}&voter=${voter1}`, {
      method: "GET",
    }));
    const getData1After = await getRes1After.json();
    assert.equal(getData1After.hasVoted, true);
    assert.deepEqual(getData1After.percentages, [50, 50]);
    assert.equal(getData1After.votedOption, 1);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("poll API handles concurrent votes without losing records", async () => {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "freshmark-poll-concurrent-"));
  try {
    setStoreFactory(createFileStoreFactory(temporaryDirectory));
    const pollId = "concurrent-poll";

    const voteCount = 8;
    const votes = Array.from({ length: voteCount }, (_, i) => pollHandler(new Request("http://localhost/api/poll", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: pollId,
        path: "/posts/test/",
        optionIndex: i % 2,
        voterToken: `voter-unique-${i}-token-xyz`,
      }),
    })));

    const results = await Promise.all(votes);
    for (const res of results) {
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.ok, true);
    }

    const finalGet = await pollHandler(new Request(`http://localhost/api/poll?id=${pollId}&voter=voter-unique-0-token-xyz`, {
      method: "GET",
    }));
    const finalData = await finalGet.json();
    assert.equal(finalData.totalVotes, voteCount);
    assert.deepEqual(finalData.counts, [voteCount / 2, voteCount / 2]);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
