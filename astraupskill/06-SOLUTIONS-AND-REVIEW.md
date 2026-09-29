# Solution sketches: keep the invariant visible

Use these sketches after attempting [the practice ladder](05-PRACTICE.md). They describe extension designs. The current [model](../src/model.js) and [verification page](VERIFICATION.md) define what is actually implemented.

## What a server would have to replace

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

## Delivery notes belong to two timelines

A subscriber's current note can change. A shipment's accepted note describes instructions at reservation time. Store both when those meanings matter. The quote should copy the current note into the accepted receipt. A later subscriber edit should not mutate that receipt.

Choose a clear text policy. If multiline notes are allowed, write a dedicated validator rather than removing control-character checks from every domain field. Add a schema migration that recognizes the exact old format and supplies a documented empty default. Test an old valid backup and a malformed near-match so migration does not disguise corruption.

## A stock ledger needs an opening balance

Movement totals alone cannot explain existing sample stock unless there is an opening balance. Define each item's opening quantity and signed movements, or define explicit accepted stocktake events that reset the reconciliation baseline. Document which model you choose.

For one reservation, append a negative movement for each selected item in the same transaction as the shipment. Cancellation appends matching positive movements linked to that shipment. A unique operation identity prevents duplicate returns. Manual adjustments require a reason and accepted actor once authentication exists. The useful test checks reconciliation after a sequence of reserve, cancel, and manual adjustment, including a failure in the middle of a proposed operation.

## A skip competes for the same cycle

Do not put skip state only in a button label or transient subscriber boolean. Give a subscriber-month slot an explicit state, such as available, skipped, or reserved, with a version or transactionally enforced transition. Decide whether skipped history remains after unskip and how it appears in an audit view.

The critical race is one client skipping while another reserves. Both must use the same authoritative cycle boundary. If each checks a separate table without an appropriate transaction or uniqueness design, both could succeed. Write that race test before polishing the UI. Explain the chosen response when an unskip arrives after a shipment was already accepted.

## Replacement is another business operation

A cancelled original shipment and its replacement are distinct accepted attempts under one cycle. Keep their IDs and relationship, and make the cycle point to the currently effective attempt. A replacement request needs its own transport key and must compare the expected cycle state.

Retain the original stock restoration and never replay it as part of replacement. Reserve new selected units in the same transaction that accepts the new shipment. Prevent two concurrent replacements through a constraint or conditional cycle update. Your test should inspect both shipment history and available quantities, because one can look correct while the other duplicates a side effect.

## Move authority to the server

Treat browser data as an untrusted request. Authenticate the actor and authorize inventory, subscriber and shipment actions server-side. Store accepted quote facts in receipt rows. Use foreign keys, nonnegative quantity constraints, versions, and unique request/cycle identities for their respective invariants.

A reviewer should be able to answer: where is the operation durable, what can be retried, which history remains immutable, and how is an uncertain result reconciled? Include a failed transaction and a stale request in the demonstration. Do not claim that adding an HTTP endpoint alone creates reliable persistence or that a database transaction automatically makes external carrier calls atomic.
