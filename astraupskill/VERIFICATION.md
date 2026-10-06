# Verification and limits

The implementation is checked by pure domain/storage assertions, a production build, and disposable Chromium workflows. Generated logs (`.verification/`, ignored by Git) and the committed screenshots under `images/` are separate from operational browser storage.

## What to run

From the project root, run `npm.cmd test` and `npm.cmd run build`. The 36 domain and repository tests produce `.verification/unit-results.json` and `.verification/unit.log`. The optional [browser verifier](../scripts/verify_browser.py) has 18 user-workflow scenarios (count the `run('...')` calls). Setup and environment options are documented in [testing and debugging](04-TESTING-AND-DEBUGGING.md).

Fast cases cover all three catalog entity types, reference and range checks, normalized unique subscriber email, rating edits, eligibility rules, exact item counts, immutable receipt facts, one-unit stock reservations, once-only cancellation, lifecycle versions, request replay, subscriber-month uniqueness, corrupt-data recovery, and stale baselines. The last-unit test accepts one complete competing reservation. Another adapter writes successfully and then throws to test uncertain acknowledgement.

Browser scenarios exercise actual forms, localStorage, separate tabs, downloads, rating controls, stock persistence, cancellation, tracking, duplicate cycles, immutable contents, retained drafts, pagination, reviewed import, and desktop/tablet/phone layouts. Contexts are disposable, and the verifier owns its preview process. It refuses to reuse an occupied port and does not stop unrelated servers.

## Simulation boundary

The app has no authentication, authorization, server API, SQL database, payment provider, recurring scheduler, tax engine, email service, carrier booking, tracking lookup, physical inventory count, or return workflow. Shipment statuses are local records. Recording a tracking reference does not dispatch a parcel. Cancellation returns locally reserved units but requests no financial refund.

The subscriber-month uniqueness policy includes cancelled history. Same-cycle replacements and a dedicated skip ledger are exercises, not implemented features. Manual stock adjustments update available counts and versions without a complete stock-movement journal. Recommendation scores use supplied tags and ratings; they are not probabilities and do not infer absent metadata.

## Persistence boundary

The aggregate is bounded to four MiB, one thousand items, one hundred plans, one thousand subscribers, and two thousand shipments. Each accepted change rewrites one document. Web Locks coordinate cooperating same-origin writers only. Browser-profile access or another script can bypass these rules. The tests do not certify power-loss durability, every browser engine, complete accessibility, or production deployment hardening.

Editors, builder selections, tracking drafts and frozen requests remain in tab memory. Exports preserve reference material for manual review; automatic draft import and durable attempt resumption are not implemented. A complete backup can replace the workspace only after review and confirmation, and may remove current records absent from that file. Corrupt original bytes remain available for export until explicit replacement.

The older [upskilling tree](../docs/upskill/README.md) described the pre-rewrite prototype; as of 2026-10-06 its pages are pointers into this course, with the original text in git history. Update these limits alongside any extension that introduces new state, external effects, or operational recovery requirements.

## Completed run (original delivery, September 2026)

All 36 domain/storage tests and all 18 Chromium scenarios passed, and the production Vite build passed. Seven screenshots were reviewed: [desktop overview](images/overview-1440.png), [desktop editor](images/editor-1440.png), [tablet overview](images/overview-800.png), [tablet editor](images/editor-800.png), [phone overview](images/overview-390.png), [phone editor](images/editor-390.png), and [phone box builder](images/builder-390.png). Browser review led to explicit catalog selector names and removal of the obsolete metric icon column; final layout checks include non-overlapping metric labels and values.

## Documentation refresh (2026-10-06)

Re-checked from a fresh clone on Node 22.16.0 with no `npm install`: `node scripts/test.mjs` → `# tests 36`, `# pass 36`, `# fail 0`. The build and the Chromium verifier were not re-run. Exercises 1–5 in [05-PRACTICE.md](05-PRACTICE.md) were run against the unmodified source (Exercise 1's command prints the nine scores quoted there; the Exercise 4 assertion and the Exercise 5 characterization test pass), and the solutions for Exercises 2, 3 and 5 in [06-SOLUTIONS-AND-REVIEW.md](06-SOLUTIONS-AND-REVIEW.md) were applied together to a scratch copy: 39 tests, 39 passed. No source file in this repo was changed by the refresh.
