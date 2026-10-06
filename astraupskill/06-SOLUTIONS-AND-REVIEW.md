# Solution sketches: keep the invariant visible

Use these after attempting [the practice ladder](05-PRACTICE.md). Solutions 2–5 were applied to a scratch copy of this repo and the suite was run (see [Verification](VERIFICATION.md)). Sketches 6–9 are designs; the current [model](../src/model.js) defines what is actually implemented.

## Exercise 1

`itm_101` 55 (3 tag matches + rating 5), `itm_103` 40 (2 + rating 4), then four items at 35 in id order (`itm_102`, `itm_105`, `itm_107`, `itm_109`: 2 matches, unrated), `itm_104` and `itm_106` at 25, `itm_108` at 20 (1 match, rating 2). A rating of 2 is a *ranking* penalty only; an excluded tag (Lavender, Peanuts) removes the item entirely — none of the nine seed items carries one, which is why all nine appear.

## Exercise 2

```js
ensure(v.retailCents >= v.costCents, "Retail price cannot be below cost.");
```

placed after `integer(v.retailCents, ...)` in `validateItem`. The broken fixture is in `snapshots survive later catalog and subscriber edits`: `costCents: 9999` exceeds the item's 2,400-cent retail price. Lowering it (e.g. to 999) keeps the test's intent — the receipt keeps the *old* cost — while respecting the new rule. Review note: this rule also applies to every backup on import, because `validateState` calls `validateItem`; an old backup with a below-cost item would now be rejected. Say so in the PR.

## Exercise 3

```js
const excluded = new Set(v.blockedTags.map((t) => t.toLowerCase()));
ensure(
  !v.preferredTags.some((t) => excluded.has(t.toLowerCase())),
  "A tag cannot be both preferred and excluded.",
);
```

after `tags(v.blockedTags)` in `validateSubscriber`. Same import caveat as Exercise 2.

## Exercise 4

The loser fails with "Workspace changed in another tab. Export your draft and reload before saving." Inside the lock the winner has already replaced the stored bytes, so `current.raw !== base.raw` throws before `reduce` runs; stock never decides the race. Consequence: any two concurrent writes conflict, even on unrelated records, and the user is asked to reload. Safe, but coarse.

## Exercise 5

After the retry the operator sees "Workspace changed in another tab", although the transition was saved by the first attempt and no other tab exists. Two reasonable fixes:

- **Make transitions replayable in the model.** In `replay`, for `shipment.transition`, return the state when the shipment's version is `expected + 1` and its last history entry equals `{ status: c.status, at: c.at }`. That is the transition's natural fingerprint; no new field needed.
- **Or report honestly in the UI.** On a baseline mismatch, reload and check whether the intended change is already present before showing a conflict.

The first keeps the guarantee in the tested domain layer, which is where this codebase puts every other guarantee.

## Before Exercise 9: what a server would have to replace

Before sketching a server, read the transaction you already have. `commit` in `src/repository.js:11-24` is lock, replay check, base comparison, reduce, write — a server version needs all five, with the lock and the base comparison moved into the database.

```js
  async function commit(base, command) {
    return lock(() => {
      const current = load();
      if (replay(current.state, command)) return current;
      if (current.raw !== base.raw)
        throw new Error(
          "Workspace changed in another tab. Export your draft and reload before saving.",
        );
      const state = reduce(current.state, command);
      const raw = encode(state);
      storage.setItem(STORAGE_KEY, raw);
      return { state, raw };
    });
  }
```

## Exercise 6 — delivery notes belong to two timelines

A subscriber's current note can change. A shipment's accepted note describes instructions at reservation time. Store both when those meanings matter. The quote should copy the current note into the accepted receipt. A later subscriber edit should not mutate that receipt.

Choose a clear text policy. If multiline notes are allowed, write a dedicated validator rather than removing control-character checks from every domain field. Add a schema migration that recognizes the exact old format and supplies a documented empty default. Test an old valid backup and a malformed near-match so migration does not disguise corruption.

## Exercise 7 — a stock ledger needs an opening balance

Movement totals alone cannot explain existing sample stock unless there is an opening balance. Define each item's opening quantity and signed movements, or define explicit accepted stocktake events that reset the reconciliation baseline. Document which model you choose.

For one reservation, append a negative movement for each selected item in the same transaction as the shipment. Cancellation appends matching positive movements linked to that shipment. A unique operation identity prevents duplicate returns. Manual adjustments require a reason and accepted actor once authentication exists. The useful test checks reconciliation after a sequence of reserve, cancel, and manual adjustment, including a failure in the middle of a proposed operation.

## Exercise 8, skip option — a skip competes for the same cycle

Do not put skip state only in a button label or transient subscriber boolean. Give a subscriber-month slot an explicit state, such as available, skipped, or reserved, with a version or transactionally enforced transition. Decide whether skipped history remains after unskip and how it appears in an audit view.

The critical race is one client skipping while another reserves. Both must use the same authoritative cycle boundary. If each checks a separate table without an appropriate transaction or uniqueness design, both could succeed. Write that race test before polishing the UI. Explain the chosen response when an unskip arrives after a shipment was already accepted.

## Exercise 8, replacement option — another business operation

A cancelled original shipment and its replacement are distinct accepted attempts under one cycle. Keep their IDs and relationship, and make the cycle point to the currently effective attempt. A replacement request needs its own transport key and must compare the expected cycle state.

Retain the original stock restoration and never replay it as part of replacement. Reserve new selected units in the same transaction that accepts the new shipment. Prevent two concurrent replacements through a constraint or conditional cycle update. Your test should inspect both shipment history and available quantities, because one can look correct while the other duplicates a side effect.

## Exercise 9 — move authority to the server

Treat browser data as an untrusted request. Authenticate the actor and authorize inventory, subscriber and shipment actions server-side. Store accepted quote facts in receipt rows. Use foreign keys, nonnegative quantity constraints, versions, and unique request/cycle identities for their respective invariants.

A reviewer should be able to answer: where is the operation durable, what can be retried, which history remains immutable, and how is an uncertain result reconciled? Include a failed transaction and a stale request in the demonstration. Do not claim that adding an HTTP endpoint alone creates reliable persistence or that a database transaction automatically makes external carrier calls atomic.
