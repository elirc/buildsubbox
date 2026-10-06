# Practice ladder

Exercises run from easy to hard. Exercises 1–5 were each checked against the code in this commit (the Check results below are what a correct answer produces). Exercises 6–9 are design-and-build work; their Checks describe what your finished change must demonstrate. Export a complete workspace before any browser experiment, write the test before the code, and compare with [the solution sketches](06-SOLUTIONS-AND-REVIEW.md) afterwards.

`npm.cmd test` (or `npm test`) runs `scripts/test.mjs`, which needs no installed dependencies — only Node 22.12+. A clean tree reports `# tests 36`, `# pass 36`.

---

## Exercise 1 — Predict the recommendation order (easy)

**Goal.** Understand that eligibility filters first and scoring only orders what is left.

Read `eligible` and `recommendations` (`src/model.js:350-380`) and Maya Chen's record in `src/initial.js` (preferred tags, blocked tags, ratings). On paper, compute the score of every item for `sub_4289`: 10 points per preferred-tag match (case-insensitive) plus 5 × her rating of the item, or 5 × 3 when unrated. Then order them, breaking ties by item id.

*Hints:* `itm_101` has three preferred tags and a rating of 5. Ties are frequent; the tie-break is `a.item.id < b.item.id`.

**Check.**

```powershell
node -e "import('./src/model.js').then(async m => { const { initial } = await import('./src/initial.js'); console.log(m.recommendations(initial, 'sub_4289').map(r => r.item.id + ' ' + r.score).join('\n')); })"
```

Your list matches the nine printed lines exactly, starting `itm_101 55`, `itm_103 40` and ending `itm_108 20`.

---

## Exercise 2 — Reject an item priced below cost (easy)

**Goal.** One complete red → green loop on a validator, including a fixture that the new rule breaks.

`validateItem` (`src/model.js:68-94`) checks `costCents` and `retailCents` separately but never compares them. Add `validateItem` to the import list at the top of `test/model.test.mjs`, then append:

```js
test("an item priced below cost is rejected", () => {
  const s = fresh();
  const item = { ...s.items[0], costCents: 500, retailCents: 499 };
  assert.throws(() => validateItem(item), /below cost/);
});
```

Run the suite (red), then add one `ensure(...)` after the two money checks in `validateItem`.

*Hints:* after your change, one **existing** test goes red. Read it before touching it: it edits an item's cost to a value above its retail price only to prove that receipts keep the old cost. The fixture is now invalid data under your new rule; change its cost to a value below 2,400 cents and say so in your commit message.

**Check.** Before the fix: `# tests 37`, `# fail 1`. After the rule alone: `not ok ... snapshots survive later catalog and subscriber edits`. After adjusting that fixture (for example `costCents: 999`): `# tests 37`, `# pass 37`.

---

## Exercise 3 — A tag cannot be both preferred and excluded (easy–medium)

**Goal.** Add a cross-field rule to `validateSubscriber` without weakening existing per-field rules.

Today a subscriber can list `Citrus` as preferred and `citrus` as blocked; `eligible` then silently excludes every citrus item. Add `validateSubscriber` to the test imports and write:

```js
test("a tag cannot be both preferred and excluded", () => {
  const u = { ...fresh().subscribers[0], preferredTags: ["Citrus"], blockedTags: ["citrus"] };
  assert.throws(() => validateSubscriber(u), /both preferred and excluded/);
});
```

*Hints:* compare case-folded values, as `tags()` and `eligible()` already do. Put the check after both `tags(...)` calls so malformed lists still fail with their existing messages.

**Check.** Red first (`# fail 1`), then `# pass` equals `# tests` with no other test changed. The seed subscriber has no overlapping tags, so no fixture should need editing.

---

## Exercise 4 — Who loses the last-unit race, and why? (medium)

**Goal.** Learn what the repository's concurrency control actually arbitrates.

Read the test `concurrent last-unit reservations accept one complete box` in `test/model.test.mjs` and `commit` in `src/repository.js:11-24`. Predict the error message the losing request receives. Is it about stock?

Then add one assertion after the existing `fulfilled` count check:

```js
assert.match(results.find((r) => r.status === "rejected").reason.message, /another tab/);
```

*Hints:* both requests captured the same `base`. Which check inside the lock runs before `reduce` ever looks at stock?

**Check.** The suite still passes with the new assertion. Then write two sentences: why the loser never reaches the stock check, and what that means for two operators editing *unrelated* records at the same time (see [Concepts](02-CONCEPTS.md#concurrency-control-is-whole-workspace)).

---

## Exercise 5 — Lost acknowledgement on a lifecycle transition (medium–hard)

**Goal.** Find the boundary of the idempotency guarantee.

The suite proves that a reservation whose acknowledgement is lost can be retried safely (`write accepted before acknowledgement fails is safely replayed`). Write the same scenario for a transition, as a characterization test of today's behavior:

```js
test("lost acknowledgement on a transition is not replayable", async () => {
  const s = reduce(fresh(), reserve());
  const f = fixture(encode(s));
  const base = f.repo.load();
  const command = { type: "shipment.transition", id: "ship-one", expected: 1, status: "Packed", at: "2026-09-10T09:00:00.000Z" };
  const original = f.storage.setItem;
  let once = true;
  f.storage.setItem = (k, v) => { original(k, v); if (once) { once = false; throw new Error("Lost acknowledgement"); } };
  await assert.rejects(f.repo.commit(base, command), /Lost acknowledgement/);
  await assert.rejects(f.repo.commit(base, command), /another tab/);
  assert.equal(f.repo.load().state.shipments[0].status, "Packed");
});
```

Explain what the operator sees after the retry, and why the message is misleading. Then decide whether to fix it, and how (see the hints in 06).

*Hints:* `replay` returns early for anything that is not `type: "reserve"` (`src/model.js:430`). In the UI, `transition` (`src/App.jsx:256-279`) passes the old `snapshot` as the base on every attempt.

**Check.** The characterization test passes on the current code (`# pass` equals `# tests`). If you implement a fix, flip the second assertion to expect success and the test still passes, along with every other test.

---

## Exercise 6 — Subscriber delivery notes (medium, build)

**Goal.** Add a bounded optional field across editor, model, seed, backup format and receipt.

Decide whether the note belongs to the live subscriber, to the accepted shipment snapshot, or both. `obj()` requires an exact key set (`src/model.js:5-15`), so adding a key changes the import contract: every existing backup becomes invalid unless you add a migration.

**Check.** New tests prove: blank is valid; an overlong note fails; a note accepted into a shipment stays unchanged after the subscriber edits it; a workspace in the old format (the current `src/initial.js` shape, saved as a fixture before you change it) still decodes through your migration. `npm test` reports no failures.

---

## Exercise 7 — Stock-movement ledger (hard, build)

**Goal.** Make every change to `stock` explainable.

Record manual adjustments, reservations and cancellations as movements: item, signed quantity, reason, related shipment, accepted time. Define the opening balance for seed stock.

**Check.** A test runs reserve → cancel → manual adjustment and asserts, for one item, that opening balance + sum of movements equals `stock`. A rejected reservation (out-of-stock line) leaves no movements. Like `shipments` (`array(s.shipments, 2000)` in `validateState`), the ledger needs an explicit size bound; add one and test it.

---

## Exercise 8 — Skip or replace a cycle (hard, design + build)

**Goal.** Change the subscriber-month policy deliberately.

Today a cancelled cycle stays occupied: the test `cancel restores once retains history and keeps cycle uniqueness` asserts that a new request for the same month throws `/already has/`. Pick one: a *skip* that occupies the month without a shipment, or a *replacement* shipment linked to the cancelled one.

**Check.** Your change makes that existing assertion fail, and you update it on purpose with a comment naming the new policy. New tests cover: duplicate skip/replacement requests under one request key replay safely; two different requests for the same slot cannot both succeed (use the repository `fixture` with `Promise.allSettled`, as the last-unit test does); a replacement never returns the cancelled shipment's stock a second time.

---

## Exercise 9 — Move acceptance to SQL and HTTP (hard, project)

**Goal.** Rebuild the reservation boundary on a server with real constraints.

[08-SERVER-COMPANION.md](08-SERVER-COMPANION.md) sketches one route and maps it onto `reduce`/`replay`. Build it with authentication, a migration, and a reproducible test database.

**Check.** Automated HTTP tests show: unauthenticated inventory edit → 401; two clients racing for the last unit → exactly one 201 and stock 0; same key with a different body → 409; same subscriber and month with a new key → 409; a body failing validation → 400 with nothing written.
