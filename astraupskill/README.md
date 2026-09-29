# ParcelPilot: a subscription-box CRUD workshop

Buildsubbox runs as ParcelPilot, a local operations application for fictional subscription boxes. You can manage inventory, plans, subscribers and ratings, assemble a monthly box, reserve stock, and advance its shipment record. The central lesson is preserving an accepted business operation while the catalog, user interface, and other browser tabs keep changing.

The original prototype had useful visual design and a preference-scoring concept, but state disappeared on reload. Reservation subtracted a hard-coded 1,842 units from every selected item and clamped the result to zero. Repeated batch clicks created unrelated shipment IDs. Billing and notification messages described effects that did not occur. The revised application implements an explicit local reservation workflow and removes those unsupported operational claims.

## Get started

From this project root, use Node 22.12 or newer compatible with the package engine. Verification used Node 22.16.0.

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run dev
```

Open `http://127.0.0.1:5181`. Keep using that exact origin. `localhost`, another port, another browser profile, or a private window has separate storage. A fresh sample workspace at a different origin is not proof that your earlier records disappeared.

Start with Maya Chen's fictional subscription. Open Box builder, choose a month, and fill from recommendations. Review the exact plan item count and selected products. Reserve the box, then inspect the shipment receipt. The application deducts one unit per selected item and persists that change together with the new cycle record. No payment, carrier booking, or email occurs.

Cancel a reservation before dispatch and verify that stock returns once. Its subscriber-month record remains in history, so another request cannot create a second box for the same month. This is a deliberate business policy; replacement shipments for the same cycle are an extension exercise.

## Learning route

1. Use [the codebase map](01-CODEBASE-MAP.md) to trace form input through the repository and model.
2. Study [the concepts](02-CONCEPTS.md), then reproduce [the worked reservation](03-WORKED-CHANGE.md).
3. Run [tests and debugging drills](04-TESTING-AND-DEBUGGING.md), especially the stale-tab and lost-acknowledgement cases.
4. Attempt [the practice ladder](05-PRACTICE.md) before reading [solution sketches](06-SOLUTIONS-AND-REVIEW.md).
5. Complete [the trace lab](07-TRACE-LAB.md) and compare your conclusions with [verification limits](VERIFICATION.md).

A junior milestone is adding a validated field across form, model and backup format. A mid-level milestone is explaining transaction scope, lifecycle invariants, idempotency, historical snapshots, and recovery after an uncertain result. Spend time predicting failures before running the tests. That habit is more useful than memorizing component names.

## Protect your learning data

Export a complete workspace backup before schema experiments. Editor exports and operation exports are reference documents for manual review; they are not importable workspace backups. Editors, selected box items, tracking drafts and frozen attempts remain in tab memory and are cleared by an explicitly confirmed reload.

Use fictional subscriber addresses and emails. Browser storage is not an authentication boundary. Original documentation remains under `docs/upskill` as historical context. The new course describes implemented behavior and calls out extensions separately, so you can distinguish a working local operation from a proposed production system.

Practice exercise 5 has a worked target: [08-SERVER-COMPANION.md](08-SERVER-COMPANION.md) (Express + SQLite with `Idempotency-Key`, a unique constraint per cycle and a compare-and-set stock update, mapped line by line onto `reduce`/`replay`).
