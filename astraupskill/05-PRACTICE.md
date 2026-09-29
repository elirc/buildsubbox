# Practice ladder for mid-level CRUD skills

These exercises are future work, not claims that the features already exist. Export a complete workspace before experiments. Write acceptance examples before changing code, then compare your result with [solution sketches](06-SOLUTIONS-AND-REVIEW.md).

## Rung 0: a guided 20-minute change with the failing test supplied

Rule to add: an item cannot be sold below cost. `validateItem` in `src/model.js` checks `costCents` and `retailCents` separately but never compares them. Paste this into `test/model.test.mjs`, run `npm test`, and watch it fail (red first):

```js
test("rung 0: an item priced below cost is rejected", () => {
  const s = fresh();
  const item = { ...s.items[0], costCents: 500, retailCents: 499, version: s.items[0].version };
  assert.throws(() => validateItem(item), /below cost/);
});
```

(add `validateItem` to the import list at the top of the file). Then add one line to `validateItem`, after the two `integer(...)` checks:

```js
ensure(v.retailCents >= v.costCents, "Retail price cannot be below cost.");
```

Run `npm test` again: green, and every other test still passes. If an existing fixture now fails, that fixture sells below cost and the failure is telling you about data, not code; fix the fixture and say so in your notes. Twenty minutes, one rule, the whole predict-run-fix loop.

## Exercise 1: subscriber notes

Add a bounded optional delivery note. Decide whether it belongs only to the live subscriber, to the accepted shipment snapshot, or both. Update the editor, model, seed, import contract, and receipt display consistently. A TypeScript annotation or input field alone would not update the stored schema.

Acceptance examples: blank is valid; overlong text fails without clearing the draft; a note accepted with a shipment remains unchanged after the subscriber edits their current note. Decide whether multiline notes are allowed and update the control-character policy explicitly rather than accidentally weakening every text field.

## Exercise 2: visible stock movements

Add a stock-movement ledger for manual adjustments, reservations, and cancellations. Each movement should identify the item, signed quantity, reason, related operation when present, and accepted time. Explain the opening balance needed to reconcile current available stock.

Acceptance examples: a reservation creates matching negative movements and a shipment together; cancellation creates positive movements once; a failed candidate leaves no partial movements; a manual adjustment records its reason. A useful reviewer should be able to reconcile one item's available count without trusting a display-only total.

## Exercise 3: skip a subscriber cycle

The current app supports status changes and a uniqueness rule, but not a dedicated skip ledger. Design a skip for one subscriber-month without cancelling the whole subscription. Decide whether skipping consumes the same business slot as a shipment and whether an unskip is allowed before reservation.

Acceptance examples: a skip blocks a new reservation for that month; other months remain available; a duplicate skip is safe to retry; conflicting skip and reserve requests cannot both succeed. Keep fictional billing notices out of the UI unless an implemented operation supports them.

## Exercise 4: replace a cancelled box

Currently, a cancelled cycle remains unique and cannot be reserved again. Design an explicit replacement workflow that retains the cancelled record while allowing a new attempt linked to it. Distinguish business cycle identity, shipment attempt identity, and transport request identity.

Acceptance examples: two simultaneous replacement requests create one replacement; a replacement can only follow an eligible cancelled record; the old cancellation never restores stock again; history shows the relationship. Do not simply remove the cycle constraint and hope clients avoid duplicate clicks.

## Exercise 5: move acceptance to SQL and HTTP

Build a small authenticated server with inventory, plans, subscribers, shipments, accepted lines, and lifecycle events. Use server-side authorization and constraints for references and uniqueness. Reserve stock through transactional updates that cannot make available units negative.

Acceptance examples: an unauthorized user cannot edit inventory; two clients competing for a last unit produce one accepted reservation; a changed payload under an old key conflicts; a failed transaction leaves neither stock deduction nor shipment. Add a migration and a reproducible test database setup.

Only after this slice works should you consider carrier or payment integrations. External effects introduce reconciliation and retry boundaries beyond database acceptance. Your deliverable should explain those boundaries, show passing failure cases, and state what remains simulated. This produces stronger upskilling evidence than replacing the local interface with a larger mock dashboard.
