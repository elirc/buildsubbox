# Worked change: reserve stock and record the cycle together

This change replaces a demonstration button that subtracted a hard-coded subscriber count. The new workflow reserves one box for one subscriber and one month, with a receipt that explains the accepted contents. Follow [quoteBox and reduce](../src/model.js), then [repository commit](../src/repository.js).

## The input contract in code

The rules described above are enforced in one place before any quote line is built, from `src/model.js:381-394`. Note that the plan's `itemCount` — not the UI — decides how many distinct items a valid draft has.

```js
export function quoteBox(s, subscriberId, itemIds) {
  array(itemIds, 20);
  unique(itemIds);
  const u = s.subscribers.find((u) => u.id === subscriberId);
  ensure(
    u && u.status === "Active",
    "Only an active subscriber can reserve a box.",
  );
  const p = s.plans.find((p) => p.id === u.planId);
  ensure(p?.active, "The subscription plan is unavailable.");
  ensure(
    itemIds.length === p.itemCount,
    `Choose exactly ${p.itemCount} distinct items.`,
  );
```

## Establish the input contract

A draft contains subscriber ID, cycle month, and distinct selected item IDs. The selected count must equal the active plan's item count. A paused or cancelled subscriber cannot reserve. Every item must exist, be active, have available stock, and avoid the subscriber's excluded tags.

For a Signature plan, exactly five distinct items are required. Selecting four is incomplete; selecting six is not a larger valid box. A duplicate ID cannot count twice. The model checks these rules independently of whether the UI currently disables an Add button.

## Build an accepted quote

`quoteBox` resolves the draft into subscriber, plan, and item snapshots. It includes record versions, accepted names, destination, plan amount, individual item costs and retail values, and aggregate cost and retail totals. Lines are sorted by identifier to make their canonical order deterministic.

For example, if the selected item costs are 800, 700, 400, 500, and 500 cents, item cost totals 2,900 cents. A 4,900-cent plan amount minus those costs is 2,000 cents. The UI describes that subtraction directly. It does not claim a complete profit figure because shipping, labor, payment fees, returns and other costs are absent.

## Freeze the attempt before awaiting storage

App creates a request key, shipment ID, timestamp, cycle, quote, and captured baseline. It keeps them in `attempt`. Retrying uses that same command and baseline. Inputs remain frozen so a changed month or selected item cannot quietly reuse the old key.

Inside the lock, the repository first checks for an existing matching request. A match returns the accepted workspace. A changed fingerprint under the same key fails. If the request is new, the repository compares current bytes with the captured baseline. Only then does the model apply a new reservation.

## Validate the business slot and commit

The reducer rejects any existing shipment for the subscriber-month pair, including cancelled history. It recomputes the quote against current records and compares fingerprints. It then clones state, decrements one unit for each selected item, advances those item versions, and adds a Reserved shipment with its first history entry.

The entire candidate is validated and encoded before storage replacement. If one item is unavailable, no partial stock deduction reaches accepted state. If storage throws, App retains the draft and attempt. If storage actually accepted the write before the acknowledgement failed, a matching retry finds the same shipment and does not decrement again.

## Extend through explicit transitions

Reserved can become Packed or Cancelled. Packed can become Shipped or Cancelled. Shipped can become Delivered. Cancelled and Delivered are terminal. Shipping requires a tracking reference, but recording that reference does not contact a carrier.

Cancellation returns reserved units and appends history in one candidate. Its expected version prevents a stale transition from applying. The model also requires nondecreasing timestamps. Use this workflow as a template for server-side transactions: identify invariants first, then make every related write share the same acceptance boundary.
