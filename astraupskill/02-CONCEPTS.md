# Concepts: stock, snapshots, and business identity

## One operation can change several records

A reservation creates a shipment and reduces available units for every selected item. Saving those changes independently could leave a shipment without reserved stock or reduce stock without a shipment. ParcelPilot stores a bounded aggregate in one localStorage value so the candidate can be validated and written as one application operation.

The reducer works on a clone. If the fifth selected item is unavailable, the first four items in the accepted state must remain untouched. The tests compare accepted bytes before and after rejection. Clamping negative stock to zero would conceal overselling rather than prove that a reservation was possible.

## Available stock has a precise meaning

`stock` means units currently available for new reservations. Reserving a box subtracts one from each distinct selected item. Packing does not subtract again. Shipping and delivery retain the deduction. Cancellation from Reserved or Packed returns one per item and becomes terminal, preventing a second return.

Manual inventory edits adjust the available count directly and advance the item version. They do not rewrite earlier shipment facts. This project does not yet retain a complete stock-movement journal, physical counts, purchase orders, returns, or warehouse reconciliation. Keep those gaps distinct from the implemented reservation invariant.

## Two identities prevent different duplicates

A request key identifies one attempted reservation command. Retrying it with the same fingerprint returns the accepted shipment. Reusing it with changed quote details or month fails. Separately, subscriber ID plus cycle month identifies the business slot. A new request key cannot create another shipment for that same subscriber-month, even after cancellation.

These constraints answer different questions. Idempotency handles transport uncertainty. The cycle constraint enforces the chosen business policy. In a SQL version, you would need both appropriate unique constraints and transaction handling; a preliminary lookup by itself cannot arbitrate concurrent inserts.

## Snapshots separate history from current policy

A shipment stores accepted subscriber name, destination, plan name, amount, item count, item names, costs, and retail values. Editing the live catalog later must not change those accepted facts. Existing receipts remain readable after an item is archived or a subscriber is paused.

New reservations evaluate current eligibility. Historical validation checks internal receipt consistency and references, not today's availability. Confusing these checks could make old records unreadable just because a plan was archived. Delete guards preserve referenced items, plans and subscribers. Use status changes when history must remain.

## Preferences are rules before scores

An item must be active, in stock, and free of the subscriber's excluded tags before it enters recommendations or a quote. Exclusion is a hard eligibility rule, not a small score penalty. Preferred-tag matches and ratings then order the eligible candidates. Scores are ranking values, not percentages or measured prediction accuracy. Matching uses the provided catalog tags and does not infer missing product metadata.

## Concurrency control is whole-workspace

`commit` (`src/repository.js:11-24`) runs inside a Web Lock and, for anything that is not a replayed reservation, compares the raw stored string with the raw string the tab started from. Any accepted write changes those bytes. So the check is optimistic concurrency on the **entire workspace**, not on the record being edited:

- In the last-unit test, the losing reservation is rejected by the baseline comparison ("Workspace changed in another tab") before `reduce` ever looks at stock. The stock rule is still enforced by `reduce`, but in that race it never gets the chance.
- Two operators editing unrelated records conflict just the same. Record `version` values exist, but the repository rejects on the coarser signal first.
- Only reservations are idempotent. `replay` returns early for every other command type (`src/model.js:430`), so a lost acknowledgement on a save or a lifecycle transition turns the retry into a misleading "changed in another tab" error even though the write landed (Practice Exercise 5 reproduces it).

That is a defensible choice for a single-operator local tool — it is simple and never merges blindly — but it is the first thing to change before several people share one workspace.

## Concurrency is separate from authentication

Web Locks serialize cooperating same-origin writers. Raw baseline comparison rejects drafts based on older storage, including an older workspace later replaced by import. Record versions explain which edition was edited; the workspace revision counts accepted aggregate changes.

None of this authenticates a user. Developer tools or another script can bypass the repository. A deployed CRUD app needs server-side identity, authorization, database transactions, and operational recovery. Study [the executable cases](../test/model.test.mjs) as contracts you could carry across that boundary, not as proof that browser storage is a production database.

## Glossary, with the symbol that embodies each term

| term | one line | in `src/model.js` |
|---|---|---|
| aggregate | the whole state validated and replaced as one value | `validateState`, `encode`/`decode` |
| candidate | the next state, computed but not yet accepted | the return value of `reduce` before the repository writes it |
| baseline | the raw stored string the tab last read; compared with current storage inside the lock before writing | `commit` and `restore` in `repository.js` (not used by `replay`) |
| fingerprint | a canonical `JSON.stringify` of the cycle plus every accepted quote fact (not a hash), so equal requests compare equal | `fingerprint(cycle, q)` |
| request key | the caller-chosen id of one reservation attempt, so a retry finds its receipt | `requestKey` on reserve commands and shipments, checked by `replay`; unique across shipments in `validateState` |
| revision | the aggregate's counter, bumped on every accepted write | `validateState` (`revision`), `reduce` |
| version | one record's counter, bumped when that record changes | `version(v)` on items/plans/subscribers |
| snapshot / line | the accepted copy of item facts frozen into a shipment line | `quoteBox` output lines |
| reducer | `(state, command) -> state`, pure, the only way state changes | `reduce` |
| replay | returning the stored receipt for a repeated request key | `replay` |
| available stock | the `stock` field itself: decremented on reserve, incremented on cancel; there is no separate on-hand count | `reduce` (reserve and Cancelled branches), checked by `eligible` |
| Web Lock | the browser lock that serializes one tab's write against another's | `browserLock` → `navigator.locks.request` in `repository.js` |
| cycle | the month a box belongs to; part of the fingerprint | `month(v)` |
| eligibility | the rules a subscriber's preferences impose before scoring | `eligible`, `recommendations` |
| money | integer cents, parsed from a bounded decimal string | `parseMoney`, `money` |

