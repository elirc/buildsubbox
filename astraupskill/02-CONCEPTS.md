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

## Concurrency is separate from authentication

Web Locks serialize cooperating same-origin writers. Raw baseline comparison rejects drafts based on older storage, including an older workspace later replaced by import. Record versions explain which edition was edited; the workspace revision describes aggregate changes.

None of this authenticates a user. Developer tools or another script can bypass the repository. A deployed CRUD app needs server-side identity, authorization, database transactions, and operational recovery. Study [the executable cases](../test/model.test.mjs) as contracts you could carry across that boundary, not as proof that browser storage is a production database.

## Glossary, with the symbol that embodies each term

| term | one line | in `src/model.js` |
|---|---|---|
| aggregate | the whole state validated and replaced as one value | `validateState`, `encode`/`decode` |
| candidate | the next state, computed but not yet accepted | the return value of `reduce` before the repository writes it |
| baseline | the raw stored string the tab last read; compared before writing | `repository.js` (baseline compare), used by `replay` |
| fingerprint | a hash of a quote's meaningful content, so equal quotes are one quote | `fingerprint(cycle, q)` |
| request key | the caller-chosen id of one attempt, so a retry finds its receipt | `requestKey` on orders, checked by `replay` |
| revision | the aggregate's counter, bumped on every accepted write | `validateState` (`revision`), `reduce` |
| version | one record's counter, bumped when that record changes | `version(v)` on items/plans/subscribers |
| snapshot / line | the accepted copy of item facts frozen into a shipment line | `quoteBox` output lines |
| reducer | `(state, command) -> state`, pure, the only way state changes | `reduce` |
| replay | returning the stored receipt for a repeated request key | `replay` |
| available stock | on-hand minus what accepted lines have reserved | `eligible`, `quoteBox` |
| Web Lock | the browser lock that serializes one tab's write against another's | `navigator.locks` in `repository.js` |
| cycle | the month a box belongs to; part of the fingerprint | `month(v)` |
| eligibility | the rules a subscriber's preferences impose before scoring | `eligible`, `recommendations` |
| money | integer cents, parsed from a bounded decimal string | `parseMoney`, `money` |

